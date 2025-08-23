// Recalcula o saldo (caixa) a partir dos dados existentes no estado
// - capitalTransactions: já vêm com sinal (depósito positivo, demais negativos)
// - operations (Swing): compra reduz caixa; venda aumenta caixa, ambas considerando corretagem
// - dayTradeOperations: usa resultado líquido (net)
export const rebuildBalance = (state) => {
  const safeNum = (n) => (isFinite(Number(n)) ? Number(n) : 0);

  // Lançamentos financeiros
  const capitalSum = (state.capitalTransactions || []).reduce(
    (acc, tx) => acc + safeNum(tx.value),
    0
  );

  // Operações de Swing (ordens)
  const swingCash = (state.operations || []).reduce((acc, op) => {
    const qty = safeNum(op.quantity);
    const price = safeNum(op.entryValue);
    const fees = safeNum(op.operationFees);
    const effect =
      op.operationType === "compra"
        ? -(qty * price + fees)
        : qty * price - fees;
    return acc + effect;
  }, 0);

  // Day Trade (resultado líquido)
  const dayNet = (state.dayTradeOperations || []).reduce(
    (acc, op) => acc + safeNum(op.net),
    0
  );

  return capitalSum + swingCash + dayNet;
};
