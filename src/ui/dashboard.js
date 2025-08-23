import { appState } from "../state.js";
import { formatCurrency } from "../utils/format.js";
import { fetchCurrentPrice } from "../services/prices.js";

const groupSel = ".kpi-group-card";
const getGroup = () => document.querySelector(groupSel);
const getCells = () => {
  const g = getGroup();
  if (!g) return [];
  return Array.from(g.children || []);
};
const setGridCols = (n) => {
  const g = getGroup();
  if (!g) return;
  g.style.display = "grid";
  g.style.gridTemplateColumns =
    n === 1 ? "1fr" : n === 2 ? "1fr 1fr" : "repeat(3,1fr)";
  g.style.justifyItems = "center"; // centraliza conteúdo
};
const setCell = (cell, title, value, color = "#1f2937") => {
  if (!cell) return;
  const [titleEl, valueEl] = cell.querySelectorAll("p");
  if (titleEl) {
    titleEl.textContent = title || "";
    titleEl.className = "text-gray-500 text-sm text-center";
  }
  if (valueEl) {
    valueEl.textContent = value || "";
    valueEl.style.color = color;
    valueEl.className = "text-3xl font-bold text-center";
  }
};

const setCentralTitles = (a, b, c) => {
  const cells = getCells();
  if (cells.length < 3) return;
  setCell(cells[0], a, cells[0]?.querySelectorAll("p")[1]?.textContent || "");
  setCell(cells[1], b, cells[1]?.querySelectorAll("p")[1]?.textContent || "");
  setCell(cells[2], c, cells[2]?.querySelectorAll("p")[1]?.textContent || "");
};

export const updateDashboard = async () => {
  // Calcula saldo diretamente (evita qualquer divergência de cache/import):
  // Saldo = Aporte Inicial + Extrato Financeiro + Fluxo de Swing + Líquido de Day Trade
  const safeNum = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);
  const initialDeposit = safeNum(appState.taxesConfig?.initialDeposit || 0);
  const capitalSum = (appState.capitalTransactions || []).reduce(
    (acc, tx) => acc + safeNum(tx.value),
    0
  );
  const swingCash = (appState.operations || []).reduce((acc, op) => {
    const qty = safeNum(op.quantity);
    const price = safeNum(op.entryValue);
    const fees = safeNum(op.operationFees);
    const effect =
      op.operationType === "compra"
        ? -(qty * price + fees)
        : qty * price - fees;
    return acc + effect;
  }, 0);
  const dayNet = (appState.dayTradeOperations || []).reduce(
    (acc, op) => acc + safeNum(op.net),
    0
  );
  const balance = initialDeposit + capitalSum + swingCash + dayNet; // caixa
  appState.balance = balance;
  const { holdings } = appState;

  // Valor de mercado das posições (P&L de Swing não realizado)
  let market = 0;
  try {
    for (const sym of Object.keys(holdings || {})) {
      const h = holdings[sym];
      try {
        const { price } = await import("../services/prices.js").then((m) =>
          m.fetchCurrentPrice(sym)
        );
        market += price * (h.quantity || 0);
      } catch (_) {
        // fallback: usa PM como proxy se cotação falhar
        market += (h.averageCost || 0) * (h.quantity || 0);
      }
    }
  } catch (_) {}

  const equity = balance + market; // Saldo (caixa) + mark-to-market (swing)

  const balanceEl = document.getElementById("current-balance");
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.className = `text-3xl font-bold ${
      balance >= 0 ? "text-green-600" : "text-red-600"
    }`;
  }

  // Calcula carteira (P&L não realizado) e investido
  let invested = 0;
  for (const sym of Object.keys(holdings || {})) {
    const h = holdings[sym];
    invested += h.averageCost * h.quantity;
  }
  const diff = market - invested;
  const pct = invested > 0 ? (diff / invested) * 100 : 0;
  const marketEl = document.getElementById("market-result");
  const percentEl = document.getElementById("market-percent");
  const investedEl = document.getElementById("invested");
  if (marketEl)
    marketEl.className = `text-3xl font-bold ${
      diff >= 0 ? "text-green-600" : "text-red-600"
    } text-center`;
  if (marketEl) marketEl.textContent = formatCurrency(diff); // P&L
  if (investedEl) investedEl.textContent = formatCurrency(invested);
  if (percentEl) {
    percentEl.textContent = `${pct.toFixed(2)}%`;
    percentEl.className = `text-3xl font-bold ${
      pct >= 0 ? "text-green-600" : "text-red-600"
    } text-center`;
  }

  const alertsEl = document.getElementById("alerts");
  if (balance < 1000 && balance > 0) {
    alertsEl.textContent = "Atenção: Saldo abaixo de R$ 1.000!";
    alertsEl.className = "text-lg text-orange-600";
  } else if (balance <= 0) {
    alertsEl.textContent = "Saldo insuficiente. Realize um depósito.";
    alertsEl.className = "text-lg text-red-600";
  } else {
    alertsEl.textContent = "Nenhum alerta";
    alertsEl.className = "text-lg text-yellow-600";
  }

  // Títulos/layout do card são controlados por updateCentralKpisByTab().

  // Calcula e atualiza Meta de Gain e Limite de Loss Diário
  updateDailyTargets();
};

