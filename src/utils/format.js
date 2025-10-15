/**
 * Utilitários de Formatação
 * =========================
 * Funções para formatação de valores numéricos e monetários
 */

import { FORMAT } from "../config/constants.js";
import { isValidNumber } from "./validators.js";

/**
 * Formata um valor numérico como moeda brasileira (R$)
 * @param {number} value - Valor a ser formatado
 * @param {boolean} showSymbol - Se deve mostrar o símbolo R$
 * @returns {string} Valor formatado
 */
export function formatCurrency(value, showSymbol = true) {
  const defaultValue = showSymbol ? "R$ 0,00" : "0,00";

  if (!isValidNumber(value)) {
    return defaultValue;
  }

  const numValue = Number(value);
  const formatted = numValue.toLocaleString(FORMAT.LOCALE, {
    style: "currency",
    currency: FORMAT.CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? formatted : formatted.replace("R$", "").trim();
}

/**
 * Formata um valor numérico como percentual
 * @param {number} value - Valor a ser formatado (0.05 = 5%)
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Percentual formatado
 */
export function formatPercent(value, decimals = 2) {
  if (!isValidNumber(value)) {
    return "0,00%";
  }

  const numValue = Number(value);
  return numValue.toLocaleString(FORMAT.LOCALE, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formata um número com separadores de milhares
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Número formatado
 */
export function formatNumber(value, decimals = 2) {
  if (!isValidNumber(value)) {
    return "0,00";
  }

  const numValue = Number(value);
  return numValue.toLocaleString(FORMAT.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formata um valor como quantidade de ações/contratos
 * @param {number} value - Quantidade
 * @returns {string} Quantidade formatada
 */
export function formatQuantity(value) {
  if (!isValidNumber(value)) {
    return "0";
  }

  const numValue = Number(value);
  return numValue.toLocaleString(FORMAT.LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formata um valor monetário sem símbolo de moeda
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado sem R$
 */
export function formatMoney(value) {
  return formatCurrency(value, false);
}

/**
 * Formata um valor para exibição em tabelas
 * @param {number} value - Valor a ser formatado
 * @param {string} type - Tipo de formatação ('currency', 'percent', 'number', 'quantity')
 * @returns {string} Valor formatado
 */
export function formatForTable(value, type = "currency") {
  switch (type) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value);
    case "number":
      return formatNumber(value);
    case "quantity":
      return formatQuantity(value);
    default:
      return formatCurrency(value);
  }
}
