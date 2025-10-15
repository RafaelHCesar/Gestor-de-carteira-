import {
  API,
  DEFAULT_SYMBOLS,
  DOM_IDS,
  PRIORITY_ASSETS,
} from "../config/constants.js";

export const defaultSymbols = DEFAULT_SYMBOLS;

export const populateDatalist = () => {
  const datalist = document.getElementById(DOM_IDS.SYMBOLS_DATALIST);
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
    document.getElementById(DOM_IDS.ASSET_SYMBOL),
    document.getElementById(DOM_IDS.DT_ASSET_SYMBOL),
  ].filter(Boolean);

  inputs.forEach((inp) => {
    inp.addEventListener("input", () => {
      const q = inp.value.trim();
      clearTimeout(debounceId);

      debounceId = setTimeout(async () => {
        if (q.length < API.AUTOCOMPLETE_MIN_CHARS) return;

        try {
          const envToken = (import.meta?.env?.VITE_BRAPI_TOKEN || "").trim();
          if (!envToken) {
            console.warn("⚠️ VITE_BRAPI_TOKEN não encontrado no arquivo .env");
            return;
          }

          const url = `${
            API.BRAPI_BASE_URL
          }/quote/list?search=${encodeURIComponent(q)}&token=${envToken}`;
          const res = await fetch(url);
          if (!res.ok) return;

          const data = await res.json();
          const list = (data?.stocks || []).slice(
            0,
            API.AUTOCOMPLETE_MAX_RESULTS
          );

          // Se for campo de Day Trade, preenche o datalist específico
          const isDayTrade = inp.id === DOM_IDS.DT_ASSET_SYMBOL;
          const datalistId = isDayTrade
            ? DOM_IDS.SYMBOLS_DT_DATALIST
            : DOM_IDS.SYMBOLS_DATALIST;
          const datalist = document.getElementById(datalistId);
          if (!datalist) return;

          datalist.innerHTML = "";

          // Ordenação por prioridade: WIN/WDO/BIT/IND/DOL primeiro
          const normalized = list
            .map((s) => (s?.stock || s?.code || s?.symbol || "").toUpperCase())
            .filter(Boolean);
          const unique = Array.from(new Set(normalized));

          unique.sort((a, b) => {
            const ia = PRIORITY_ASSETS.indexOf(a.replace(/\d+.*/, ""));
            const ib = PRIORITY_ASSETS.indexOf(b.replace(/\d+.*/, ""));
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
        } catch (error) {
          console.error("Erro no autocomplete:", error);
        }
      }, API.AUTOCOMPLETE_DEBOUNCE_MS);
    });
  });
};