// Função para calcular e atualizar meta de gain e limite de loss diário
const updateDailyTargets = () => {
  const gainTargetEl = document.getElementById("daily-gain-target");
  const lossLimitEl = document.getElementById("daily-loss-limit");

  if (!gainTargetEl || !lossLimitEl) return;

  // Pega o percentual de risco por trade da configuração
  const riskPercent = Number(appState.taxesConfig?.percentPerTrade || 0);
  const balance = Number(appState.balance || 0);

  // Calcula o limite de loss diário (percentual de risco x 2)
  const dailyLossLimit = (riskPercent / 100) * balance * 2;

  // Calcula a meta de gain (limite de loss + 1,5%)
  const dailyGainTarget = dailyLossLimit + (5.0 / 100) * balance;

  // Atualiza os elementos na interface
  gainTargetEl.textContent = formatCurrency(dailyGainTarget);
  lossLimitEl.textContent = formatCurrency(dailyLossLimit);

  // Verifica alertas baseado no resultado do dia
  checkDailyAlerts(dailyGainTarget, dailyLossLimit);
};

// Função para verificar e atualizar alertas diários
const checkDailyAlerts = (dailyGainTarget, dailyLossLimit) => {
  const alertsEl = document.getElementById("alerts");
  if (!alertsEl) return;

  // Calcula o resultado do dia (soma de todas as operações de day trade do dia)
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const todayOperations = (appState.dayTradeOperations || []).filter((op) => {
    const opDate = String(op.date || "").split("T")[0];
    return opDate === today;
  });

  const dailyResult = todayOperations.reduce(
    (acc, op) => acc + (Number(op.net) || 0),
    0
  );

  // Define alertas baseado no resultado
  let alertMessage = "Nenhum alerta";
  let alertColor = "text-yellow-600";

  if (dailyResult >= dailyGainTarget) {
    // Meta atingida
    if (dailyResult >= dailyGainTarget * 2) {
      alertMessage = `Meta duplicada! 🎯🎯 Parabéns! ${formatCurrency(
        dailyResult
      )}`;
      alertColor = "text-green-600";
    } else {
      alertMessage = `Meta batida! 🎯 Excelente! ${formatCurrency(
        dailyResult
      )}`;
      alertColor = "text-green-600";
    }
  } else if (dailyResult <= -dailyLossLimit) {
    // Limite de loss atingido
    alertMessage = `Limite de loss atingido! ⚠️ Pare as operações! ${formatCurrency(
      dailyResult
    )}`;
    alertColor = "text-red-600";
  } else if (dailyResult > 0) {
    // Resultado positivo mas ainda não atingiu a meta
    const progress = ((dailyResult / dailyGainTarget) * 100).toFixed(1);
    const remaining = dailyGainTarget - dailyResult;
    alertMessage = `Meta: ${progress}% 🚀 Faltam ${formatCurrency(remaining)}`;
    alertColor = "text-blue-600";
  } else if (dailyResult < 0) {
    // Resultado negativo mas ainda não atingiu o limite
    const progress = ((Math.abs(dailyResult) / dailyLossLimit) * 100).toFixed(
      1
    );
    const remaining = dailyLossLimit - Math.abs(dailyResult);
    alertMessage = `Loss: ${progress}% 📉 Restam ${formatCurrency(remaining)}`;
    alertColor = "text-orange-600";
  }

  // Atualiza o alerta
  alertsEl.textContent = alertMessage;
  alertsEl.className = `text-lg ${alertColor}`;
};

