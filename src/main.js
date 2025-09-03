import { initializeState } from "./state.js";
import {
  updateDashboard,
  renderPortfolio,
  updateCentralKpisByTab,
  wireTabs,
  wireDateModal,
  initBackToTop,
  updateScrollThreshold,
} from "./ui/index.js";
import {
  wireOperationsSwingTrade,
  renderOperationsSwingTrade,
  wireOperationsFinanceiras,
  renderOperationsFinanceiras,
  wireOperationsDayTrade,
  renderOperationsDayTrade,
  applyFilters,
  calculateTaxes,
  wireTaxesConfig,
  wireTaxesAuto,
} from "./modules/index.js";
import {
  setTodayToAllDateInputs,
  toISODateLocal,
  initThemeSystem,
} from "./utils/index.js";
import {
  populateDatalist,
  wireDynamicAutocomplete,
  saveState,
  loadState,
} from "./services/index.js";

// Expose functions needed by inline HTML event handlers (kept for now)
window.applyFilters = applyFilters;
window.calculateTaxes = calculateTaxes;

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Aplicação iniciando...");

  try {
    // Carregar estado salvo
    const saved = await loadState();
    if (saved) {
      const { appState } = await import("./state.js");
      Object.assign(appState, saved);
      console.log("✅ Estado carregado com sucesso");
    } else {
      initializeState();
      console.log("✅ Estado inicializado com valores padrão");
    }

    // Configurar funcionalidades da UI
    wireTabs();
    wireDateModal();
    initBackToTop();

    // Inicializar sistema de temas
    initThemeSystem();

    // Configurar operações
    wireOperationsSwingTrade();
    wireOperationsDayTrade();
    wireOperationsFinanceiras();
    renderOperationsFinanceiras();

    // Listeners de período para re-render das listas
    try {
      document
        .getElementById("swing-period")
        ?.addEventListener("change", () => renderOperationsSwingTrade());
      document
        .getElementById("swing-filter-asset")
        ?.addEventListener("input", () => renderOperationsSwingTrade());
    } catch (_) {}

    // Renderizar componentes principais
    await updateDashboard();
    updateCentralKpisByTab();
    renderPortfolio();
    renderOperationsSwingTrade();

    // Configurações iniciais
    setTodayToAllDateInputs();
    populateDatalist();
    wireDynamicAutocomplete();

    // Foco inicial nos campos de ativo
    try {
      document.getElementById("asset-symbol")?.focus();
    } catch (_) {}
    try {
      document.getElementById("dt-asset-symbol")?.focus();
    } catch (_) {}

    // Configurações de impostos
    wireTaxesConfig();
    wireTaxesAuto();

    // Listener para redimensionamento da janela
    window.addEventListener("resize", updateScrollThreshold);

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

    // Auto-save antes de fechar a página
    const { appState } = await import("./state.js");
    const persist = () => saveState(appState);
    window.addEventListener("beforeunload", persist);

    // Utilitário: se existir carteira sem operações (estado inconsistente), zera carteira
    if (
      Array.isArray(appState.operations) &&
      appState.operations.length === 0
    ) {
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
      const { rebuildBalance } = await import("./services/index.js");

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
        renderOperationsDayTrade();
      } catch (_) {}
    };

    // Configurar informações do usuário padrão
    setupDefaultUserInfo();

    // Configurar switch de tema
    setupThemeToggle();

    console.log("✅ Aplicação inicializada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar aplicação:", error);
  }
});

// Função para configurar informações do usuário padrão
function setupDefaultUserInfo() {
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const userInitials = document.getElementById("user-initials");

  if (userName) userName.textContent = "Usuário";
  if (userEmail) userEmail.textContent = "usuario@email.com";
  if (userInitials) userInitials.textContent = "U";

  // Remover botão de logout se existir
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.style.display = "none";
  }
}

// Função para configurar o switch de alternância de tema
function setupThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  // Adicionar listener para alternar tema
  themeToggle.addEventListener("change", async () => {
    try {
      const { toggleTheme } = await import("./utils/index.js");
      const newTheme = toggleTheme();

      console.log(`🎨 Tema alterado para: ${newTheme}`);
    } catch (error) {
      console.error("Erro ao alternar tema:", error);
    }
  });

  console.log("✅ Switch de tema configurado");
}
