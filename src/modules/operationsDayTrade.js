import { appState } from "../state.js";
import { updateDashboard } from "../ui/dashboard.js";
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

export const renderOperationsDayTrade = () => {
  const list = document.getElementById("daytrade-list");
  if (!list) return;
  list.innerHTML = "";
  const periodSel = document.getElementById("daytrade-period");
  const period = periodSel ? periodSel.value : "todos";
  const assetFilter = (
    document.getElementById("daytrade-filter-asset")?.value || ""
  )
    .trim()
    .toUpperCase();
  const orderBtn = document.getElementById("daytrade-order-toggle");
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
      // Quando não há data final (customEndDate é null), incluir até o final do dia da data inicial
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    } else {
      // Se não tiver datas, mostrar todos
      start.setTime(0);
    }
  } else {
    // "todos" - mostrar tudo
    start.setTime(0);
  }

  const rows = (appState.dayTradeOperations || []).filter((op) => {
    // Normalizar a data da operação para comparação consistente
    let operationDate;
    if (op.date instanceof Date) {
      operationDate = new Date(op.date);
    } else if (typeof op.date === "string") {
      // Se for string ISO, criar Date diretamente
      operationDate = new Date(op.date);
    } else {
      // Fallback para parseISODateLocal
      operationDate = parseISODateLocal(op.date);
    }

    // Verificar se a data é válida
    if (!operationDate || isNaN(operationDate.getTime())) {
      return false;
    }

    // Converter para string YYYY-MM-DD para comparação simples
    const operationDateStr = operationDate.toISOString().split("T")[0];
    const startDateStr = start.toISOString().split("T")[0];
    const endDateStr = end.toISOString().split("T")[0];

    const inRange =
      operationDateStr >= startDateStr && operationDateStr <= endDateStr;

    const matchAsset = assetFilter
      ? String(op.assetSymbol || "")
          .toUpperCase()
          .includes(assetFilter)
      : true;
    return inRange && matchAsset;
  });
  // Atualiza totais sempre (mesmo com lista vazia)
  try {
    const totalOps = rows.length;
    const totalContracts = rows.reduce(
      (acc, r) => acc + Number(r.quantity || 0),
      0
    );
    const totalFees = rows.reduce((acc, r) => acc + Number(r.fees || 0), 0);
    const totalResult = rows.reduce((acc, r) => acc + Number(r.net || 0), 0);

    const opsEl = document.getElementById("dt-total-ops");
    const qtyEl = document.getElementById("dt-total-contracts");
    const feesEl = document.getElementById("dt-total-fees");
    const resultEl = document.getElementById("dt-total-result");

    if (opsEl) opsEl.textContent = String(totalOps);
    if (qtyEl) qtyEl.textContent = String(totalContracts);
    if (feesEl) feesEl.textContent = formatCurrency(totalFees);
    if (resultEl) {
      resultEl.textContent = formatCurrency(totalResult);
      resultEl.className = totalResult >= 0 ? "text-green-600" : "text-red-600";
    }
  } catch (_) {}

  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="8" class="py-4 px-4 text-center text-gray-500">Nenhum lançamento ainda.</td>`;
    list.appendChild(row);
    return;
  }
  // Ordenar por data (desc/asc) e, em caso de empate, por sequência (id desc/asc)
  for (const op of [...rows].slice().sort((a, b) => {
    // Normalizar datas para comparação consistente
    let da, db;

    if (a.date instanceof Date) {
      da = new Date(a.date);
    } else if (typeof a.date === "string") {
      da = new Date(a.date);
    } else {
      da = parseISODateLocal(a.date);
    }

    if (b.date instanceof Date) {
      db = new Date(b.date);
    } else if (typeof b.date === "string") {
      db = new Date(b.date);
    } else {
      db = parseISODateLocal(b.date);
    }

    // Verificar se as datas são válidas
    if (!da || isNaN(da.getTime())) da = new Date(0);
    if (!db || isNaN(db.getTime())) db = new Date(0);

    // Comparar usando timestamps para ordenação
    const byDate =
      direction === "asc"
        ? da.getTime() - db.getTime()
        : db.getTime() - da.getTime();
    if (byDate !== 0) return byDate;
    const ia = Number(a.id ?? Date.parse(a.date) ?? 0);
    const ib = Number(b.id ?? Date.parse(b.date) ?? 0);
    return direction === "asc" ? ia - ib : ib - ia;
  })) {
    addOperationRow(op);
  }

  // Remover chamada para atualizar ícone do botão
};

const addOperationRow = (operation) => {
  const operationsList = document.getElementById("daytrade-list");
  if (!operationsList) return;

  const row = document.createElement("tr");
  row.className = "hover:bg-gray-50";
  row.innerHTML = `
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${formatDateBR(
          operation.date
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
          ${operation.assetSymbol}
        </td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${formatCurrency(
          operation.gross
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${
          operation.quantity
        }</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${formatCurrency(
          operation.fees
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900 text-center">${formatCurrency(
          operation.brokerage
        )}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm font-semibold text-center ${
          operation.net >= 0 ? "text-green-600" : "text-red-600"
        }">${formatCurrency(operation.net)}</td>
        <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
          <button data-action="edit" data-id="${
            operation.id
          }" class="mr-3" aria-label="Editar" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 hover:text-blue-800" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.95 8.95a2 2 0 01-.878.497l-3.356.839a.5.5 0 01-.606-.606l.84-3.356a2 2 0 01.497-.878l8.95-8.95z" />
            </svg>
          </button>
          <button data-action="delete" data-id="${
            operation.id
          }" aria-label="Excluir" title="Excluir">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 hover:text-red-800" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2h.293l1.21 10.082A2 2 0 007.492 18h5.016a2 2 0 001.99-1.918L15.707 6H16a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm2 6a1 1 0 10-2 0v6a1 1 0 102 0V8z" clip-rule="evenodd" />
            </svg>
          </button>
        </td>
    `;

  operationsList.appendChild(row);

  row
    .querySelector('[data-action="delete"]')
    .addEventListener("click", async () => {
      const { confirmDialog } = await import("../ui/dialogs.js");
      const ok = await confirmDialog({
        title: "Excluir operação",
        message:
          "Tem certeza que deseja excluir esta operação? Esta ação é definitiva.",
        confirmText: "Excluir",
        cancelText: "Cancelar",
      });
      if (!ok) return;
      const idx = appState.dayTradeOperations.findIndex(
        (o) => o.id === operation.id
      );
      if (idx >= 0) {
        const prev = appState.dayTradeOperations[idx];
        appState.balance -= prev.net;
        appState.dayTradeOperations.splice(idx, 1);
        // Re-render completo para atualizar placeholder e totais
        renderOperationsDayTrade();
        updateDashboard();
        try {
          const { updateCentralKpisByTab } = await import("../ui/dashboard.js");
          // Usar setTimeout para garantir que seja executado após outras atualizações
          setTimeout(() => {
            updateCentralKpisByTab?.("daytrade");
          }, 200);
        } catch (_) {}
        document.dispatchEvent(new Event("capital:changed"));
        document.dispatchEvent(new Event("operations:changed"));
        import("../services/storage/index.js").then(({ saveState }) =>
          saveState(appState)
        );
      }
    });

  row.querySelector('[data-action="edit"]').addEventListener("click", () => {
    const form = document.getElementById("daytrade-form");
    form.dataset.editingId = String(operation.id);
    document.getElementById("dt-asset-symbol").value = operation.assetSymbol;
    // Preenche campos do layout atual
    document.getElementById("dt-gross-result").value = operation.gross;
    document.getElementById("dt-quantity").value = operation.quantity;
    document.getElementById("dt-operation-fees").value = operation.brokerage;
    document.getElementById("dt-observations").value =
      operation.observations || "";
    document.querySelector('[data-tab="daytrade"]').click();
    // Reverte efeito passado no saldo para editar corretamente
    appState.balance -= operation.net;
    updateDashboard();
    document.dispatchEvent(new Event("capital:changed"));

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = "Editar Operação";
      btn.classList.remove("bg-blue-500", "hover:bg-blue-600");
      btn.classList.add("bg-orange-500", "hover:bg-orange-600");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

export const wireOperationsDayTrade = () => {
  const form = document.getElementById("daytrade-form");
  if (!form) return;

  // Atualiza o campo Permitido por Trade (R$) com base no saldo e config
  const updateAllowed = async () => {
    const allowedEl = document.getElementById("dt-allowed-trade");
    if (!allowedEl) return;
    // reforça que não é editável e exibir como dinheiro com R$
    allowedEl.readOnly = true;
    allowedEl.removeAttribute("disabled");
    const percent = Number(appState.taxesConfig?.percentPerTrade || 0);
    const base = Number(appState.balance || 0);
    const allowed = (base * percent) / 100;
    const { formatCurrency } = await import("../utils/format.js");
    allowedEl.value = isFinite(allowed) ? formatCurrency(allowed) : "R$ 0,00";
  };
  // primeira atualização
  updateAllowed();
  // reagir a mudanças de saldo/config/ops
  document.addEventListener("capital:changed", updateAllowed);
  document.addEventListener("operations:changed", updateAllowed);
  document.addEventListener("config:changed", updateAllowed);
  // garantir atualização ao abrir a aba Day Trade
  try {
    const daytradeTabBtn = document.querySelector('[data-tab="daytrade"]');
    daytradeTabBtn?.addEventListener("click", () => {
      // pequeno atraso para permitir a troca de aba antes do cálculo
      setTimeout(() => updateAllowed(), 0);
    });
  } catch (_) {}
  // render inicial do extrato
  renderOperationsDayTrade();
  // re-render ao trocar período
  try {
    document
      .getElementById("daytrade-period")
      ?.addEventListener("change", () => renderOperationsDayTrade());
    document
      .getElementById("daytrade-filter-asset")
      ?.addEventListener("input", () => renderOperationsDayTrade());
    document
      .getElementById("daytrade-start-date")
      ?.addEventListener("change", () => renderOperationsDayTrade());
    document
      .getElementById("daytrade-end-date")
      ?.addEventListener("change", () => renderOperationsDayTrade());
    // Toggle do botão de ordenação (asc/desc) - removido duplicação
  } catch (_) {}

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn?.setAttribute("disabled", "true");
    submitBtn?.classList.add("opacity-60", "cursor-not-allowed");

    const opDate = document.getElementById("dt-date").value;
    const assetSymbol = document
      .getElementById("dt-asset-symbol")
      .value.toUpperCase();
    const gross =
      parseFloat(document.getElementById("dt-gross-result").value) || 0;
    const quantity =
      parseInt(document.getElementById("dt-quantity").value) || 0;
    const brokerage =
      parseFloat(document.getElementById("dt-operation-fees").value) || 0;

    // validações básicas
    if (!(quantity > 0)) {
      try {
        const { showMessage } = await import("../ui/messages.js");
        showMessage(
          "Informe a quantidade de contratos (maior que zero).",
          "error"
        );
      } catch (_) {}
      submitBtn?.removeAttribute("disabled");
      submitBtn?.classList.remove("opacity-60", "cursor-not-allowed");
      return;
    }

    // taxas por contrato (futuros) e percentual para ações
    const cfg = appState.taxesConfig || {};
    const futures = cfg.futuresFees || {};
    const stocksPct = Number(cfg.stocksPercentFee || 0);
    const isFutures = /^(WIN|WDO|IND|DOL|BIT)/i.test(assetSymbol);
    const perContractFee = isFutures
      ? Number(
          futures[(assetSymbol.match(/^(WIN|WDO|IND|DOL|BIT)/i) || [""])[0]] ||
            0
        )
      : 0;
    const variableFee = isFutures ? 0 : (Math.abs(gross) * stocksPct) / 100;
    const fees = perContractFee * quantity + variableFee;
    const net = gross - fees - brokerage;
    const observations = document.getElementById("dt-observations").value;

    // Atualiza saldo: soma se positivo, subtrai se negativo
    appState.balance = (appState.balance || 0) + net;

    const currentEditingId = Number(form.dataset.editingId || "") || null;
    const newOperation = {
      id: currentEditingId ?? Date.now(),
      date: opDate,
      assetSymbol,
      gross,
      quantity,
      fees,
      brokerage,
      net,
      observations,
    };

    // Confirmação antes de registrar/editar
    try {
      const { confirmDialog } = await import("../ui/dialogs.js");
      const ok = await confirmDialog({
        title: currentEditingId ? "Confirmar edição" : "Confirmar registro",
        message:
          `Deseja ${
            currentEditingId ? "editar" : "registrar"
          } esta operação?\n\n` +
          `Ativo: ${assetSymbol}\n` +
          `Qtd.: ${quantity}\n` +
          `Resultado Bruto: ${formatCurrency(gross)}\n` +
          `Taxas: ${formatCurrency(fees)}\n` +
          `Corretagem: ${formatCurrency(brokerage)}\n` +
          `Resultado Líquido: ${formatCurrency(net)}`,
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
      const idx = appState.dayTradeOperations.findIndex(
        (o) => o.id === currentEditingId
      );
      if (idx >= 0) appState.dayTradeOperations[idx] = newOperation;
      delete form.dataset.editingId;
    } else {
      appState.dayTradeOperations = appState.dayTradeOperations || [];
      appState.dayTradeOperations.push(newOperation);
    }

    // Primeiro atualizar o dashboard geral (saldo, etc.)
    updateDashboard();

    // Garantir que os KPIs específicos do daytrade sejam mantidos
    try {
      const { updateCentralKpisByTab } = await import("../ui/dashboard.js");
      // Usar setTimeout para garantir que seja executado após outras atualizações
      setTimeout(() => {
        updateCentralKpisByTab?.("daytrade");
      }, 200);
    } catch (_) {}

    // Disparar eventos de mudança
    document.dispatchEvent(new Event("capital:changed"));
    document.dispatchEvent(new Event("operations:changed"));

    // Salvar estado
    await import("../services/storage/index.js").then(({ saveState }) =>
      saveState(appState)
    );

    // re-render lista Day Trade
    renderOperationsDayTrade();

    // Garantir que os KPIs sejam mantidos após o re-render
    try {
      const { updateCentralKpisByTab } = await import("../ui/dashboard.js");
      setTimeout(() => {
        updateCentralKpisByTab?.("daytrade");
      }, 100);
    } catch (_) {}

    try {
      const { showMessage } = await import("../ui/messages.js");
      showMessage("Operação de Day Trade registrada.", "success");
    } catch (_) {}

    // preservar visual de "Permitido por Trade" durante reset
    const allowedEl = document.getElementById("dt-allowed-trade");
    const allowedPrev = allowedEl ? allowedEl.value : null;
    form.reset();
    const dateInput = document.getElementById("dt-date");
    if (dateInput) dateInput.value = toISODateLocal();

    // restaura imediatamente o valor permitido visualmente e recalcula
    if (allowedEl && allowedPrev !== null) {
      allowedEl.value = allowedPrev;
    }
    submitBtn?.removeAttribute("disabled");
    submitBtn?.classList.remove("opacity-60", "cursor-not-allowed");
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = "Registrar Operação (Day Trade)";
      btn.classList.remove("bg-orange-500", "hover:bg-orange-600");
      btn.classList.add("bg-blue-500", "hover:bg-blue-600");
    }
    try {
      await updateAllowed();
    } catch (_) {}
    // Devolver foco ao campo de ativo após registrar
    try {
      setTimeout(() => document.getElementById("dt-asset-symbol")?.focus(), 0);
    } catch (_) {}
  });

  // Listeners legados removidos (não usados em Day Trade)

  // listeners de filtros -> re-render
  try {
    document
      .getElementById("daytrade-start-date")
      ?.addEventListener("change", () => renderOperationsDayTrade());
    document
      .getElementById("daytrade-end-date")
      ?.addEventListener("change", () => renderOperationsDayTrade());
    document
      .getElementById("daytrade-filter-asset")
      ?.addEventListener("change", () => renderOperationsDayTrade());
    const daytradePeriodSelect = document.getElementById("daytrade-period");

    // Evento change para quando o valor muda
    daytradePeriodSelect?.addEventListener("change", () => {
      const period = daytradePeriodSelect.value;

      if (period === "personalizado") {
        showDateModal(daytradePeriodSelect, (dates) => {
          customStartDate = dates.startDate;
          customEndDate = dates.endDate;
          renderOperationsDayTrade();
        });
      } else {
        // Limpar datas personalizadas
        customStartDate = null;
        customEndDate = null;
        renderOperationsDayTrade();
      }
    });

    // Evento click para quando clica no select que já tem "personalizado"
    daytradePeriodSelect?.addEventListener("click", (e) => {
      const period = daytradePeriodSelect.value;

      if (period === "personalizado") {
        // Prevenir que o dropdown abra
        e.preventDefault();
        e.stopPropagation();

        showDateModal(daytradePeriodSelect, (dates) => {
          customStartDate = dates.startDate;
          customEndDate = dates.endDate;
          renderOperationsDayTrade();
        });
      }
    });
  } catch (_) {}

  // Toggle de ordenação
  try {
    document
      .getElementById("daytrade-order-toggle")
      ?.addEventListener("click", () => {
        const btn = document.getElementById("daytrade-order-toggle");
        if (!btn) return;
        const current = btn.getAttribute("data-order") || "desc";
        const next = current === "desc" ? "asc" : "desc";
        btn.setAttribute("data-order", next);

        renderOperationsDayTrade();
      });
  } catch (_) {}

  // Remover inicialização do ícone
};
