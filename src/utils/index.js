/**
 * Índice dos Utilitários
 * ======================
 * Centraliza exports de todas as funções utilitárias
 */

// Formatação de datas
export {
  addDays,
  formatDateBR,
  formatRelativeDate,
  getDaysDifference,
  getTodayISO,
  isToday,
  isValidDate,
  parseISODateLocal,
  setTodayToAllDateInputs,
  toISODateLocal,
} from "./dates.js";

// Formatação de valores
export {
  formatCurrency,
  formatForTable,
  formatMoney,
  formatNumber,
  formatPercent,
  formatQuantity,
} from "./format.js";

// Sistema de temas
export {
  applySavedTheme,
  getCurrentTheme,
  getThemeInfo,
  initThemeSystem,
  setTheme,
  toggleTheme,
} from "./theme.js";

// Validações
export {
  isPositiveNumber,
  isValidEmail,
  isValidMoneyValue,
  isValidNumber,
  isValidQuantity,
  isValidSymbol,
  sanitizeSymbol,
  toSafeNumber,
  toSafePositiveNumber,
  validateOperation,
  validateTransaction,
} from "./validators.js";

// Helpers
export {
  capitalize,
  copyToClipboard,
  debounce,
  deepClone,
  formatCompactNumber,
  generateUniqueId,
  getNestedValue,
  groupBy,
  isEmpty,
  removeDuplicates,
  removeNullish,
  sleep,
  sortBy,
  throttle,
  truncate,
} from "./helpers.js";
