import { appState } from "../state.js";
import { updateDashboard } from "../ui/dashboard.js";
import { showMessage } from "../ui/messages.js";
import { formatCurrency } from "../utils/format.js";
import {
  formatDateBR,
  toISODateLocal,
  parseISODateLocal,
} from "../utils/dates.js";
import { showDateModal } from "../ui/dateModal.js";

// Variáveis para armazenar datas personalizadas (escopo global do módulo)
let customStartDate = null;
let customEndDate = null;

export const renderOperationsFinanceiras = () => {
  const capitalList = document.getElementById("capital-list");
  if (!capitalList) return;
  capitalList.innerHTML = "";
  const periodSel = document.getElementById("capital-period");
  const period = periodSel ? periodSel.value : "todos";
  const orderBtn = document.getElementById("capital-order-toggle");
  const direction =
    orderBtn?.getAttribute("data-order") === "asc" ? "asc" : "desc";

  const now = new Date();
  let start = new Date(now);
  let end = now;

  if (period === "dia") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "semana") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
  } else if (period === "mes") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "personalizado") {
    // Usar datas do modal
    if (customStartDate && customEndDate) {
      start = parseISODateLocal(customStartDate);
      start.setHours(0, 0, 0, 0);
      end = parseISODateLocal(customEndDate);
      end.setHours(23, 59, 59, 999);
    } else if (customStartDate) {
      start = parseISODateLocal(customStartDate);
      start.setHours(0, 0, 0, 0);
    } else {
      // Se não tiver datas, mostrar todos
      start.setTime(0);
    }
  } else {
    // "todos" - mostrar tudo
    start.setTime(0);
  }
  const rows = (appState.capitalTransactions || []).filter((tx) => {
    const raw = tx.date;
    const d =
      raw instanceof Date
        ? raw
        : typeof raw === "string" && raw.includes("T")
        ? new Date(raw)
        : parseISODateLocal(raw);
    return d >= start && d <= end;
  });
  // Atualiza totais sempre (mesmo com lista vazia)
  try {
    const totalIn = rows
      .filter((tx) => tx.value > 0)
      .reduce((sum, tx) => sum + tx.value, 0);
    const totalOut = rows
      .filter((tx) => tx.value < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.value), 0);
    const totalBalance = rows.reduce((sum, tx) => sum + tx.value, 0);

    const inEl = document.getElementById("capital-total-in");
    const outEl = document.getElementById("capital-total-out");
    const balanceEl = document.getElementById("capital-total-balance");

    if (inEl) inEl.textContent = formatCurrency(totalIn);
    if (outEl) outEl.textContent = formatCurrency(totalOut);
    if (balanceEl) {
      balanceEl.textContent = formatCurrency(totalBalance);
      balanceEl.className =
        totalBalance >= 0 ? "text-green-600" : "text-red-600";
    }
  } catch (_) {}
  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="py-4 px-4 text-center text-gray-500">Nenhum lançamento ainda.</td>`;
    capitalList.appendChild(row);
    return;
  }
  // Ordena por data (asc/desc) e, em empate, por sequência (id asc/desc)
  for (const tx of [...rows].slice().sort((a, b) => {
    const da =
      typeof a.date === "string" && !a.date.includes("T")
        ? parseISODateLocal(a.date)
        : new Date(a.date);
    const db =
      typeof b.date === "string" && !b.date.includes("T")
        ? parseISODateLocal(b.date)
        : new Date(b.date);
    const byDate = direction === "asc" ? da - db : db - da;
    if (byDate !== 0) return byDate;
    const ia = Number(a.id ?? Date.parse(a.date) ?? 0);
    const ib = Number(b.id ?? Date.parse(b.date) ?? 0);
    return direction === "asc" ? ia - ib : ib - ia;
  })) {
    const row = document.createElement("tr");
    const date = formatDateBR(tx.date);
    const typeLabel =
      tx.type === "deposito"
        ? "Depósito"
        : tx.type === "saque"
        ? "Saque"
        : tx.type === "taxa"
        ? "Taxa"
        : "Outros";
    row.innerHTML = `
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${date}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${typeLabel}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${
        tx.description || "-"
      }</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-center ${
        tx.value >= 0 ? "text-green-600" : "text-red-600"
      }">${formatCurrency(tx.value)}</td>
    `;
    capitalList.appendChild(row);
  }
};

export const wireOperationsFinanceiras = () => {
  const unifiedForm = document.getElementById("capital-unified-form");
  const capitalList = document.getElementById("capital-list");

  const appendRow = (date, type, description, value) => {
    if (!capitalList) return;
    if (
      capitalList.children.length === 1 &&
      capitalList.children[0].querySelector("[colspan]")
    ) {
      capitalList.innerHTML = "";
    }
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${formatDateBR(
        date
      )}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${type}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${
        description || "-"
      }</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${formatCurrency(
        value
      )}</td>
    `;
    // Inserir no final e manter render invertido no re-render completo
    capitalList.appendChild(row);
  };

  unifiedForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("cap-date").value || toISODateLocal();
    const type = document.getElementById("cap-type").value;
    const rawValue = parseFloat(document.getElementById("cap-value").value);
    const desc = document.getElementById("cap-desc").value || null;

    if (!(rawValue > 0)) {
      showMessage("O valor deve ser maior que zero.", "error");
      return;
    }

    if (type === "saque" && rawValue > (appState.balance || 0)) {
      showMessage(
        `Saldo insuficiente para saque. Disponível: ${formatCurrency(
          appState.balance || 0
        )}.`,
        "error"
      );
      return;
    }

    const value = type === "deposito" ? rawValue : -rawValue;

    try {
      const { confirmDialog } = await import("../ui/dialogs.js");
      const ok = await confirmDialog({
        title: "Confirmar lançamento",
        message:
          `Tipo: <b>${type}</b><br/>Valor: <b>${formatCurrency(value)}</b>` +
          (desc ? `<br/>Descrição: ${desc}` : ""),
        confirmText: "Confirmar",
        cancelText: "Cancelar",
        variant:
          type === "deposito" ? "success" : value < 0 ? "danger" : "info",
      });
      if (!ok) return;
    } catch (_) {}

    appState.balance += value;
    appState.capitalTransactions = appState.capitalTransactions || [];
    appState.capitalTransactions.push({
      id: Date.now(),
      date,
      type,
      description: desc,
      value,
    });
    updateDashboard();
    // Re-render completo para respeitar o filtro de período ativo
    renderOperationsFinanceiras();
    import("../services/storage/index.js").then(({ saveState }) =>
      saveState(appState)
    );
    document.dispatchEvent(new Event("capital:changed"));
    unifiedForm.reset();
    try {
      document.getElementById("cap-date").value = toISODateLocal();
    } catch (_) {}
    showMessage("Lançamento registrado!", "success");
  });

  // re-render ao trocar período
  try {
    const capitalPeriodSelect = document.getElementById("capital-period");

    // Evento change para quando o valor muda
    capitalPeriodSelect?.addEventListener("change", () => {
      const period = capitalPeriodSelect.value;

      if (period === "personalizado") {
        showDateModal(capitalPeriodSelect, (dates) => {
          customStartDate = dates.startDate;
          customEndDate = dates.endDate;
          renderOperationsFinanceiras();
        });
      } else {
        // Limpar datas personalizadas
        customStartDate = null;
        customEndDate = null;
        renderOperationsFinanceiras();
      }
    });

    // Evento click para quando clica no select que já tem "personalizado"
    capitalPeriodSelect?.addEventListener("click", (e) => {
      const period = capitalPeriodSelect.value;

      if (period === "personalizado") {
        // Prevenir que o dropdown abra
        e.preventDefault();
        e.stopPropagation();

        showDateModal(capitalPeriodSelect, (dates) => {
          customStartDate = dates.startDate;
          customEndDate = dates.endDate;
          renderOperationsFinanceiras();
        });
      }
    });
    document
      .getElementById("capital-start-date")
      ?.addEventListener("change", () => renderOperationsFinanceiras());
    document
      .getElementById("capital-end-date")
      ?.addEventListener("change", () => renderOperationsFinanceiras());

    document
      .getElementById("capital-order-toggle")
      ?.addEventListener("click", () => {
        const btn = document.getElementById("capital-order-toggle");
        if (!btn) return;
        const current = btn.getAttribute("data-order") || "desc";
        const next = current === "desc" ? "asc" : "desc";
        btn.setAttribute("data-order", next);
        renderOperationsFinanceiras();
      });
  } catch (_) {}
};
