/**
 * Serviço de Contabilidade
 * ========================
 * Gerencia cálculos de saldo e balanço da aplicação
 */

import { OPERATION_TYPES } from "../config/constants.js";
import { toSafeNumber } from "../utils/validators.js";

/**
 * Recalcula o saldo (caixa) a partir dos dados existentes no estado
 *
 * Lógica:
 * - capitalTransactions: já vêm com sinal (depósito positivo, demais negativos)
 * - operations (Swing): compra reduz caixa; venda aumenta caixa, ambas considerando corretagem
 * - dayTradeOperations: usa resultado líquido (net)
 *
 * @param {Object} state - Estado da aplicação
 * @returns {number} Saldo calculado
 */
export const rebuildBalance = (state) => {
  if (!state) return 0;

  // Lançamentos financeiros (depósitos, retiradas, taxas)
  const capitalSum = (state.capitalTransactions || []).reduce(
    (acc, tx) => acc + toSafeNumber(tx?.value),
    0
  );

  // Operações de Swing Trade (compra/venda de ativos)
  const swingCash = (state.operations || []).reduce((acc, op) => {
    const qty = toSafeNumber(op?.quantity);
    const price = toSafeNumber(op?.entryValue);
    const fees = toSafeNumber(op?.operationFees);

    const effect =
      op?.operationType === OPERATION_TYPES.BUY
        ? -(qty * price + fees) // Compra: reduz caixa
        : qty * price - fees; // Venda: aumenta caixa

    return acc + effect;
  }, 0);

  // Day Trade (resultado líquido de operações intraday)
  const dayNet = (state.dayTradeOperations || []).reduce(
    (acc, op) => acc + toSafeNumber(op?.net),
    0
  );

  return capitalSum + swingCash + dayNet;
};

/**
 * Calcula o total investido em operações de Swing Trade
 * @param {Object} state - Estado da aplicação
 * @returns {number} Total investido
 */
export const calculateTotalInvested = (state) => {
  if (!state?.operations) return 0;

  return state.operations.reduce((total, op) => {
    if (op?.operationType === OPERATION_TYPES.BUY) {
      const qty = toSafeNumber(op?.quantity);
      const price = toSafeNumber(op?.entryValue);
      const fees = toSafeNumber(op?.operationFees);
      return total + (qty * price + fees);
    }
    return total;
  }, 0);
};

/**
 * Calcula o total de vendas em operações de Swing Trade
 * @param {Object} state - Estado da aplicação
 * @returns {number} Total de vendas
 */
export const calculateTotalSales = (state) => {
  if (!state?.operations) return 0;

  return state.operations.reduce((total, op) => {
    if (op?.operationType === OPERATION_TYPES.SELL) {
      const qty = toSafeNumber(op?.quantity);
      const price = toSafeNumber(op?.entryValue);
      const fees = toSafeNumber(op?.operationFees);
      return total + (qty * price - fees);
    }
    return total;
  }, 0);
};
