import { appState } from "../state.js";
import { formatCurrency } from "../utils/format.js";
import { showMessage } from "../ui/messages.js";
import { parseISODateLocal, formatDateBR } from "../utils/dates.js";

// ===== Tema visual global dos gráficos (Chart.js) =====
(() => {
  const Chart = window.Chart;
  if (!Chart) return;
  // Tipografia e cores padrão
  Chart.defaults.font.family =
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  Chart.defaults.color = "#374151"; // gray-700
  Chart.defaults.plugins.legend.labels.color = "#374151";
  // Tooltip padrão
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(17,24,39,0.96)"; // gray-900
  Chart.defaults.plugins.tooltip.borderColor = "#374151"; // gray-700
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = "#e5e7eb"; // gray-200
  Chart.defaults.plugins.tooltip.bodyColor = "#e5e7eb";
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.displayColors = false;
  // Animação
  Chart.defaults.animation.duration = 700;
  Chart.defaults.animation.easing = "easeOutQuart";
})();

// ===== Utilitários internos =====
const parseDate = (iso) =>
  iso?.includes("T") ? new Date(iso) : parseISODateLocal(iso);
const inRange = (d, start, end) => {
  if (!d) return true;
  const t = d.getTime();
  return (isNaN(start) || t >= start) && (isNaN(end) || t <= end);
};

// Paleta
const green = "#10b981"; // mantido para outros gráficos
const red = "#ef4444";
const blue = "#2563eb";

let profitChart;
const renderProfitLossChart = (totalSwing, totalDay) => {
  const canvas = document.getElementById("profitLossCanvas");
  if (!canvas) return;
  const data = {
    labels: ["Swing", "Day Trade"],
    datasets: [
      {
        label: "Resultado",
        data: [totalSwing, totalDay],
        backgroundColor: [
          totalSwing >= 0 ? blue : red,
          totalDay >= 0 ? blue : red,
        ],
        borderRadius: 8,
        maxBarThickness: 36,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" }, // gray-500
      },
      y: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { color: "#6b7280", callback: (val) => formatCurrency(val) },
      },
    },
  };
  if (profitChart) profitChart.destroy();
  profitChart = new window.Chart(canvas.getContext("2d"), {
    type: "bar",
    data,
    options,
  });
};

let rrChart;
const renderRiskReturnChart = (wins, losses) => {
  const canvas = document.getElementById("riskReturnCanvas");
  if (!canvas) return;
  const data = {
    labels: ["Vencedores", "Perdedores"],
    datasets: [
      {
        data: [wins, losses],
        backgroundColor: ["#3b82f6", "#f59e0b"],
        borderRadius: 6,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}` },
      },
    },
  };
  if (rrChart) rrChart.destroy();
  rrChart = new window.Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data,
    options,
  });
};

let equityChart;
const renderEquityCurve = (points) => {
  const canvas = document.getElementById("equityCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const labels = points.map((p) => p.label);
  const dataVals = points.map((p) => p.value);
  const data = {
    labels,
    datasets: [
      {
        label: "Saldo (R$)",
        data: dataVals,
        // cor da linha varia conforme o valor (azul >= 0, vermelho < 0)
        borderColor: blue,
        segment: {
          borderColor: (ctx) => {
            const a = ctx.p0?.parsed?.y ?? 0;
            const b = ctx.p1?.parsed?.y ?? 0;
            return a < 0 || b < 0 ? red : blue;
          },
        },
        // pontos coloridos conforme valor
        pointBackgroundColor: dataVals.map((v) => (v >= 0 ? blue : red)),
        pointBorderColor: dataVals.map((v) => (v >= 0 ? blue : red)),
        tension: 0.3,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 3.5,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top", align: "center" },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (ctx) => `Equity: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(148,163,184,0.15)", borderDash: [4, 3] },
        ticks: { color: "#6b7280" },
      },
      y: {
        grid: { color: "rgba(148,163,184,0.15)", borderDash: [4, 3] },
        ticks: { color: "#6b7280", callback: (v) => formatCurrency(v) },
      },
    },
  };
  if (equityChart) equityChart.destroy();
  equityChart = new window.Chart(ctx, { type: "line", data, options });
};

