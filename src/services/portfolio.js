import { appState } from "../state.js";

// Normaliza símbolo para chave da carteira: remove sufixos ".SA" e "F" (lote fracionário)
const normalizeSymbolForHoldings = (symbol) => {
  const up = String(symbol || "")
    .toUpperCase()
    .trim();
  const noSa = up.replace(/\.SA$/i, "");
  const noF = noSa.replace(/F$/i, "");
  return noF;
};

export const applyBuyToPortfolio = ({
  symbol,
  quantity,
  pricePerUnit,
  brokerage,
}) => {
  const key = normalizeSymbolForHoldings(symbol);
  const qty = Number(quantity) || 0;
  const price = Number(pricePerUnit) || 0;
  const fees = Number(brokerage) || 0;
  if (qty <= 0 || price <= 0) return;

  const cashOut = qty * price + fees;
  appState.balance -= cashOut;

  const current = appState.holdings[key] || {
    quantity: 0,
    averageCost: 0,
    totalCost: 0,
  };
  const newTotalQty = current.quantity + qty;
  const newTotalCost = current.totalCost + qty * price + fees;
  const newAvg = newTotalQty > 0 ? newTotalCost / newTotalQty : 0;
  appState.holdings[key] = {
    quantity: newTotalQty,
    averageCost: newAvg,
    totalCost: newTotalCost,
  };
};

export const applySellToPortfolio = ({
  symbol,
  quantity,
  pricePerUnit,
  brokerage,
}) => {
  const key = normalizeSymbolForHoldings(symbol);
  const qty = Number(quantity) || 0;
  const price = Number(pricePerUnit) || 0;
  const fees = Number(brokerage) || 0;
  if (qty <= 0 || price <= 0) return;

  const current = appState.holdings[key];
  if (!current || current.quantity < qty) {
    // venda maior que o estoque: limita à quantidade disponível
    if (!current || current.quantity <= 0) return;
  }
  const sellQty = Math.min(qty, current.quantity);

  // Entrada de caixa: preço*quantidade - corretagem
  const cashIn = sellQty * price - fees;
  appState.balance += cashIn;

  // Reduzir estoque
  const newQty = current.quantity - sellQty;
  const newTotalCost = current.averageCost * newQty; // custo total remanescente
  const newAvg = newQty > 0 ? newTotalCost / newQty : 0;

  if (newQty > 0) {
    appState.holdings[key] = {
      quantity: newQty,
      averageCost: newAvg,
      totalCost: newTotalCost,
    };
  } else {
    delete appState.holdings[key];
  }
};

// Funções para reverter efeitos na carteira/saldo quando editar operação existente
export const revertBuyFromPortfolio = ({
  symbol,
  quantity,
  pricePerUnit,
  brokerage,
}) => {
  const key = normalizeSymbolForHoldings(symbol);
  const qty = Number(quantity) || 0;
  const price = Number(pricePerUnit) || 0;
  const fees = Number(brokerage) || 0;
  const current = appState.holdings[key];
  if (!current || qty <= 0) return;

  appState.balance += qty * price + fees;

  const newQty = current.quantity - qty;
  const newTotalCost = current.totalCost - (qty * price + fees);
  if (newQty > 0) {
    const newAvg = newTotalCost / newQty;
    appState.holdings[key] = {
      quantity: newQty,
      averageCost: newAvg,
      totalCost: newTotalCost,
    };
  } else {
    delete appState.holdings[key];
  }
};

export const revertSellFromPortfolio = ({
  symbol,
  quantity,
  pricePerUnit,
  brokerage,
}) => {
  const key = normalizeSymbolForHoldings(symbol);
  const qty = Number(quantity) || 0;
  const price = Number(pricePerUnit) || 0;
  const fees = Number(brokerage) || 0;
  const current = appState.holdings[key];

  // Reverter entrada de caixa da venda
  appState.balance -= qty * price - fees;

  if (current) {
    // Há posição remanescente: mantém o PM e soma custo proporcional
    const newQty = current.quantity + qty;
    const newTotalCost = current.totalCost + qty * current.averageCost;
    appState.holdings[key] = {
      quantity: newQty,
      averageCost: current.averageCost,
      totalCost: newTotalCost,
    };
  } else {
    // Posição tinha sido zerada; restaura com PM aproximado pelo preço informado
    const avg = price > 0 ? price : 0;
    const totalCost = qty * avg;
    appState.holdings[key] = {
      quantity: qty,
      averageCost: avg,
      totalCost,
    };
  }
};

// Remove posições com quantidade <= 0 para evitar linhas "fantasma" na carteira
export const sanitizeHoldings = () => {
  const merged = {};
  // 1) Mescla chaves com e sem F, e corrige quantidades/custos inválidos
  for (const key of Object.keys(appState.holdings || {})) {
    const h = appState.holdings[key];
    const base = normalizeSymbolForHoldings(key);
    if (!h || !isFinite(h.quantity) || h.quantity <= 0) {
      continue;
    }
    const qty = Number(h.quantity) || 0;
    const totalCost = isFinite(h.totalCost)
      ? Number(h.totalCost)
      : (Number(h.averageCost) || 0) * qty;
    if (!merged[base]) {
      merged[base] = { quantity: 0, totalCost: 0, averageCost: 0 };
    }
    merged[base].quantity += qty;
    merged[base].totalCost += totalCost;
  }
  // 2) Recalcula preço médio e elimina posições zeradas
  for (const base of Object.keys(merged)) {
    const m = merged[base];
    if (m.quantity <= 0) {
      delete merged[base];
    } else {
      m.averageCost = m.totalCost / m.quantity;
    }
  }
  appState.holdings = merged;
};
