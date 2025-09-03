/**
 * Índice dos Módulos
 * ==================
 * Centraliza exports de todos os módulos da aplicação
 */

// Módulo de operações
export * from "./operations/index.js";

// Módulo de impostos
export { calculateTaxes, wireTaxesConfig, wireTaxesAuto } from "./taxes.js";

// Módulo de análises
export { applyFilters } from "./analytics.js";
