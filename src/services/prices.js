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
    console.log(`[price] ${label} → HTTP ${res.status} em ${dur}ms`);
    return res;
  } catch (err) {
    const dur = (nowMs() - started).toFixed(0);
    console.warn(
      `[price] ${label} erro em ${dur}ms -> ${url}`,
      err?.name || err
    );
    throw err;
  } finally {
    clearTimeout(id);
  }
};

// ---- Token util ----
const getBrapiToken = () => import.meta.env.VITE_BRAPI_TOKEN?.trim() || "";

// ---- Cache em memória ----
const priceCache = new Map(); // { symbol: { data, timestamp } }
const CACHE_TTL = 30_000; // 30 segundos
const CACHE_MAX_SIZE = 100; // máximo de ativos no cache

const setCache = (symbol, data) => {
  if (priceCache.size >= CACHE_MAX_SIZE) {
    // descarta o mais antigo (FIFO)
    const firstKey = priceCache.keys().next().value;
    if (firstKey) priceCache.delete(firstKey);
  }
  priceCache.set(symbol, { data, timestamp: nowMs() });
};

const getCache = (symbol) => {
  const cached = priceCache.get(symbol);
  if (cached && nowMs() - cached.timestamp < CACHE_TTL) {
    console.log(
      `[price] ⚡ cache hit ${symbol} via ${cached.data.provider}: ${cached.data.price}`
    );
    return cached.data;
  }
  return null;
};

// ---- Providers ----
const fetchFromBrapi = async (symbol, timeoutMs = 2500) => {
  const token = getBrapiToken();
  if (!token) {
    console.warn("⚠️ Nenhum token BRAPI encontrado (.env)");
    return null;
  }
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

  if (typeof priceCandidate !== "number" || Number.isNaN(priceCandidate))
    return null;

  return {
    price: priceCandidate,
    currency: result?.currency || "BRL",
    provider: "brapi",
    raw: result,
  };
};

const fetchFromStooq = async (symbol, timeoutMs = 2000) => {
  const s = symbol.toLowerCase();
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
  } catch (_) {}
  return null;
};

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
  } catch (_) {}
  return null;
};

// ---- Util ----
const buildSymbolCandidates = (base) => {
  const up = base.toUpperCase();
  const list = [up];
  if (!up.endsWith(".SA")) list.push(`${up}.SA`);
  const low = up.replace(/\.SA$/i, "").toLowerCase();
  list.push(`${low}.sa`);
  return Array.from(new Set(list));
};

// ---- API Principal ----
export const fetchCurrentPrice = async (rawSymbol) => {
  const base = String(rawSymbol || "").trim();
  if (!base) throw new Error("Símbolo do ativo inválido");

  // 🔹 Verifica cache
  const cached = getCache(base);
  if (cached) return cached;

  const symbols = buildSymbolCandidates(base);

  // Ordem de fallback: BRAPI → Stooq → Yahoo-Jina
  const providers = [fetchFromBrapi, fetchFromStooq, fetchFromYahooViaJina];

  for (const s of symbols) {
    for (const provider of providers) {
      try {
        const result = await provider(s);
        if (
          result &&
          typeof result.price === "number" &&
          isFinite(result.price)
        ) {
          console.log(
            `[price] ✅ ${s} via ${result.provider}: ${result.price}`
          );
          setCache(base, result); // 🔹 salva no cache com limite
          return result;
        }
      } catch (err) {
        console.warn(
          `[price] Falha em ${provider.name}(${s}):`,
          err?.message || err
        );
      }
    }
  }

  throw new Error("Preço atual indisponível em todos os provedores");
};
