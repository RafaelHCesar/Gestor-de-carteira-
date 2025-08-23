// Endpoints diretos (sem proxies)
const BRAPI_BASE_URL = "https://brapi.dev/api/quote/";

const nowMs = () => performance.now?.() ?? Date.now();

const fetchWithTimeout = async (
  url,
  options = {},
  timeoutMs = 3000,
  label = ""
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const started = nowMs();
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });
    const dur = (nowMs() - started).toFixed(0);
    console.log(`[price] ${label} HTTP ${res.status} em ${dur}ms -> ${url}`);
    return res;
  } catch (err) {
    const dur = (nowMs() - started).toFixed(0);
    console.log(
      `[price] ${label} erro em ${dur}ms -> ${url}:`,
      err?.name || err
    );
    throw err;
  } finally {
    clearTimeout(id);
  }
};

const fetchFromBrapi = async (symbol, timeoutMs = 2500) => {
  const fallbackToken = "VITE_BRAPI_TOKEN"; // token padrão fornecido
  const envToken = (import.meta?.env?.VITE_BRAPI_TOKEN || "").trim();
  const token = envToken || fallbackToken;
  const qs = `?token=${encodeURIComponent(token)}&range=1d&interval=1d`;
  const url = `${BRAPI_BASE_URL}${encodeURIComponent(symbol)}${qs}`;
  const response = await fetchWithTimeout(
    url,
    {},
    timeoutMs,
    `brapi(${symbol})`
  );
  if (!response.ok) return null;
  const data = await response.json();
  const result = data?.results?.[0];
  if (!result) return null;
  const priceCandidate =
    result?.regularMarketPrice ??
    result?.regularMarketPreviousClose ??
    result?.close ??
    result?.regularMarketOpen;
  if (typeof priceCandidate !== "number" || Number.isNaN(priceCandidate)) {
    return null;
  }
  return {
    price: priceCandidate,
    currency: result?.currency || "BRL",
    provider: "brapi",
    raw: result,
  };
};

// Yahoo via proxy está causando 401 em diversos ambientes; desativado por ora
const fetchFromYahoo = async () => null;

const fetchFromStooq = async (symbol, timeoutMs = 2000) => {
  const s = symbol.toLowerCase();
  // 1) Tenta JSON direto (mais robusto que CSV em alguns casos)
  const urlJson = `https://stooq.com/q/l/?s=${encodeURIComponent(
    s
  )}&i=d&o=json`;
  try {
    const resJson = await fetchWithTimeout(
      urlJson,
      {},
      timeoutMs,
      `stooq-json(${s})`
    );
    if (resJson.ok) {
      const arr = await resJson.json().catch(() => null);
      const rec = Array.isArray(arr) ? arr[0] : null;
      const close = parseFloat(
        String(rec?.close || rec?.Close || "").replace(",", ".")
      );
      if (isFinite(close)) {
        return {
          price: close,
          currency: "BRL",
          provider: "stooq-json",
          raw: rec,
        };
      }
    }
  } catch (_) {
    // segue para CSV
  }

  // 2) CSV com header estável
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(
    s
  )}&i=d&f=sd2t2ohlcv&c=1`;
  const response = await fetchWithTimeout(url, {}, timeoutMs, `stooq(${s})`);
  if (!response.ok) return null;
  const text = (await response.text()).trim();
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return null;
  const header = lines[0].split(/[,;\t\|]/).map((h) => h.trim().toLowerCase());
  const row = lines[1].split(/[,;\t\|]/).map((h) => h.trim());
  const indexOf = (name) => header.findIndex((h) => h === name);
  const getNum = (name) => {
    const idx = indexOf(name);
    if (idx < 0) return NaN;
    const raw = row[idx] || "";
    const normalized = raw.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(normalized.replace(/[^0-9.\-]/g, ""));
    return isFinite(num) ? num : NaN;
  };
  const vals = [getNum("close"), getNum("open"), getNum("high"), getNum("low")];
  const first = vals.find((v) => isFinite(v));
  if (!isFinite(first)) return null;
  return {
    price: first,
    currency: "BRL",
    provider: "stooq",
    raw: { provider: "stooq", header, row },
  };
};

const fetchFromAlphaVantage = async (symbol, timeoutMs = 3000) => {
  const key = (import.meta?.env?.VITE_ALPHA_VANTAGE_KEY || "").trim();
  if (!key) return null;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
    symbol
  )}&apikey=${encodeURIComponent(key)}`;
  const response = await fetchWithTimeout(
    url,
    {},
    timeoutMs,
    `alphavantage(${symbol})`
  );
  if (!response.ok) return null;
  const data = await response.json();
  const quote = data?.["Global Quote"];
  const priceCandidate = parseFloat(quote?.["05. price"]);
  if (!isFinite(priceCandidate)) return null;
  return {
    price: priceCandidate,
    currency: "BRL",
    provider: "alphavantage",
    raw: quote,
  };
};

