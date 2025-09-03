import { appState } from "../../state.js";
import { formatCurrency } from "../../utils/index.js";
import { updateDashboard } from "../../ui/index.js";
import {
  setTodayToAllDateInputs,
  formatDateBR,
  toISODateLocal,
  parseISODateLocal,
} from "../../utils/index.js";
import { fetchCurrentPrice } from "../../services/index.js";
import {
  applyBuyToPortfolio,
  applySellToPortfolio,
  revertBuyFromPortfolio,
  revertSellFromPortfolio,
} from "../../services/index.js";
import { showDateModal } from "../../ui/index.js";

// Variáveis para armazenar datas personalizadas (escopo global do módulo)
let customStartDate = null;
let customEndDate = null;

const addOperationRow = (operation) => {
  const operationsList = document.getElementById("operations-list");
  if (!operationsList) return;

  if (appState.operations.length === 1) {
    operationsList.innerHTML = "";
  }
  const row = operationsList.insertRow(-1);
  row.className = "hover:bg-gray-50";
  row.innerHTML = `
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${formatDateBR(
          operation.date
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${
          operation.assetSymbol
        }</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 capitalize">${
          operation.operationType
        }</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${
          operation.quantity
        }</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${formatCurrency(
          operation.entryValue
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${formatCurrency(
          operation.operationFees
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${formatCurrency(
          operation.entryValue * operation.quantity + operation.operationFees
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm font-semibold text-center ${
          operation.result >= 0 ? "text-green-600" : "text-red-600"
        }">${formatCurrency(operation.result)}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
          <button data-action="edit" data-id="${
            operation.id
          }" class="mr-3" aria-label="Editar" title="Editar">
            <img src="src/assets/icons/edit.svg" class="h-5 w-5 text-blue-600 hover:text-blue-800" alt="Editar">
          </button>
          <button data-action="delete" data-id="${
            operation.id
          }" aria-label="Excluir" title="Excluir">
            <img src="src/assets/icons/delete.svg" class="h-5 w-5 text-red-600 hover:text-red-800" alt="Excluir">
          </button>
        </td>
    `;

  row
    .querySelector('[data-action="delete"]')
    .addEventListener("click", async () => {
      const { confirmDialog } = await import("../../ui/index.js");
      const ok = await confirmDialog({
        title: "Excluir operação",
        message:
          "Tem certeza que deseja excluir esta operação? Esta ação é definitiva.",
        confirmText: "Excluir",
        cancelText: "Cancelar",
      });
      if (!ok) return;
      const idx = appState.operations.findIndex((o) => o.id === operation.id);
      if (idx >= 0) {
        // Reverter efeito na carteira/saldo
        const prev = appState.operations[idx];
        if (prev.operationType === "compra") {
          revertBuyFromPortfolio({
            symbol: prev.assetSymbol,
            quantity: prev.quantity,
            pricePerUnit: prev.entryValue,
            brokerage: prev.operationFees,
          });
        } else {
          revertSellFromPortfolio({
            symbol: prev.assetSymbol,
            quantity: prev.quantity,
            pricePerUnit: prev.entryValue,
            brokerage: prev.operationFees,
          });
        }
        // Remover da lista e atualizar UI
        appState.operations.splice(idx, 1);
        row.remove();
        updateDashboard();
        import("../../ui/index.js").then((m) => {
          m.renderPortfolio();
          m.updateCentralKpisByTab?.();
        });
        // Notificar para impostos recalcularem
        document.dispatchEvent(new Event("operations:changed"));
      }
    });

  row.querySelector('[data-action="edit"]').addEventListener("click", () => {
    // Preenche o formulário com os dados para edição rápida e marca o modo edição
    const form = document.getElementById("swing-form");
    form.dataset.editingId = String(operation.id);
    document.getElementById("asset-symbol").value = operation.assetSymbol;
    document.getElementById("operation-type").value = operation.operationType;
    document.getElementById("entry-value").value = operation.entryValue;
    document.getElementById("quantity").value = operation.quantity;
    document.getElementById("brokerage-fees").value = operation.operationFees;
    document.getElementById("observations").value =
      operation.observations || "";

    // Reverter imediatamente o efeito financeiro da operação antiga
    if (operation.operationType === "compra") {
      revertBuyFromPortfolio({
        symbol: operation.assetSymbol,
        quantity: operation.quantity,
        pricePerUnit: operation.entryValue,
        brokerage: operation.operationFees,
      });
    } else {
      revertSellFromPortfolio({
        symbol: operation.assetSymbol,
        quantity: operation.quantity,
        pricePerUnit: operation.entryValue,
        brokerage: operation.operationFees,
      });
    }
    updateDashboard();
    import("../../ui/index.js").then((m) => {
      m.renderPortfolio();
      m.updateCentralKpisByTab?.();
    });
    // Recalcular impostos e outros dependentes
    document.dispatchEvent(new Event("operations:changed"));

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = "Editar Operação";
      btn.classList.remove("bg-blue-500", "hover:bg-blue-600");
      btn.classList.add("bg-orange-500", "hover:bg-orange-600");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

export const renderOperationsSwingTrade = () => {
  const operationsList = document.getElementById("operations-list");
  if (!operationsList) return;
  operationsList.innerHTML = "";
  const periodSel = document.getElementById("swing-period");
  const period = periodSel ? periodSel.value : "todos";
  const assetFilter = (
    document.getElementById("swing-filter-asset")?.value || ""
  )
    .trim()
    .toUpperCase();
  const orderBtn = document.getElementById("swing-order-toggle");
  const direction =
    orderBtn?.getAttribute("data-order") === "asc" ? "asc" : "desc";

  // Ordenação controlada por código
  const now = new Date();
  let start = new Date(now);
  let end = now;

  if (period === "dia") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "semana") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1; // segunda como início
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
      // Quando não há data final, usar a data atual
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else {
      // Se não tiver datas, mostrar todos
      start.setTime(0);
    }
  } else {
    // "todos" - mostrar tudo
    start.setTime(0);
  }

  const rows = (appState.operations || []).filter((op) => {
    const raw = op.date;
    const d =
      raw instanceof Date
        ? raw
        : typeof raw === "string" && raw.includes("T")
        ? new Date(raw)
        : parseISODateLocal(raw);
    const inRange = d >= start && d <= end;
    const matchAsset = assetFilter
      ? String(op.assetSymbol || "")
          .toUpperCase()
          .includes(assetFilter)
      : true;
    return inRange && matchAsset;
  });

  // Atualiza totais sempre (mesmo com lista vazia)
  try {
    const totalOps = rows.length || 0;
    const totalFees = rows.reduce(
      (sum, op) => sum + (op.operationFees || 0),
      0
    );
    const totalResult = rows.reduce((sum, op) => sum + (op.result || 0), 0);

    const opsEl = document.getElementById("swing-total-ops");
    const feesEl = document.getElementById("swing-total-fees");
    const resultEl = document.getElementById("swing-total-result");

    if (opsEl) opsEl.textContent = String(totalOps);
    if (feesEl) feesEl.textContent = formatCurrency(totalFees);
    if (resultEl) {
      resultEl.textContent = formatCurrency(totalResult);
      resultEl.className = totalResult >= 0 ? "text-green-600" : "text-red-600";
    }
  } catch (_) {}

  if (!rows || rows.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="9" class="py-4 px-4 text-center text-gray-500">Nenhuma operação registrada ainda.</td>`;
    operationsList.appendChild(row);
    return;
  }

  // Ordena por data (asc/desc) e, em empate, por sequência (id asc/desc)
  [...rows]
    .slice()
    .sort((a, b) => {
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
      const ia = Number(a.id || 0);
      const ib = Number(b.id || 0);
      return direction === "asc" ? ia - ib : ib - ia;
    })
    .forEach((op) => addOperationRow(op));
};

export const wireOperationsSwingTrade = () => {
  const form = document.getElementById("swing-form");
  if (!form) return;

  // listeners de ganho relativo removidos do fluxo atual

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn?.setAttribute("disabled", "true");
    submitBtn?.classList.add("opacity-60", "cursor-not-allowed");

    const opDate = document.getElementById("op-date").value;
    const opTime = "00:00";
    const assetSymbol = document
      .getElementById("asset-symbol")
      .value.toUpperCase();
    const operationType = document.getElementById("operation-type").value;
    const entryValue = parseFloat(
      document
        .getElementById("entry-value")
        .value.replace(/\./g, "")
        .replace(",", ".")
    );
    const quantity = parseInt(document.getElementById("quantity").value);
    const riskPercent = 0;
    const operationFees = parseFloat(
      document
        .getElementById("brokerage-fees")
        .value.replace(/\./g, "")
        .replace(",", ".") || "0"
    );

    // valida saldo suficiente para compra
    if (operationType === "compra") {
      const required = quantity * entryValue + operationFees;
      if (appState.balance < required) {
        const { showMessage } = await import("../../ui/index.js");
        showMessage(
          `Saldo insuficiente: necessário ${formatCurrency(
            required
          )} e disponível ${formatCurrency(appState.balance)}.`,
          "error"
        );
        submitBtn?.removeAttribute("disabled");
        submitBtn?.classList.remove("opacity-60", "cursor-not-allowed");
        return;
      }
    }
    const stopLoss = undefined;
    const targetPrice = undefined;
    const observations = document.getElementById("observations").value;

    let result = 0;
    let currentPriceUsed = entryValue;
    try {
      const { price: currentPrice } = await fetchCurrentPrice(assetSymbol);
      currentPriceUsed = currentPrice;
    } catch (err) {
      const { showMessage } = await import("../../ui/index.js");
      showMessage(
        "Não foi possível obter a cotação atual. Usando preço de entrada como referência.",
        "info"
      );
    }
    const pnlPerUnit =
      (currentPriceUsed - entryValue) * (operationType === "compra" ? 1 : -1);
    result = pnlPerUnit * quantity - operationFees;

    const gainRelative = 0;

    const currentEditingId = Number(form.dataset.editingId || "") || null;
    const newOperation = {
      id: currentEditingId ?? Date.now(),
      date: `${opDate}T${opTime}`,
      assetSymbol,
      operationType,
      entryValue,
      quantity,
      riskPercent,
      gainRelative,
      stopLoss,
      targetPrice,
      operationFees,
      observations,
      result,
    };

    // Confirmação antes de registrar/editar
    try {
      const { confirmDialog } = await import("../../ui/index.js");
      const totalOp = entryValue * quantity + operationFees;
      const ok = await confirmDialog({
        title: currentEditingId ? "Confirmar edição" : "Confirmar registro",
        message:
          `Deseja ${
            currentEditingId ? "editar" : "registrar"
          } esta operação?\n\n` +
          `Ativo: ${assetSymbol}\n` +
          `Tipo: ${operationType}\n` +
          `Qtd: ${quantity}\n` +
          `Entrada: ${formatCurrency(entryValue)}\n` +
          `Corretagem: ${formatCurrency(operationFees)}\n` +
          `Total Op.: ${formatCurrency(totalOp)}`,
        confirmText: currentEditingId ? "Salvar" : "Registrar",
        cancelText: "Cancelar",
      });
      if (!ok) {
        submitBtn?.removeAttribute("disabled");
        submitBtn?.classList.remove("opacity-60", "cursor-not-allowed");
        return;
      }
    } catch (_) {}

    if (currentEditingId) {
      const idx = appState.operations.findIndex(
        (o) => o.id === currentEditingId
      );
      if (idx >= 0) appState.operations[idx] = newOperation;
      delete form.dataset.editingId;
    } else {
      appState.operations.push(newOperation);
    }

    // Atualiza carteira e saldo (fluxo de caixa)
    if (operationType === "compra") {
      applyBuyToPortfolio({
        symbol: assetSymbol,
        quantity,
        pricePerUnit: entryValue,
        brokerage: operationFees,
      });
    } else {
      applySellToPortfolio({
        symbol: assetSymbol,
        quantity,
        pricePerUnit: entryValue,
        brokerage: operationFees,
      });
    }

    // Sanitiza posições para evitar itens com quantidade 0
    import("../../services/index.js").then((m) => m.sanitizeHoldings?.());

    const list = document.getElementById("operations-list");
    if (list) list.innerHTML = "";
    [...appState.operations]
      .slice()
      .reverse()
      .forEach((op) => addOperationRow(op));
    document.dispatchEvent(new Event("operations:changed"));
    form.reset();
    // reatribui datas com timezone-safe
    try {
      document.getElementById("op-date").value = toISODateLocal();
    } catch (_) {}
    updateDashboard();
    import("../../ui/index.js").then((m) => {
      m.renderPortfolio();
      m.updateCentralKpisByTab?.();
    });

    submitBtn?.removeAttribute("disabled");
    submitBtn?.classList.remove("opacity-60", "cursor-not-allowed");
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = "Registrar Operação (Swing)";
      btn.classList.remove("bg-orange-500", "hover:bg-orange-600");
      btn.classList.add("bg-blue-500", "hover:bg-blue-600");
    }
    // Devolver foco ao campo de ativo após registrar
    try {
      setTimeout(() => document.getElementById("asset-symbol")?.focus(), 0);
    } catch (_) {}
  });

  import("../../services/index.js").then(({ saveState }) => {
    document.addEventListener("operations:changed", () => saveState(appState));
  });

  // listeners de filtros -> re-render
  try {
    document
      .getElementById("swing-start-date")
      ?.addEventListener("change", () => renderOperationsSwingTrade());
    document
      .getElementById("swing-end-date")
      ?.addEventListener("change", () => renderOperationsSwingTrade());
    document
      .getElementById("swing-filter-asset")
      ?.addEventListener("change", () => renderOperationsSwingTrade());
    const swingPeriodSelect = document.getElementById("swing-period");

    // Evento change para quando o valor muda
    swingPeriodSelect?.addEventListener("change", () => {
      const period = swingPeriodSelect.value;

      if (period === "personalizado") {
        showDateModal(swingPeriodSelect, (dates) => {
          customStartDate = dates.startDate;
          customEndDate = dates.endDate;
          renderOperationsSwingTrade();
        });
      } else {
        // Limpar datas personalizadas
        customStartDate = null;
        customEndDate = null;
        renderOperationsSwingTrade();
      }
    });

    // Evento click para quando clica no select que já tem "personalizado"
    swingPeriodSelect?.addEventListener("click", (e) => {
      const period = swingPeriodSelect.value;

      if (period === "personalizado") {
        // Prevenir que o dropdown abra
        e.preventDefault();
        e.stopPropagation();

        showDateModal(swingPeriodSelect, (dates) => {
          customStartDate = dates.startDate;
          customEndDate = dates.endDate;
          renderOperationsSwingTrade();
        });
      }
    });
  } catch (_) {}

  // Toggle de ordenação
  try {
    document
      .getElementById("swing-order-toggle")
      ?.addEventListener("click", () => {
        const btn = document.getElementById("swing-order-toggle");
        if (!btn) return;
        const current = btn.getAttribute("data-order") || "desc";
        const next = current === "desc" ? "asc" : "desc";
        btn.setAttribute("data-order", next);
        renderOperationsSwingTrade();
      });
  } catch (_) {}
};
