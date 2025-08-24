import { initializeState } from "./state.js";
import {
  updateDashboard,
  renderPortfolio,
  updateCentralKpisByTab,
} from "./ui/dashboard.js";
import { wireTabs } from "./ui/tabs.js";
import { wireDateModal } from "./ui/dateModal.js";
import {
  wireOperationsSwingTrade,
  renderOperationsSwingTrade,
} from "./modules/operationsSwingTrade.js";
import {
  wireOperationsFinanceiras,
  renderOperationsFinanceiras,
} from "./modules/operationsFinanceiras.js";
import { applyFilters } from "./modules/analytics.js";
import {
  calculateTaxes,
  wireTaxesConfig,
  wireTaxesAuto,
} from "./modules/taxes.js";
import { setTodayToAllDateInputs, toISODateLocal } from "./utils/dates.js";
import {
  wireOperationsDayTrade,
  renderOperationsDayTrade,
} from "./modules/operationsDayTrade.js";
import {
  populateDatalist,
  wireDynamicAutocomplete,
} from "./services/symbols.js";
import { saveState, loadState } from "./services/storage/index.js";

// Expose functions needed by inline HTML event handlers (kept for now)
window.applyFilters = applyFilters;
window.calculateTaxes = calculateTaxes;

document.addEventListener("DOMContentLoaded", async () => {
  // tenta carregar state salvo
  const saved = await loadState();
  if (saved) {
    const { appState } = await import("./state.js");
    Object.assign(appState, saved);
  } else {
    initializeState();
  }
  wireTabs();
  wireDateModal();
  wireOperationsSwingTrade();
  wireOperationsDayTrade();
  wireOperationsFinanceiras();
  renderOperationsFinanceiras();
  // listeners de período para re-render das listas
  try {
    document
      .getElementById("swing-period")
      ?.addEventListener("change", () => renderOperationsSwingTrade());
    document
      .getElementById("swing-filter-asset")
      ?.addEventListener("input", () => renderOperationsSwingTrade());
  } catch (_) {}
  await updateDashboard();
  updateCentralKpisByTab(); // garante layout/valores corretos da aba ativa (Portfólio por padrão)
  renderPortfolio();
  renderOperationsSwingTrade();
  setTodayToAllDateInputs();
  populateDatalist();
  wireDynamicAutocomplete();
  // foco inicial nos campos de ativo nos dois forms
  try {
    document.getElementById("asset-symbol")?.focus();
  } catch (_) {}
  try {
    document.getElementById("dt-asset-symbol")?.focus();
  } catch (_) {}
  wireTaxesConfig();
  wireTaxesAuto();

  // Preenche data inicial do card unificado de capital
  try {
    const capDate = document.getElementById("cap-date");
    if (capDate) capDate.value = toISODateLocal();
  } catch (_) {}

  // Wire: botão de excluir dados em Config Iniciais
  try {
    const wipeBtn = document.getElementById("wipe-run-btn");
    const wipeScope = document.getElementById("wipe-scope");
    if (wipeBtn && wipeScope) {
      wipeBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const raw = wipeScope.value || "all";
        const scopeMap = {
          all: "all",
          swing: "swing",
          daytrade: "daytrade",
          capital: "financeiro",
        };
        const scope = scopeMap[raw] || "all";
        try {
          const { confirmDialog } = await import("./ui/dialogs.js");
          const ok = await confirmDialog({
            title: "Confirmar exclusão",
            message:
              "Isso irá excluir os dados selecionados e recalcular o saldo. Deseja continuar?",
            confirmText: "Excluir",
            cancelText: "Cancelar",
            variant: "danger",
          });
          if (!ok) return;
        } catch (_) {}
        await window.resetAppState(scope);
      });
    }
  } catch (_) {}

  // salva automaticamente a cada mudança visível (simples: ao trocar carteira/operacoes/saldo)
  const { appState } = await import("./state.js");
  const persist = () => saveState(appState);
  window.addEventListener("beforeunload", persist);

  // Utilitário: se existir carteira sem operações (estado inconsistente), zera carteira
  if (Array.isArray(appState.operations) && appState.operations.length === 0) {
    const hasHoldings =
      appState.holdings && Object.keys(appState.holdings).length > 0;
    if (hasHoldings) {
      appState.holdings = {};
      await saveState(appState);
      await updateDashboard();
      updateCentralKpisByTab();
      await renderPortfolio();
    }
  }

  // Expor reset manual no console, por domínio: 'all' | 'swing' | 'daytrade' | 'financeiro'
  window.resetAppState = async (what = "all") => {
    const { appState } = await import("./state.js");
    const { rebuildBalance } = await import("./services/accounting.js");

    if (what === "all") {
      appState.operations = [];
      appState.dayTradeOperations = [];
      appState.capitalTransactions = [];
      appState.holdings = {};
      appState.balance = 0;
    } else if (what === "swing") {
      appState.operations = [];
      appState.holdings = {};
      appState.balance = rebuildBalance(appState);
    } else if (what === "daytrade") {
      appState.dayTradeOperations = [];
      appState.balance = rebuildBalance(appState);
    } else if (what === "financeiro") {
      appState.capitalTransactions = [];
      appState.balance = rebuildBalance(appState);
    }

    await saveState(appState);
    await updateDashboard();
    updateCentralKpisByTab();
    await renderPortfolio();
    renderOperationsSwingTrade();
    renderOperationsFinanceiras();
    // Day trade: re-render imediato após limpar dados
    try {
      (
        await import("./modules/operationsDayTrade.js")
      ).renderOperationsDayTrade();
    } catch (_) {}
  };
});
