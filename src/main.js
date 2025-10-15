import { initializeState } from "./state.js";
import {
  updateDashboard,
  renderPortfolio,
  updateCentralKpisByTab,
  wireTabs,
  wireDateModal,
  initBackToTop,
  updateScrollThreshold,
  showAuthModal,
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
  isFirebaseConfigured,
  onAuthChange,
  getCurrentUser,
  logoutUser,
  isAuthenticated,
} from "./services/index.js";
import { AUTH, FIREBASE } from "./config/constants.js";

// Expose functions needed by inline HTML event handlers (kept for now)
window.applyFilters = applyFilters;
window.calculateTaxes = calculateTaxes;

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Aplicação iniciando...");

  try {
    // Verificar se Firebase está configurado e se autenticação é necessária
    const firebaseEnabled = FIREBASE.ENABLED && isFirebaseConfigured();
    let userAuthenticated = false;

    if (firebaseEnabled) {
      console.log("🔥 Firebase detectado e configurado");

      // Aguardar estado de autenticação (Promise-based)
      await new Promise((resolve) => {
        const unsubscribe = onAuthChange((user) => {
          unsubscribe(); // Cancelar observador após primeira verificação

          if (user) {
            console.log("✅ Usuário autenticado:", user.email);
            userAuthenticated = true;
            updateUserInfo(user);
            resolve();
          } else if (AUTH.REQUIRED && !AUTH.GUEST_MODE) {
            // Autenticação obrigatória
            showAuthModal("login")
              .then((result) => {
                if (!result.guest) {
                  userAuthenticated = true;
                  updateUserInfo(result);
                }
                resolve();
              })
              .catch(() => {
                console.log("ℹ️ Continuando em modo guest");
                resolve();
              });
          } else {
            // Modo guest permitido
            console.log("ℹ️ Modo guest ativo");
            resolve();
          }
        });
      });
    }

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

    // Configurar botões de autenticação
    setupAuthButtons();

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

  // Configurar botão de logout
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    // Se não está autenticado, esconder botão
    if (!isAuthenticated()) {
      logoutButton.style.display = "none";
    } else {
      // Configurar click do logout
      logoutButton.style.display = "block";
      logoutButton.addEventListener("click", async () => {
        try {
          const { confirmDialog } = await import("./ui/dialogs.js");
          const ok = await confirmDialog({
            title: "Sair da conta",
            message: "Deseja realmente sair? Seus dados locais serão mantidos.",
            confirmText: "Sair",
            cancelText: "Cancelar",
          });
          if (!ok) return;

          await logoutUser();
          showMessage("Logout realizado com sucesso!", "success");
          
          // Recarregar página após logout
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error("Erro ao fazer logout:", error);
        }
      });
    }
  }
}

/**
 * Atualiza informações do usuário na interface
 * @param {Object} user - Dados do usuário
 */
function updateUserInfo(user) {
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const userInitials = document.getElementById("user-initials");

  if (userName) userName.textContent = user.displayName || "Usuário";
  if (userEmail) userEmail.textContent = user.email || "usuario@email.com";
  
  if (userInitials) {
    const initials = user.displayName
      ? user.displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : user.email[0].toUpperCase();
    userInitials.textContent = initials;
  }

  // Mostrar botão de logout
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.style.display = "block";
  }
}

// Função para configurar botões de autenticação e sincronização
function setupAuthButtons() {
  const loginButton = document.getElementById("login-button");
  const syncButton = document.getElementById("sync-button");
  const firebaseEnabled = FIREBASE.ENABLED && isFirebaseConfigured();

  // Botão de Login
  if (loginButton) {
    if (firebaseEnabled && !isAuthenticated()) {
      loginButton.style.display = "flex";
      loginButton.addEventListener("click", async () => {
        try {
          const user = await showAuthModal("login");
          if (!user.guest) {
            updateUserInfo(user);
            
            // Migrar dados locais para Firebase
            const { migrateToFirebase } = await import(
              "./services/storage/firebase-storage.js"
            );
            const migrateResult = await migrateToFirebase();
            
            if (migrateResult.success) {
              const { showMessage } = await import("./ui/messages.js");
              showMessage("Bem-vindo! Dados sincronizados.", "success");
            }
            
            // Recarregar dados
            const saved = await loadState(true);
            if (saved) {
              const { appState } = await import("./state.js");
              Object.assign(appState, saved);
              await updateDashboard();
              updateCentralKpisByTab();
              renderPortfolio();
              renderOperationsSwingTrade();
            }
            
            loginButton.style.display = "none";
            syncButton.style.display = "flex";
          }
        } catch (error) {
          console.error("Erro no login:", error);
        }
      });
    } else {
      loginButton.style.display = "none";
    }
  }

  // Botão de Sincronização
  if (syncButton) {
    if (firebaseEnabled && isAuthenticated()) {
      syncButton.style.display = "flex";
      syncButton.addEventListener("click", async () => {
        const btn = syncButton;
        const originalText = btn.innerHTML;
        
        try {
          // Feedback visual
          btn.disabled = true;
          btn.innerHTML = `
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sincronizando...
          `;

          const { appState } = await import("./state.js");
          const { forceSyncFirebase } = await import(
            "./services/storage/firebase-storage.js"
          );
          const result = await forceSyncFirebase(appState);

          const { showMessage } = await import("./ui/messages.js");
          if (result.success) {
            showMessage("Sincronizado com sucesso!", "success");
          } else {
            showMessage("Erro ao sincronizar: " + result.error, "error");
          }
        } catch (error) {
          console.error("Erro na sincronização:", error);
          const { showMessage } = await import("./ui/messages.js");
          showMessage("Erro ao sincronizar dados", "error");
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    } else {
      syncButton.style.display = "none";
    }
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
