import { appState } from "../state.js";
import { formatCurrency } from "../utils/format.js";
import { showMessage } from "../ui/messages.js";

const round2 = (v) => Math.max(0, Number.isFinite(v) ? v : 0);
// Parse de moeda em pt-BR (aceita 1.234,56 ou 1234,56 ou 1234.56)
const parseMoneyBr = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v || "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export const calculateTaxes = () => {
  try {
    // Swing Trade (operações comuns)
    const swingOps = Array.isArray(appState.operations)
      ? appState.operations
      : [];
    const swingProfit = swingOps.reduce(
      (acc, op) => acc + Math.max(0, Number(op.result) || 0),
      0
    );
    const swingLoss = swingOps.reduce(
      (acc, op) => acc + Math.max(0, -(Number(op.result) || 0)),
      0
    );
    const swingNet = swingProfit - swingLoss;
    const swingSalesValue = swingOps
      .filter((op) => (op.operationType || "").toLowerCase() === "venda")
      .reduce(
        (acc, op) =>
          acc + (Number(op.entryValue) || 0) * (Number(op.quantity) || 0),
        0
      );
    const swIRRF = swingSalesValue * 0.00005; // 0,005%
    const swDARF = swingNet > 0 ? Math.max(0, 0.15 * swingNet - swIRRF) : 0; // 15%

    // Day Trade – IRRF por dia somente se o resultado líquido acumulado do dia for positivo
    const dtOps = Array.isArray(appState.dayTradeOperations)
      ? appState.dayTradeOperations
      : [];
    const dtNet = dtOps.reduce((acc, op) => acc + (Number(op.net) || 0), 0);
    // Agrupa por dia local (YYYY-MM-DD)
    const dayGroups = {};
    for (const op of dtOps) {
      const raw = String(op.date || "");
      const key = raw.includes("T") ? raw.split("T")[0] : raw.slice(0, 10);
      if (!dayGroups[key]) dayGroups[key] = { grossAbs: 0, net: 0 };
      dayGroups[key].grossAbs += Math.abs(Number(op.gross) || 0);
      dayGroups[key].net += Number(op.net) || 0;
    }
    let dtIRRF = 0;
    Object.values(dayGroups).forEach((g) => {
      if (g.net > 0) {
        dtIRRF += g.net * 0.01; // 1% sobre o ganho líquido do dia
      }
    });
    const dtDARF = dtNet > 0 ? Math.max(0, 0.2 * dtNet - dtIRRF) : 0; // 20% do líquido, abatendo IRRF

    // Totais
    const totalIRRF = swIRRF + dtIRRF;
    const totalDARF = swDARF + dtDARF;

    // Preenche UI: Day Trade
    const dtIrrfEl = document.getElementById("dt-irrf-value");
    const dtDarfEl = document.getElementById("dt-darf-value");
    if (dtIrrfEl) dtIrrfEl.textContent = formatCurrency(round2(dtIRRF));
    if (dtDarfEl) dtDarfEl.textContent = formatCurrency(round2(dtDARF));

    // Swing Trade
    const swIrrfEl = document.getElementById("sw-irrf-value");
    const swDarfEl = document.getElementById("sw-darf-value");
    if (swIrrfEl) swIrrfEl.textContent = formatCurrency(round2(swIRRF));
    if (swDarfEl) swDarfEl.textContent = formatCurrency(round2(swDARF));

    // Totais (mantendo IDs existentes para compatibilidade)
    const irrfEl = document.getElementById("irrf-value");
    const darfEl = document.getElementById("darf-value");
    if (irrfEl) irrfEl.textContent = formatCurrency(round2(totalIRRF));
    if (darfEl) darfEl.textContent = formatCurrency(round2(totalDARF));
  } catch (e) {
    console.error(e);
    showMessage("Não foi possível calcular os impostos.", "error");
  }
};

