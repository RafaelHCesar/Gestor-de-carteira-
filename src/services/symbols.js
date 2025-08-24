export const defaultSymbols = [
  "PETR4",
  "PETR3",
  "VALE3",
  "ITUB4",
  "BBDC4",
  "BBAS3",
  "ABEV3",
  "WEGE3",
  "SUZB3",
  "PRIO3",
  "MGLU3",
  "RAIL3",
  "GGBR4",
  "CSNA3",
  "USIM5",
  "ELET3",
  "ELET6",
  "JBSS3",
  "BRFS3",
  "LREN3",
  "RENT3",
  "HAPV3",
  "B3SA3",
];

export const populateDatalist = () => {
  const datalist = document.getElementById("symbols-datalist");
  if (!datalist) return;
  datalist.innerHTML = "";
  for (const s of defaultSymbols) {
    const opt = document.createElement("option");
    opt.value = s;
    datalist.appendChild(opt);
    const optSa = document.createElement("option");
    optSa.value = `${s}.SA`;
    datalist.appendChild(optSa);
  }
};

let debounceId;
export const wireDynamicAutocomplete = () => {
  const inputs = [
    document.getElementById("asset-symbol"),
    document.getElementById("dt-asset-symbol"),
  ].filter(Boolean);
  inputs.forEach((inp) => {
    inp.addEventListener("input", () => {
      const q = inp.value.trim();
      clearTimeout(debounceId);
      debounceId = setTimeout(async () => {
        if (q.length < 2) return;
        try {
          const envToken = (import.meta?.env?.VITE_BRAPI_TOKEN || "").trim();
          if (!envToken) {
            console.warn("⚠️ VITE_BRAPI_TOKEN não encontrado no arquivo .env");
            return;
          }
          const token = envToken;
          const url = `/brapi/api/quote/list?search=${encodeURIComponent(
            q
          )}&token=${token}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          const list = (data?.stocks || []).slice(0, 50);

          // Se for campo de Day Trade, preenche o datalist específico
          const isDayTrade = inp.id === "dt-asset-symbol";
          const datalistId = isDayTrade
            ? "symbols-dt-datalist"
            : "symbols-datalist";
          const datalist = document.getElementById(datalistId);
          if (!datalist) return;
          datalist.innerHTML = "";

          // Ordenação por prioridade em DT: WIN/WDO/BIT/IND/DOL primeiro
          const priority = ["WIN", "WDO", "BIT", "IND", "DOL"];
          const normalized = list
            .map((s) => (s?.stock || s?.code || s?.symbol || "").toUpperCase())
            .filter(Boolean);
          const unique = Array.from(new Set(normalized));
          unique.sort((a, b) => {
            const ia = priority.indexOf(a.replace(/\d+.*/, ""));
            const ib = priority.indexOf(b.replace(/\d+.*/, ""));
            const pa = ia === -1 ? 999 : ia;
            const pb = ib === -1 ? 999 : ib;
            if (pa !== pb) return pa - pb;
            return a.localeCompare(b);
          });
          for (const val of unique) {
            const opt = document.createElement("option");
            opt.value = val;
            datalist.appendChild(opt);
          }
        } catch (_) {
          // ignora erros silenciosamente
        }
      }, 300);
    });
  });
};
