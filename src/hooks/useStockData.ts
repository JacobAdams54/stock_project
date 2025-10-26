import { useEffect, useState } from 'react';
import {
  collection,
  documentId,
  getDoc,
  getDocs,
  limitToLast,
  orderBy,
  query,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Data needed for the KeyStatistics component
 */
export interface KeyStatisticsData {
  symbol: string;
  companyName: string;
  sector: string;
  marketCap: string; // formatted string for display (e.g., "2.75T")
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

/**
 * In-memory cache to reduce repeat reads to Firestore within TTL
 */
const memoryCache = new Map<
  string,
  { data: KeyStatisticsData; timestamp: number }
>();
const CACHE_TTL_MS = 60_000;
const HISTORY_DAYS_52W = 252; // ~trading days in 52 weeks

/**
 * Format a market cap value into a human-readable string.
 * Accepts a string (already formatted) or a number.
 */
function formatMarketCap(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error('Invalid marketCap');
  const abs = Math.abs(n);
  const units = [
    { v: 1e12, s: 'T' },
    { v: 1e9, s: 'B' },
    { v: 1e6, s: 'M' },
    { v: 1e3, s: 'K' },
  ];
  for (const u of units) {
    if (abs >= u.v) return `${(n / u.v).toFixed(2)}${u.s}`;
  }
  return n.toFixed(0);
}

/**
 * Extract a close price from a daily price document.
 * Tries common fields: close, adjClose, price, c, p.
 */
function pickDailyPrice(docData: any, idLabel: string): number {
  const candidates = [
    docData?.close,
    docData?.adjClose,
    docData?.price,
    docData?.c,
    docData?.p,
  ];
  const found = candidates.find((v) => Number.isFinite(Number(v)));
  if (found == null)
    throw new Error(`Missing close price in daily doc ${idLabel}`);
  const n = Number(found);
  if (!Number.isFinite(n))
    throw new Error(`Invalid price in daily doc ${idLabel}`);
  return n;
}

/**
 * Compute 52-week high/low from a list of prices.
 */
function computeHighLow(prices: number[]) {
  let high = -Infinity;
  let low = Infinity;
  for (const p of prices) {
    if (p > high) high = p;
    if (p < low) low = p;
  }
  if (!Number.isFinite(high) || !Number.isFinite(low)) {
    throw new Error('Failed to compute 52-week high/low');
  }
  return { high, low };
}

/**
 * Simple cache helpers
 */
function getCached(symbol: string): KeyStatisticsData | null {
  const entry = memoryCache.get(symbol);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(symbol);
    return null;
  }
  return entry.data;
}

function putCached(symbol: string, data: KeyStatisticsData) {
  memoryCache.set(symbol, { data, timestamp: Date.now() });
}

/**
 * Read company metadata for KeyStatistics.
 * Tries:
 *  - stocks/{TICKER} doc with fields companyName, sector, marketCap
 *  - stocks/{TICKER}/stats/profile doc (same fields)
 */
async function readMetadata(symbol: string): Promise<{
  companyName: string;
  sector: string;
  marketCap: string;
}> {
  // 1) stocks/{TICKER}
  const rootRef = doc(db, 'stocks', symbol);
  const rootSnap = await getDoc(rootRef);
  if (rootSnap.exists()) {
    const d = rootSnap.data() as any;
    if (
      d?.companyName &&
      d?.sector &&
      (d?.marketCap ?? d?.marketcap ?? d?.mktCap) != null
    ) {
      return {
        companyName: String(d.companyName),
        sector: String(d.sector),
        marketCap: formatMarketCap(d.marketCap ?? d.marketcap ?? d.mktCap),
      };
    }
  }

  // 2) stocks/{TICKER}/stats/profile
  const profileRef = doc(db, 'stocks', symbol, 'stats', 'profile');
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) {
    const d = profileSnap.data() as any;
    if (
      d?.companyName &&
      d?.sector &&
      (d?.marketCap ?? d?.marketcap ?? d?.mktCap) != null
    ) {
      return {
        companyName: String(d.companyName),
        sector: String(d.sector),
        marketCap: formatMarketCap(d.marketCap ?? d.marketcap ?? d.mktCap),
      };
    }
  }

  // If your schema is stocks/{TICKER}/{stat} with each stat in its own doc,
  // uncomment and adapt this block:
  // const companyNameDoc = await getDoc(doc(db, 'stocks', symbol, 'companyName', 'current'));
  // const sectorDoc = await getDoc(doc(db, 'stocks', symbol, 'sector', 'current'));
  // const marketCapDoc = await getDoc(doc(db, 'stocks', symbol, 'marketCap', 'current'));

  throw new Error(
    `Missing metadata for "${symbol}" (companyName/sector/marketCap)`
  );
}

/**
 * Read recent daily prices and compute 52-week high/low.
 * From: prices/{TICKER}/daily (docId = YYYY-MM-DD)
 */
async function readHighLowFromPrices(symbol: string): Promise<{
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}> {
  const dailyRef = collection(db, 'prices', symbol, 'daily');
  const qy = query(
    dailyRef,
    orderBy(documentId()),
    limitToLast(HISTORY_DAYS_52W)
  );
  const snap = await getDocs(qy);

  if (snap.empty) {
    throw new Error(`No price data found for "${symbol}"`);
  }

  const prices: number[] = [];
  for (const d of snap.docs) {
    try {
      prices.push(pickDailyPrice(d.data(), d.id));
    } catch {
      // Skip malformed docs; we still require at least one price
    }
  }
  if (prices.length === 0) {
    throw new Error(`No valid prices found for "${symbol}"`);
  }

  const { high, low } = computeHighLow(prices);
  return { fiftyTwoWeekHigh: high, fiftyTwoWeekLow: low };
}

/**
 * Custom hook: loads only the fields required by KeyStatistics from Firestore.
 * - Metadata: stocks/{TICKER}[ or stocks/{TICKER}/stats/profile]
 * - Prices: prices/{TICKER}/daily (last ~252 entries)
 *
 * Returns an error if any required data is missing.
 *
 * @param {string | undefined} symbol - Stock ticker (e.g., "AAPL")
 * @returns {{ data: KeyStatisticsData | null, loading: boolean, error: Error | null }}
 * @example
 * const { data, loading, error } = useStockData('AAPL');
 */
export const useStockData = (symbol: string | undefined) => {
  const [data, setData] = useState<KeyStatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol || !symbol.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const sym = symbol.trim().toUpperCase();

    const cached = getCached(sym);
    if (cached) setData(cached);

    let cancelled = false;
    setLoading(!cached);
    setError(null);

    (async () => {
      try {
        const [meta, hl] = await Promise.all([
          readMetadata(sym),
          readHighLowFromPrices(sym),
        ]);

        const result: KeyStatisticsData = {
          symbol: sym,
          companyName: meta.companyName,
          sector: meta.sector,
          marketCap: meta.marketCap,
          fiftyTwoWeekHigh: hl.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: hl.fiftyTwoWeekLow,
        };

        if (cancelled) return;
        setData(result);
        putCached(sym, result);
      } catch (e) {
        if (cancelled) return;
        setData(null);
        setError(
          e instanceof Error ? e : new Error('Failed to load key statistics')
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { data, loading, error };
};