// Configura listeners para atualizar os targets quando necessário
export const wireDailyTargets = () => {
  // Atualiza quando o dashboard é atualizado
  document.addEventListener("config:changed", updateDailyTargets);
  document.addEventListener("capital:changed", updateDailyTargets);
  document.addEventListener("operations:changed", updateDailyTargets);

  // Primeira execução
  setTimeout(updateDailyTargets, 0);
};

// Atualiza o card central conforme a aba ativa
export const updateCentralKpisByTab = async (overrideTabId) => {
  const investedEl = document.getElementById("invested");
  const resultEl = document.getElementById("market-result");
  const percentEl = document.getElementById("market-percent");
  const cells = getCells();

  const activeTab = document.querySelector(".tab-content.active");
  const tabId = overrideTabId || (activeTab ? activeTab.id : "portfolio");

  const hidePercent = (hide) => {
    if (!percentEl) return;
    percentEl.parentElement.style.visibility = hide ? "hidden" : "visible";
  };

  // Helpers para somatórios
  const sumSwingNet = () => {
    const ops = Array.isArray(appState.operations) ? appState.operations : [];
    return ops.reduce((acc, op) => acc + (Number(op.result) || 0), 0);
  };
  const sumDayTradeNet = () => {
    const ops = Array.isArray(appState.dayTradeOperations)
      ? appState.dayTradeOperations
      : [];
    return ops.reduce((acc, op) => acc + (Number(op.net) || 0), 0);
  };

  if (tabId === "portfolio") {
    // Portfólio: Percentual baseado somente no desempenho (P&L não realizado + Day Trade)
    // Denominador: patrimônio total (caixa + valor de mercado)
    let market = 0;
    let investedHoldings = 0;
    for (const sym of Object.keys(appState.holdings || {})) {
      const h = appState.holdings[sym];
      investedHoldings += Number(h.totalCost) || 0;
      try {
        const quote = await fetchCurrentPrice(sym);
        market += quote.price * h.quantity;
      } catch (_) {
        market += h.averageCost * h.quantity;
      }
    }
    const pnlUnrealized = market - investedHoldings; // apenas Swing (não realizado)
    const dtNet = sumDayTradeNet(); // apenas Day Trade
    const performance = dtNet + pnlUnrealized;
    const patrimonioTotal = Number(appState.balance || 0) + market;
    const pctGlobal =
      patrimonioTotal > 0 ? (performance / patrimonioTotal) * 100 : 0;

    setGridCols(3);
    setCell(
      cells[0],
      "Patrimônio Total",
      formatCurrency(patrimonioTotal),
      "#16a34a"
    );
    setCell(
      cells[1],
      "Resultado (P&L + Day Trade)",
      formatCurrency(performance),
      performance >= 0 ? "#16a34a" : "#dc2626"
    );
    setCell(
      cells[2],
      "Percentual",
      `${pctGlobal.toFixed(2)}%`,
      pctGlobal >= 0 ? "#16a34a" : "#dc2626"
    );
    hidePercent(false);
  } else if (tabId === "swing") {
    // Swing: calcular P&L Não Realizado exclusivamente da carteira (operações de swing)
    const investedHoldings = Object.values(appState.holdings || {}).reduce(
      (acc, h) => acc + (Number(h.totalCost) || 0),
      0
    );
    let market = 0;
    for (const sym of Object.keys(appState.holdings || {})) {
      const h = appState.holdings[sym];
      try {
        const quote = await fetchCurrentPrice(sym);
        market += quote.price * h.quantity;
      } catch (_) {
        market += h.averageCost * h.quantity;
      }
    }
    const pnlVal = market - investedHoldings;
    const pctVal = investedHoldings > 0 ? (pnlVal / investedHoldings) * 100 : 0;

    setGridCols(3);
    setCell(
      cells[0],
      "Investido em Ações",
      formatCurrency(investedHoldings),
      "#1f2937"
    );
    setCell(
      cells[1],
      "P&L Não Realizado",
      formatCurrency(pnlVal),
      pnlVal >= 0 ? "#16a34a" : "#dc2626"
    );
    setCell(
      cells[2],
      "Percentual",
      `${pctVal.toFixed(2)}%`,
      pctVal >= 0 ? "#16a34a" : "#dc2626"
    );
    hidePercent(false);
  } else if (tabId === "daytrade") {
    setGridCols(1);
    setCell(
      cells[0],
      "Resultado Líquido em Day Trade",
      formatCurrency(sumDayTradeNet()),
      sumDayTradeNet() >= 0 ? "#16a34a" : "#dc2626"
    );
    if (cells[1]) cells[1].style.display = "none";
    if (cells[2]) cells[2].style.display = "none";
    hidePercent(true);
  } else if (tabId === "capital") {
    const txs = Array.isArray(appState.capitalTransactions)
      ? appState.capitalTransactions
      : [];
    const deposits = txs
      .filter((t) => t.type === "deposito")
      .reduce((a, t) => a + (Number(t.value) || 0), 0);
    const out = txs
      .filter((t) => t.type !== "deposito")
      .reduce((a, t) => a + (Number(t.value) || 0), 0);
    setGridCols(2);
    setCell(cells[0], "Entradas", formatCurrency(deposits), "#16a34a");
    setCell(cells[1], "Saídas", formatCurrency(out), "#dc2626");
    if (cells[2]) cells[2].style.display = "none";
    hidePercent(true);
  } else if (tabId === "taxes") {
    const darfTotalEl = document.getElementById("darf-value");
    const irrfTotalEl = document.getElementById("irrf-value");
    const toNum = (t) =>
      parseFloat(
        (t || "")
          .replace(/[^0-9,-]/g, "")
          .replace(".", "")
          .replace(",", ".")
      ) || 0;
    const darf = toNum(darfTotalEl?.textContent);
    const irrf = toNum(irrfTotalEl?.textContent);
    setGridCols(2);
    setCell(cells[0], "DARF Previsto", formatCurrency(darf), "#dc2626");
    setCell(cells[1], "IRRF Descontado", formatCurrency(irrf), "#dc2626");
    if (cells[2]) cells[2].style.display = "none";
    hidePercent(true);
  } else if (tabId === "analysis") {
    setGridCols(1);
    // Mostrar texto grande no valor, deixar título vazio
    setCell(cells[0], "", "Análise e Relatórios", "#374151");
    if (cells[1]) cells[1].style.display = "none";
    if (cells[2]) cells[2].style.display = "none";
    hidePercent(true);
  } else if (tabId === "config") {
    setGridCols(1);
    setCell(cells[0], "", "Configurações Iniciais", "#374151");
    if (cells[1]) cells[1].style.display = "none";
    if (cells[2]) cells[2].style.display = "none";
    hidePercent(true);
  } else {
    setGridCols(3);
    hidePercent(false);
  }
};

