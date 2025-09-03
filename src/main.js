import { initializeState } from "./state.js";
import themeManager from "./utils/theme.js";
// import authService from "./auth/authService.js";
import {
  updateDashboard,
  renderPortfolio,
  updateCentralKpisByTab,
} from "./ui/dashboard.js";
import { wireTabs } from "./ui/tabs.js";
import { wireDateModal } from "./ui/dateModal.js";
import { initBackToTop, updateScrollThreshold } from "./ui/backToTop.js";
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
  // Verificar se o usuário está logado
  if (!isUserLoggedIn()) {
    // Redirecionar para login se não estiver logado
    window.location.href = "src/auth/login.html";
    return;
  }

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
  initBackToTop();
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

  // Listener para redimensionamento da janela (ajustar threshold do botão voltar ao topo)
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

  // Sistema de Autenticação
  setupAuthentication();
});

// Função para configurar autenticação
function setupAuthentication() {
  // Atualizar informações do usuário no header
  updateUserInfo();

  // Configurar botão de logout
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      handleLogout();
    });
  }
}

// Função para verificar se o usuário está logado
function isUserLoggedIn() {
  return localStorage.getItem("user_session") !== null;
}

// Função para obter dados do usuário logado
function getCurrentUser() {
  const session = localStorage.getItem("user_session");
  if (session) {
    try {
      return JSON.parse(session);
    } catch (error) {
      console.error("Erro ao parsear dados da sessão:", error);
      return null;
    }
  }
  return null;
}

// Função para atualizar informações do usuário
function updateUserInfo() {
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const userInitials = document.getElementById("user-initials");

  if (isUserLoggedIn()) {
    const user = getCurrentUser();
    if (user) {
      if (userName) userName.textContent = user.name || "Usuário";
      if (userEmail) userEmail.textContent = user.email || "usuario@email.com";

      // Gerar iniciais do nome
      if (userInitials && user.name) {
        const initials = user.name
          .split(" ")
          .map((word) => word.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2);
        userInitials.textContent = initials;
      }
    }
  } else {
    // Usuário não logado - mostrar dados padrão
    if (userName) userName.textContent = "Usuário";
    if (userEmail) userEmail.textContent = "usuario@email.com";
    if (userInitials) userInitials.textContent = "U";
  }
}

// Função para lidar com logout
async function handleLogout() {
  try {
    const { confirmDialog } = await import("./ui/dialogs.js");
    const { showMessage } = await import("./ui/messages.js");

    const confirmed = await confirmDialog({
      title: "Confirmar Logout",
      message: "Tem certeza que deseja sair da aplicação?",
      confirmText: "Sair",
      cancelText: "Cancelar",
      variant: "warning",
    });

    if (confirmed) {
      // Limpar dados da sessão (simulado)
      localStorage.removeItem("user_session");
      sessionStorage.clear();

      showMessage("Logout realizado com sucesso!", "success");

      // Redirecionar para página de login após um breve delay
      setTimeout(() => {
        window.location.href = "src/auth/login.html";
      }, 1000);
    }
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    // Fallback para confirm simples
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("user_session");
      sessionStorage.clear();
      window.location.href = "src/auth/login.html";
    }
  }
}