let winRateChart;
const renderWinRateGauge = (winRatePct) => {
  const canvas = document.getElementById("winRateCanvas");
  if (!canvas) return;

  const win = Math.max(0, Math.min(100, winRatePct));

  // Clear canvas
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set canvas size - aproveitar melhor o espaço
  const size = Math.min(canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height * 0.85; // Posicionar mais baixo no card
  const radius = size * 0.7; // Aumentado para 0.5 para ficar maior

  // Draw gauge background (gray arc)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 0);
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 25; // Aumentado para 20 para o medidor maior
  ctx.lineCap = "round";
  ctx.stroke();

  // Draw colored segments
  const startAngle = Math.PI;
  const totalAngle = Math.PI;

  // Red segment (0-25%)
  const redEndAngle = startAngle + totalAngle * 0.25;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, redEndAngle);
  ctx.strokeStyle = "#dc2626"; // red-600
  ctx.lineWidth = 25; // Aumentado para 20
  ctx.lineCap = "round";
  ctx.stroke();

  // Light red segment (25-50%)
  const pinkEndAngle = startAngle + totalAngle * 0.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, redEndAngle, pinkEndAngle);
  ctx.strokeStyle = "#f87171"; // red-400
  ctx.lineWidth = 25; // Aumentado para 20
  ctx.lineCap = "round";
  ctx.stroke();

  // Teal segment (50-75%)
  const tealEndAngle = startAngle + totalAngle * 0.75;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, pinkEndAngle, tealEndAngle);
  ctx.strokeStyle = "#2dd4bf"; // teal-400
  ctx.lineWidth = 25; // Aumentado para 20
  ctx.lineCap = "round";
  ctx.stroke();

  // Dark teal segment (75-100%)
  const darkTealEndAngle = startAngle + totalAngle;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, tealEndAngle, darkTealEndAngle);
  ctx.strokeStyle = "#0d9488"; // teal-600
  ctx.lineWidth = 25; // Aumentado para 20
  ctx.lineCap = "round";
  ctx.stroke();

  // Calculate needle angle based on win rate
  const needleAngle = startAngle + totalAngle * (win / 100);

  // Draw needle
  const needleLength = radius * 0.85;
  const needleX = centerX + Math.cos(needleAngle) * needleLength;
  const needleY = centerY + Math.sin(needleAngle) * needleLength;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(needleX, needleY);
  ctx.strokeStyle = "#6b7280"; // gray-500
  ctx.lineWidth = 8; // Aumentado para 5
  ctx.lineCap = "round";
  ctx.stroke();

  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2); // Aumentado para 12
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#d1d5db"; // gray-300
  ctx.lineWidth = 4; // Aumentado para 3
  ctx.fill();
  ctx.stroke();

  // Draw value text in center
  ctx.fillStyle = "#374151"; // gray-700
  ctx.font = "bold 28px Inter, sans-serif"; // Aumentado para 28px
  ctx.textAlign = "center";
  ctx.textBaseline = "middle"; // Centralizar verticalmente
  ctx.fillText(`${win.toFixed(0)}%`, centerX, centerY); // Centralizado perfeitamente
};

let comparisonChart;
const renderComparison = (labels, equityPct, winRatePctSeries) => {
  const canvas = document.getElementById("comparisonCanvas");
  if (!canvas) return;
  const data = {
    labels,
    datasets: [
      {
        label: "Evolução (%)",
        data: equityPct,
        backgroundColor: "rgba(16,185,129,0.6)",
        borderColor: "#10b981",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 28,
      },
      {
        label: "Acertividade (%)",
        data: winRatePctSeries,
        backgroundColor: "rgba(59,130,246,0.6)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 12,
          color: "#374151",
          font: { size: 12, weight: "600" },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6b7280" } },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { color: "#6b7280", callback: (v) => `${v}%` },
      },
    },
  };
  if (comparisonChart) comparisonChart.destroy();
  comparisonChart = new window.Chart(canvas.getContext("2d"), {
    type: "bar",
    data,
    options,
  });
};

