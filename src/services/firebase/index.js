/**
 * Índice dos Serviços Firebase
 * ============================
 * Exports centralizados de todos os serviços Firebase
 */

// Configuração
export { app, auth, db, isFirebaseConfigured } from "./config.js";

// Autenticação
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  onAuthChange,
  resetPassword,
  changeEmail,
  changePassword,
  updateUserDisplayName,
  validateEmail,
  validatePassword,
} from "./auth.js";

// Firestore
export {
  // Operations
  saveOperation,
  loadOperations,
  deleteOperation,
  // Day Trade
  saveDayTradeOperation,
  loadDayTradeOperations,
  deleteDayTradeOperation,
  // Capital
  saveCapitalTransaction,
  loadCapitalTransactions,
  deleteCapitalTransaction,
  // Holdings
  saveHoldings,
  loadHoldings,
  // Settings
  saveSettings,
  loadSettings,
  // Sync
  syncAllData,
  loadAllData,
} from "./firestore.js";

// Theme Service
export { saveThemeToFirebase, loadThemeFromFirebase } from "./theme-service.js";

