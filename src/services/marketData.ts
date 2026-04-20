/**
 * Market Data Service
 * Fetches live stock prices and market indices from Yahoo Finance
 * Routed through Vite dev proxy at /api/yahoo-finance to bypass CORS
 */

const YAHOO_PROXY_BASE = '/api/yahoo-finance/v8/finance/chart';

// Indian stock tickers with NSE suffix for Yahoo Finance
const TICKER_MAP: Record<string, string> = {
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'INFY': 'INFY.NS',
  'SBIN': 'SBIN.NS',
  'NIFTY': '^NSEI',
  'SENSEX': '^BSESN',
  'BANKNIFTY': '^NSEBANK'
};

export interface PriceData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

// Simple in-memory cache to be a good citizen
const priceCache: Record<string, { data: PriceData; expiry: number }> = {};
const CACHE_TTL_MS = 25_000; // 25 seconds
const rateLimitUntil: Record<string, number> = {};
const RATE_LIMIT_COOLDOWN_MS = 60_000; // 60 seconds

/**
 * Fetch live price for a single ticker via the Vite proxy → Yahoo Finance
 */
async function fetchSinglePrice(yahooTicker: string): Promise<PriceData | null> {
  const cooldown = rateLimitUntil[yahooTicker];
  if (cooldown && Date.now() < cooldown) {
    return priceCache[yahooTicker]?.data ?? null;
  }
  // Check cache first
  const cached = priceCache[yahooTicker];
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  try {
    const url = `${YAHOO_PROXY_BASE}/${encodeURIComponent(yahooTicker)}?interval=1d&range=1d`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        rateLimitUntil[yahooTicker] = Date.now() + RATE_LIMIT_COOLDOWN_MS;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice || meta.previousClose;
    const prevClose = meta.previousClose;
    const change = currentPrice - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    const priceData: PriceData = {
      ticker: yahooTicker,
      price: currentPrice,
      change,
      changePercent,
      timestamp: Date.now()
    };

    // Update cache
    priceCache[yahooTicker] = { data: priceData, expiry: Date.now() + CACHE_TTL_MS };

    return priceData;
  } catch (error) {
    console.error(`Error fetching price for ${yahooTicker}:`, error);
    return cached?.data ?? null;
  }
}

/**
 * Fetch live prices for multiple stock tickers
 */
export async function fetchLivePrices(tickers: string[]): Promise<Record<string, PriceData>> {
  const yahooTickers = tickers.map(t => TICKER_MAP[t] || t);
  const results = await Promise.all(yahooTickers.map(fetchSinglePrice));

  const priceMap: Record<string, PriceData> = {};
  results.forEach((data, index) => {
    if (data) {
      priceMap[tickers[index]] = data;
    }
  });

  return priceMap;
}

/**
 * Fetch market indices (Nifty 50, Sensex, Bank Nifty)
 */
export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  const indices = [
    { key: 'NIFTY', name: 'Nifty 50' },
    { key: 'SENSEX', name: 'BSE Sensex' },
    { key: 'BANKNIFTY', name: 'Nifty Bank' }
  ];

  const results = await Promise.all(
    indices.map(idx => fetchSinglePrice(TICKER_MAP[idx.key]))
  );

  return results.filter((r): r is PriceData => r !== null).map(r => ({
    name: indices.find(i => TICKER_MAP[i.key] === r.ticker)!.name,
    value: r.price,
    change: r.change,
    changePercent: r.changePercent
  }));
}

/**
 * Fetch detailed stock info for prediction engine
 */
export async function fetchStockDetails(ticker: string): Promise<PriceData | null> {
  const yahooTicker = TICKER_MAP[ticker] || ticker;
  return fetchSinglePrice(yahooTicker);
}

/**
 * Create a polling interval for continuous price updates
 */
export function createPricePoller(
  tickers: string[],
  callback: (prices: Record<string, PriceData>) => void,
  intervalMs: number = 30000
): () => void {
  let mounted = true;
  let intervalId: NodeJS.Timeout;

  const poll = async () => {
    if (!mounted) return;
    const prices = await fetchLivePrices(tickers);
    callback(prices);
  };

  // Initial fetch
  poll();

  // Set up polling
  intervalId = setInterval(poll, intervalMs);

  // Return cleanup function
  return () => {
    mounted = false;
    clearInterval(intervalId);
  };
}
