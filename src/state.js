export const appState = {
  operations: [],
  balance: 0,
  holdings: {}, // { [symbol]: { quantity, averageCost, totalCost } }
  capitalTransactions: [], // [{ date, type, description, value }]
  dayTradeOperations: [], // [{ id, date, assetSymbol, gross, quantity, fees, brokerage, net }]
  taxesConfig: {
    futuresFees: {
      WIN: 0,
      WDO: 0,
      IND: 0,
      DOL: 0,
      BIT: 0,
    },
    stocksPercentFee: 0, // percentual sobre o bruto
    percentPerTrade: 0, // percentual do saldo permitido por trade (Day Trade)
    initialDeposit: 0,
  },
};

export const initializeState = () => {
  appState.operations = [];
  appState.balance = 0;
  appState.holdings = {};
  appState.capitalTransactions = [];
  appState.dayTradeOperations = [];
  appState.taxesConfig = {
    futuresFees: { WIN: 0, WDO: 0, IND: 0, DOL: 0, BIT: 0 },
    stocksPercentFee: 0,
    percentPerTrade: 0,
    initialDeposit: 0,
  };
};