export const wireTaxesAuto = () => {
  // Recalcula quando operações mudam (Swing) e quando Day Trade dispara mudanças (usa capital:changed hoje)
  const run = () => calculateTaxes();
  document.addEventListener("operations:changed", run);
  document.addEventListener("capital:changed", run);
  document.addEventListener("config:changed", run);
  // Primeira execução
  setTimeout(run, 0);
};

export const wireTaxesConfig = () => {
  const map = [
    ["cfg-fee-win", "WIN"],
    ["cfg-fee-wdo", "WDO"],
    ["cfg-fee-ind", "IND"],
    ["cfg-fee-dol", "DOL"],
    ["cfg-fee-bit", "BIT"],
  ];
  map.forEach(([id, sym]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = appState.taxesConfig?.futuresFees?.[sym] ?? 0;
    el.addEventListener("input", () => {
      const v = parseFloat(el.value) || 0;
      appState.taxesConfig.futuresFees[sym] = v;
      import("../services/storage/index.js").then(({ saveState }) =>
        saveState(appState)
      );
    });
  });
  const stockEl = document.getElementById("cfg-fee-stocks");
  if (stockEl) {
    stockEl.value = appState.taxesConfig?.stocksPercentFee ?? 0;
    stockEl.addEventListener("input", () => {
      const v = parseFloat(stockEl.value) || 0;
      appState.taxesConfig.stocksPercentFee = v;
      import("../services/storage/index.js").then(({ saveState }) =>
        saveState(appState)
      );
    });
  }
  const percentEl = document.getElementById("cfg-percent-trade");
  if (percentEl) {
    percentEl.value = appState.taxesConfig?.percentPerTrade ?? 0;
    percentEl.addEventListener("input", () => {
      const v = parseFloat(percentEl.value) || 0;
      appState.taxesConfig.percentPerTrade = v;
      import("../services/storage/index.js").then(({ saveState }) =>
        saveState(appState)
      );
      document.dispatchEvent(new Event("config:changed"));
    });
  }

  // Aporte Inicial (R$): exibe e salva enquanto digita
  const initialDepositEl = document.getElementById("cfg-initial-deposit");
  if (initialDepositEl) {
    try {
      const current = Number(appState.taxesConfig?.initialDeposit || 0);
      initialDepositEl.value = formatCurrency(current).replace(/^R\$\s?/, "");
    } catch (_) {
      initialDepositEl.value = "0";
    }
    initialDepositEl.addEventListener("input", () => {
      appState.taxesConfig.initialDeposit = parseMoneyBr(
        initialDepositEl.value
      );
    });
    // Ao sair do campo, normaliza para formato BR
    initialDepositEl.addEventListener("blur", () => {
      const v = parseMoneyBr(initialDepositEl.value);
      initialDepositEl.value = formatCurrency(v).replace(/^R\$\s?/, "");
    });
  }

  const saveBtn = document.getElementById("save-config-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      // Lê o valor do input no momento do clique para evitar perda de sincronização
      try {
        const el = document.getElementById("cfg-initial-deposit");
        if (el) appState.taxesConfig.initialDeposit = parseMoneyBr(el.value);
      } catch (_) {}
      const { rebuildBalance } = await import("../services/accounting.js");
      appState.balance = rebuildBalance(appState);
      await import("../services/storage/index.js").then(({ saveState }) =>
        saveState(appState)
      );
      showMessage("Configurações salvas com sucesso!", "success");
      document.dispatchEvent(new Event("config:changed"));
      // Atualiza os KPIs imediatamente e avisa dependentes de saldo
      try {
        const { updateDashboard, updateCentralKpisByTab } = await import(
          "../ui/dashboard.js"
        );
        await updateDashboard();
        // Mantém a aba atual em vez de forçar "capital"
        updateCentralKpisByTab?.();
      } catch (_) {}
      document.dispatchEvent(new Event("capital:changed"));
    });
  }
};
