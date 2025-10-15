/**
 * Funções de Validação
 * ====================
 * Centraliza todas as validações da aplicação
 */

import { VALIDATION } from "../config/constants.js";

/**
 * Valida se um valor numérico é válido
 * @param {any} value - Valor a ser validado
 * @returns {boolean} True se válido
 */
export function isValidNumber(value) {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Valida se um valor é um número positivo
 * @param {any} value - Valor a ser validado
 * @returns {boolean} True se for número positivo
 */
export function isPositiveNumber(value) {
  return isValidNumber(value) && Number(value) > 0;
}

/**
 * Valida se um valor monetário é válido
 * @param {any} value - Valor a ser validado
 * @returns {boolean} True se válido
 */
export function isValidMoneyValue(value) {
  return isValidNumber(value) && Number(value) >= VALIDATION.MIN_VALUE;
}

/**
 * Valida se uma quantidade é válida
 * @param {any} quantity - Quantidade a ser validada
 * @returns {boolean} True se válida
 */
export function isValidQuantity(quantity) {
  const num = Number(quantity);
  return (
    isValidNumber(quantity) &&
    num >= VALIDATION.MIN_QUANTITY &&
    Number.isInteger(num)
  );
}

/**
 * Valida se um símbolo de ativo é válido
 * @param {string} symbol - Símbolo a ser validado
 * @returns {boolean} True se válido
 */
export function isValidSymbol(symbol) {
  if (typeof symbol !== "string") return false;
  const trimmed = symbol.trim();
  return (
    trimmed.length >= VALIDATION.MIN_SYMBOL_LENGTH &&
    trimmed.length <= VALIDATION.MAX_SYMBOL_LENGTH &&
    /^[A-Z0-9]+(\.[A-Z]+)?$/i.test(trimmed)
  );
}

/**
 * Valida se uma data é válida
 * @param {string|Date} date - Data a ser validada
 * @returns {boolean} True se válida
 */
export function isValidDate(date) {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Valida se um email é válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Converte um valor para número seguro (retorna 0 se inválido)
 * @param {any} value - Valor a ser convertido
 * @returns {number} Número convertido ou 0
 */
export function toSafeNumber(value) {
  const num = Number(value);
  return isValidNumber(value) ? num : 0;
}

/**
 * Converte um valor para número positivo seguro (retorna 0 se inválido ou negativo)
 * @param {any} value - Valor a ser convertido
 * @returns {number} Número positivo ou 0
 */
export function toSafePositiveNumber(value) {
  const num = toSafeNumber(value);
  return num > 0 ? num : 0;
}

/**
 * Sanitiza um símbolo de ativo (remove espaços e converte para maiúsculas)
 * @param {string} symbol - Símbolo a ser sanitizado
 * @returns {string} Símbolo sanitizado
 */
export function sanitizeSymbol(symbol) {
  if (typeof symbol !== "string") return "";
  return symbol.trim().toUpperCase();
}

/**
 * Valida um objeto de operação
 * @param {Object} operation - Operação a ser validada
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateOperation(operation) {
  const errors = [];

  if (!operation) {
    return { valid: false, errors: ["Operação não fornecida"] };
  }

  if (!isValidSymbol(operation.assetSymbol)) {
    errors.push("Símbolo do ativo inválido");
  }

  if (!isValidQuantity(operation.quantity)) {
    errors.push("Quantidade inválida");
  }

  if (!isValidMoneyValue(operation.entryValue)) {
    errors.push("Valor de entrada inválido");
  }

  if (!isValidDate(operation.date)) {
    errors.push("Data inválida");
  }

  if (!["compra", "venda"].includes(operation.operationType)) {
    errors.push("Tipo de operação inválido");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida um objeto de transação de capital
 * @param {Object} transaction - Transação a ser validada
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateTransaction(transaction) {
  const errors = [];

  if (!transaction) {
    return { valid: false, errors: ["Transação não fornecida"] };
  }

  if (!isValidMoneyValue(Math.abs(transaction.value))) {
    errors.push("Valor inválido");
  }

  if (!isValidDate(transaction.date)) {
    errors.push("Data inválida");
  }

  if (!transaction.type) {
    errors.push("Tipo de transação não especificado");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
