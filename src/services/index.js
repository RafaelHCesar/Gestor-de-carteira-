/**
 * Índice dos Serviços
 * ===================
 * Centraliza exports de todos os serviços da aplicação
 */

// Sistema de armazenamento
export {
  clearState,
  getStorageInfo,
  hasSavedState,
  loadState,
  saveState,
} from "./storage/index.js";

// Firebase
export * from "./firebase/index.js";

// Serviço de símbolos
export { populateDatalist, wireDynamicAutocomplete } from "./symbols.js";

// Serviço de preços
export { fetchCurrentPrice } from "./prices.js";

// Serviço de portfólio
export {
  applyBuyToPortfolio,
  applySellToPortfolio,
  revertBuyFromPortfolio,
  revertSellFromPortfolio,
  sanitizeHoldings,
} from "./portfolio.js";

// Serviço de contabilidade
export {
  calculateTotalInvested,
  calculateTotalSales,
  rebuildBalance,
} from "./accounting.js";
