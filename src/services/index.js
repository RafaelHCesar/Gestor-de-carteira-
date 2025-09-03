/**
 * Índice dos Serviços
 * ===================
 * Centraliza exports de todos os serviços da aplicação
 */

// Sistema de armazenamento
export { saveState, loadState, clearState, hasSavedState } from "./storage/index.js";

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
export { rebuildBalance } from "./accounting.js";