try {
  document.addEventListener("tab:changed", () => {
    // reexibe todas as células antes de ajustar (evita ocultar em outra aba)
    const cells = getCells();
    cells.forEach((c) => (c.style.display = ""));
    updateCentralKpisByTab();
  });
} catch (_) {}

export const renderPortfolio = async () => {
  const containerId = "portfolio-list";
  let container = document.getElementById(containerId);
  if (!container) {
    return; // seção existe apenas na aba Portfólio agora
  }
  container.innerHTML = "";

  const symbols = Object.keys(appState.holdings).sort();
  if (symbols.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="py-4 px-4 text-center text-gray-500">Nenhum ativo em carteira.</td>`;
    container.appendChild(row);
    return;
  }

  for (const symbol of symbols) {
    const { quantity, averageCost } = appState.holdings[symbol];
    let currentPrice = 0;
    try {
      const quote = await fetchCurrentPrice(symbol);
      currentPrice = quote.price;
    } catch (_) {
      currentPrice = averageCost;
    }
    const marketValue = currentPrice * quantity;
    const unrealized = (currentPrice - averageCost) * quantity;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${symbol}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${quantity}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(
        averageCost
      )}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(
        currentPrice
      )}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(
        marketValue
      )}</td>
      <td class="py-3 px-4 whitespace-nowrap text-sm font-semibold ${
        unrealized >= 0 ? "text-green-600" : "text-red-600"
      }">${formatCurrency(unrealized)}</td>`;
    container.appendChild(row);
  }
};