// Fallbacks sem chave usando gateway r.jina.ai (CORS-friendly)
const fetchFromYahooViaJina = async (symbol, timeoutMs = 3000) => {
  const url = `https://r.jina.ai/http://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
    symbol
  )}`;
  const response = await fetchWithTimeout(
    url,
    {},
    timeoutMs,
    `yahoo-jina(${symbol})`
  );
  if (!response.ok) return null;
  const text = await response.text();
  // tenta JSON
  try {
    const data = JSON.parse(text);
    const q = data?.quoteResponse?.result?.[0];
    const priceCandidate =
      q?.regularMarketPrice ??
      q?.regularMarketPreviousClose ??
      q?.postMarketPrice;
    if (typeof priceCandidate === "number" && isFinite(priceCandidate)) {
      return {
        price: priceCandidate,
        currency: q?.currency || "BRL",
        provider: "yahoo-jina",
        raw: q,
      };
    }
  } catch (_) {
    // não era JSON
  }
  // regex como fallback
  const m = text.match(/"regularMarketPrice"\s*:\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const price = parseFloat(m[1]);
    if (isFinite(price)) {
      return {
        price,
        currency: "BRL",
        provider: "yahoo-jina-regex",
        raw: null,
      };
    }
  }
  return null;
};

const fetchFromBrapiViaJina = async (symbol, timeoutMs = 3000) => {
  const fallbackToken = "VITE_BRAPI_TOKEN"; // token padrão fornecido
  const token = envToken || fallbackToken;
  const qs = `?token=${encodeURIComponent(token)}&range=1d&interval=1d`;
  const url = `https://r.jina.ai/http://brapi.dev/api/quote/${encodeURIComponent(
    symbol
  )}${qs}`;
  const response = await fetchWithTimeout(
    url,
    {},
    timeoutMs,
    `brapi-jina(${symbol})`
  );
  if (!response.ok) return null;
  const text = await response.text();
  // tenta JSON
  try {
    const data = JSON.parse(text);
    const result = data?.results?.[0];
    const priceCandidate =
      result?.regularMarketPrice ??
      result?.regularMarketPreviousClose ??
      result?.close ??
      result?.regularMarketOpen;
    if (typeof priceCandidate === "number" && isFinite(priceCandidate)) {
      return {
        price: priceCandidate,
        currency: result?.currency || "BRL",
        provider: "brapi-jina",
        raw: result,
      };
    }
  } catch (_) {
    // não era JSON
  }
  // regex como fallback
  const m = text.match(/"regularMarketPrice"\s*:\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const price = parseFloat(m[1]);
    if (isFinite(price)) {
      return {
        price,
        currency: "BRL",
        provider: "brapi-jina-regex",
        raw: null,
      };
    }
  }
  return null;
};

const buildSymbolCandidates = (base) => {
  const up = base.toUpperCase();
  const list = [up];
  if (!up.endsWith(".SA")) list.push(`${up}.SA`);
  // Stooq usa lowercase e sufixo ".sa"
  const low = up.replace(/\.SA$/i, "").toLowerCase();
  list.push(`${low}.sa`);
  return Array.from(new Set(list));
};

export const fetchCurrentPrice = async (rawSymbol) => {
  const base = String(rawSymbol || "").trim();
  if (!base) throw new Error("Símbolo do ativo inválido");

  const symbols = buildSymbolCandidates(base);

  // Apenas BRAPI (solicitado)
  const providers = [fetchFromBrapi];

  const started = nowMs();
  const tasks = [];
  for (const s of symbols) {
    for (const p of providers) {
      tasks.push(p(s).catch(() => null));
    }
  }

  const results = await Promise.all(tasks.map((t) => t.catch(() => null)));
  const ok = results.find(
    (r) => r && typeof r.price === "number" && isFinite(r.price)
  );
  if (ok) {
    return ok;
  }

  throw new Error("Preço atual indisponível");
};
