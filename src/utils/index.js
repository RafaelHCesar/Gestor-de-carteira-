/**
 * Índice dos Utilitários
 * ======================
 * Centraliza exports de todas as funções utilitárias
 */

// Formatação de datas
export {
  setTodayToAllDateInputs,
  toISODateLocal,
  parseISODateLocal,
  formatDateBR,
} from "./dates.js";

// Formatação de valores
export { formatCurrency, formatNumber, formatPercent } from "./format.js";

// Sistema de temas
export {
  getCurrentTheme,
  setTheme,
  toggleTheme,
  applySavedTheme,
  initThemeSystem,
  getThemeInfo,
} from "./theme.js";