export const applyFilters = () => {
  try {
    const asset = (document.getElementById("filter-asset")?.value || "")
      .trim()
      .toUpperCase();
    const start = document.getElementById("filter-start-date")?.value;
    const end = document.getElementById("filter-end-date")?.value;
    const startMs = start ? parseISODateLocal(start).getTime() : NaN;
    const endMs = end ? parseISODateLocal(end).getTime() : NaN;
    const includeSwing =
      document.getElementById("filter-include-swing")?.checked !== false;
    const includeDay =
      document.getElementById("filter-include-day")?.checked !== false;

    // Swing
    const swing = includeSwing
      ? (appState.operations || []).filter((op) => {
          const d = parseDate(op.date);
          const okAsset =
            !asset || op.assetSymbol?.toUpperCase().includes(asset);
          return okAsset && inRange(d, startMs, endMs);
        })
      : [];
    const totalSwing = swing.reduce(
      (acc, op) => acc + (Number(op.result) || 0),
      0
    );
    const swingWins = swing.filter((op) => Number(op.result) > 0).length;
    const swingLoss = swing.filter((op) => Number(op.result) < 0).length;

    // Day Trade
    const day = includeDay
      ? (appState.dayTradeOperations || []).filter((op) => {
          const d = parseDate(op.date);
          const okAsset =
            !asset || op.assetSymbol?.toUpperCase().includes(asset);
          return okAsset && inRange(d, startMs, endMs);
        })
      : [];
    const totalDay = day.reduce((acc, op) => acc + (Number(op.net) || 0), 0);
    const dayWins = day.filter((op) => Number(op.net) > 0).length;
    const dayLoss = day.filter((op) => Number(op.net) < 0).length;

    renderProfitLossChart(totalSwing, totalDay);
    renderRiskReturnChart(swingWins + dayWins, swingLoss + dayLoss);

    // Curva de capital cumulativa (ordenando por data)
    const series = [];
    if (includeSwing)
      series.push(
        ...swing.map((o) => ({ date: o.date, v: Number(o.result) || 0 }))
      );
    if (includeDay)
      series.push(...day.map((o) => ({ date: o.date, v: Number(o.net) || 0 })));
    series.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    let acc = 0;
    const points = series.map((s) => {
      acc += s.v;
      return { label: formatDateBR(s.date), value: acc };
    });
    renderEquityCurve(points);

    // Taxa de sucesso (win rate)
    const totalTrades = swingWins + swingLoss + dayWins + dayLoss;
    const winRatePct = totalTrades
      ? ((swingWins + dayWins) / totalTrades) * 100
      : 0;
    renderWinRateGauge(winRatePct);

    // Comparativo Evolução x Acertividade (amostragem nas mesmas labels da equity)
    const lbls = points.map((p) => p.label);
    const base = points.length ? points[0].value || 1 : 1;
    const equityPctSeries = points.map((p) =>
      base ? ((p.value - base) / Math.abs(base)) * 100 : 0
    );
    let winsAcc = 0;
    let totalAcc = 0;
    const winRatePctSeries = [];
    const opsByDate = {};
    swing.forEach((o) => {
      const k = formatDateBR(o.date);
      opsByDate[k] = opsByDate[k] || [];
      opsByDate[k].push({ v: Number(o.result) || 0 });
    });
    day.forEach((o) => {
      const k = formatDateBR(o.date);
      opsByDate[k] = opsByDate[k] || [];
      opsByDate[k].push({ v: Number(o.net) || 0 });
    });
    lbls.forEach((k) => {
      (opsByDate[k] || []).forEach((t) => {
        totalAcc += 1;
        if (t.v > 0) winsAcc += 1;
      });
      winRatePctSeries.push(totalAcc ? (winsAcc / totalAcc) * 100 : 0);
    });
    renderComparison(lbls, equityPctSeries, winRatePctSeries);
    showMessage("Filtros aplicados.", "success");
  } catch (e) {
    console.error(e);
    showMessage("Não foi possível aplicar os filtros.", "error");
  }
};
