/**
 * Índice dos Componentes de UI
 * ============================
 * Centraliza exports de todos os componentes de interface
 */

// Dashboard principal
export {
  updateDashboard,
  renderPortfolio,
  updateCentralKpisByTab,
} from "./dashboard.js";

// Sistema de abas
export { wireTabs } from "./tabs.js";

// Modal de datas
export { wireDateModal, showDateModal, hideDateModal } from "./dateModal.js";

// Botão voltar ao topo
export { 
  initBackToTop, 
  updateScrollThreshold, 
  showBackToTopButton,
  hideBackToTopButton 
} from "./backToTop.js";

// Sistema de mensagens
export { showMessage } from "./messages.js";

// Sistema de diálogos
export { confirmDialog } from "./dialogs.js";
