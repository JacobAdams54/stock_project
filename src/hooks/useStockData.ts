/**
 * USAGE EXAMPLES
 * -----------------------------------------------------------------------------
 * 1) Metadata-only (summary card)
 *
 * import { useStockMetadata } from './useStockData';
 *
 * function StockSummaryCard({ symbol }: { symbol: string }) {
 *   const { data: meta, loading, error } = useStockMetadata(symbol);
 *   if (loading) return <div>Loading…</div>;
 *   if (error || !meta) return <div>Error</div>;
 *   return (
 *     <div>
 *       <h3>{meta.companyName} ({symbol})</h3>
 *       <div>Sector: {meta.sector}</div>
 *       <div>Market Cap: {meta.marketCap}</div>
 *     </div>
 *   );
 * }
 *
 * 2) Full stock detail (metadata + summary + full history for charts)
 *
 * import { useStockData, useStockHistory } from './useStockData';
 *
 * function StockDetail({ symbol }: { symbol: string }) {
 *   const { data: summary, loading: loadingSummary } = useStockData(symbol);
 *   const { data: history, loading: loadingHistory } = useStockHistory(symbol);
 *   if (loadingSummary || loadingHistory) return <div>Loading…</div>;
 *   if (!summary || !history) return <div>Error</div>;
 *   // render summary fields + pass `history` to your chart component
 *   return <div>{summary.companyName} — {history.length} bars</div>;
 * }
 *
 * 3) All stocks metadata for a listing page
 *
 * import { useStocksList } from './useStockData';
 *
 * function StocksListing() {
 *   const { data: stocks, loading, error } = useStocksList();
 *   if (loading) return <div>Loading…</div>;
 *   if (error || !stocks) return <div>Error</div>;
 *   return (
 *     <ul>
 *       {stocks.map(s => (
 *         <li key={s.symbol}>{s.symbol} — {s.companyName} — {s.sector} — {s.marketCap}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * -----------------------------------------------------------------------------
 */

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

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Public shape returned by useStockData for a single stock symbol.
 */
export interface StockDetailData {
  /** Ticker symbol in uppercase (e.g., AAPL) */
  symbol: string;
  /** Company display name as stored in Firestore */
  companyName: string;
  /** Sector classification (e.g., Technology) */
  sector: string;
  /**
   * Human-readable market cap string (e.g., 2.34T, 980.12B).
   * Normalized by formatMarketCap.
   */
  marketCap: string;
  /** 52-week rolling high over the last ~252 trading days */
  fiftyTwoWeekHigh: number;
  /** 52-week rolling low over the last ~252 trading days */
  fiftyTwoWeekLow: number;
  /** Most recent closing price found in price history */
  currentPrice: number;
  /** Absolute day-over-day price change */
  change: number;
  /** Percentage day-over-day price change */
  changePercent: number;
}

/**
 * Internal metadata derived from Firestore stock docs.
 * Not exported directly; merged into StockDetailData.
 */
interface Metadata {
  companyName: string;
  sector: string;
  /** Human-readable market cap (e.g., 1.23T) */
  marketCap: string;
}

/**
 * Public type for components that only need stock metadata.
 */
export type StockMetadata = Metadata;

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Approximate number of trading days in a 52-week period.
 */
const HISTORY_DAYS_52W = 252;

/* -------------------------------------------------------------------------- */
/*                           FIRESTORE DAILY DOC TYPE                          */
/* -------------------------------------------------------------------------- */

/**
 * Firestore daily price document shape with flexible provider fields.
 * @property {number | string | undefined} o - Open price
 * @property {number | string | undefined} h - High price
 * @property {number | string | undefined} l - Low price
 * @property {number | string | undefined} c - Close/current price (preferred)
 * @property {number | string | undefined} close - Alternative close field
 * @property {number | string | undefined} adjClose - Adjusted close field
 * @property {number | string | undefined} price - Generic price field
 * @property {number | string | undefined} pc - Previous close
 * @property {number | string | undefined} p - Previous/other price representation
 * @property {number | string | undefined} v - Volume
 */
interface DailyPriceDoc {
  o?: number | string;
  h?: number | string;
  l?: number | string;
  c?: number | string;
  close?: number | string;
  adjClose?: number | string;
  price?: number | string;
  pc?: number | string;
  p?: number | string;
  v?: number | string;
}

/**
 * Derived price summary used by readAndSummarizePrices and merged into StockDetailData.
 *
 * @property {number} fiftyTwoWeekHigh - Highest high over the last ~252 trading days
 * @property {number} fiftyTwoWeekLow - Lowest low over the last ~252 trading days
 * @property {number} currentPrice - Most recent close price
 * @property {number} change - Absolute day-over-day change (current - previous close)
 * @property {number} changePercent - Percentage day-over-day change
 */
interface PriceSummary {
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currentPrice: number;
  change: number;
  changePercent: number;
}

/* -------------------------------------------------------------------------- */
/*                               CUSTOM ERRORS                                */
/* -------------------------------------------------------------------------- */

/**
 * Error thrown when expected Firestore documents or data are missing.
 * Example: missing metadata or empty price collection for a symbol.
 */
class DataNotFoundError extends Error {
  /**
   * @param {string} entity - Human-readable entity name (e.g., "metadata")
   * @param {string} symbol - Stock symbol associated with the missing data
   */
  constructor(entity: string, symbol: string) {
    const e = entity.toLowerCase();
    const prefix =
      e === 'metadata'
        ? 'Missing metadata'
        : e.includes('price')
          ? 'No price data'
          : `Missing ${entity}`;
    super(`${prefix} for symbol "${symbol}"`);
    this.name = 'DataNotFoundError';
  }
}

/**
 * Error thrown when a document exists but fields are invalid or unparseable.
 * Example: non-numeric price or malformed market cap.
 */
class InvalidDataError extends Error {
  /**
   * @param {string} entity - Data type label (e.g., "price", "marketCap")
   * @param {string} [details] - Optional additional context
   */
  constructor(entity: string, details?: string) {
    super(`Invalid ${entity}${details ? `: ${details}` : ''}`);
    this.name = 'InvalidDataError';
  }
}

/* -------------------------------------------------------------------------- */
/*                               HELPER UTILS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Normalize market capitalization into a human-readable string.
 * Accepts numeric or string inputs; falls back to number parsing.
 * @param {unknown} value - Raw market cap from Firestore
 * @returns {string} Human-readable value (e.g., "1.25T", "980.00B")
 * @throws {InvalidDataError} If value cannot be parsed into a finite number
 */
function formatMarketCap(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) throw new InvalidDataError('marketCap');

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
  return n.toFixed(2);
}

/**
 * Extract a plausible "close" price from heterogeneous provider fields.
 * Preference order:
 * 1) c (provider close/current)
 * 2) close
 * 3) adjClose
 * 4) price
 * 5) pc/p (previous close) as last-resort fallback
 * Note: Using previous close can understate intraday moves; only used if no close-like field exists.
 * @param {DailyPriceDoc} docData - The daily price document containing various price fields
 * @param {string} idLabel - Identifier label for error reporting context
 * @returns {number} The selected plausible close price for the day
 * @throws {InvalidDataError} If no valid price field is found
 */
function pickDailyPrice(docData: DailyPriceDoc, idLabel: string): number {
  const candidates = [
    docData?.c,
    docData?.close,
    docData?.adjClose,
    docData?.price,
    docData?.pc,
    docData?.p,
  ];
  const found = candidates.find((v) => Number.isFinite(Number(v)));
  if (found == null)
    throw new InvalidDataError('price', `daily doc ${idLabel}`);
  return Number(found);
}

/* -------------------------------------------------------------------------- */
/*                              FIRESTORE READS                               */
/* -------------------------------------------------------------------------- */

/**
 * Read core stock metadata from Firestore.
 * Checks both "stocks/{symbol}" and "stocks/{symbol}/stats/profile"
 * and returns the first valid match with required fields.
 * @async
 * @param {string} symbol - Uppercase stock symbol
 * @returns {Promise<Metadata>} Company name, sector, and normalized market cap
 * @throws {DataNotFoundError} If no valid metadata document is found
 * @external Firebase Firestore
 */
async function readMetadata(symbol: string): Promise<Metadata> {
  const [rootSnap, profileSnap] = await Promise.all([
    getDoc(doc(db, 'stocks', symbol)),
    getDoc(doc(db, 'stocks', symbol, 'stats', 'profile')),
  ]);

  for (const snap of [rootSnap, profileSnap]) {
    if (snap.exists()) {
      const d = snap.data() as any;
      const marketCap = d.marketCap ?? d.marketcap ?? d.mktCap;
      if (d.companyName && d.sector && marketCap != null) {
        return {
          companyName: String(d.companyName),
          sector: String(d.sector),
          marketCap: formatMarketCap(marketCap),
        };
      }
    }
  }

  throw new DataNotFoundError('metadata', symbol);
}

/**
 * Read and summarize the last ~52-week daily prices for a symbol.
 * Computes rolling high/low, last close, and day-over-day change.
 * @async
 * @param {string} symbol - Uppercase stock symbol
 * @returns {Promise<PriceSummary>} Derived price summary
 * @throws {DataNotFoundError} If no price documents are available
 * @throws {InvalidDataError} If price fields are missing or invalid
 * @external Firebase Firestore
 */
async function readAndSummarizePrices(symbol: string): Promise<PriceSummary> {
  const dailyRef = collection(db, 'prices', symbol, 'daily');
  const qy = query(
    dailyRef,
    orderBy(documentId()),
    limitToLast(HISTORY_DAYS_52W)
  );
  const snap = await getDocs(qy);

  if (snap.empty) throw new DataNotFoundError('price data', symbol);

  let high = -Infinity;
  let low = Infinity;
  let prevClose = 0;
  let lastClose = 0;

  // Iterate in ascending order by documentId; keep previous/last closes.
  for (const d of snap.docs) {
    const data = d.data() as DailyPriceDoc;
    const close = pickDailyPrice(data, d.id);
    const h = Number.isFinite(data?.h) ? Number(data.h) : close;
    const l = Number.isFinite(data?.l) ? Number(data.l) : close;

    if (h > high) high = h;
    if (l < low) low = l;

    prevClose = lastClose;
    lastClose = close;
  }

  if (!Number.isFinite(high) || !Number.isFinite(low))
    throw new InvalidDataError('52-week high/low');

  const change = lastClose - (prevClose || lastClose);
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;

  return {
    fiftyTwoWeekHigh: high,
    fiftyTwoWeekLow: low,
    currentPrice: lastClose,
    change,
    changePercent,
  };
}

/* -------------------------------------------------------------------------- */
/*                                MAIN HOOK                                   */
/* -------------------------------------------------------------------------- */

/**
 * React hook that loads stock metadata and price summary for a symbol.
 * One-time Firestore reads; no in-memory caching.
 *
 * @param {string | undefined} symbol - Stock symbol input; falsy clears state
 * @returns {{
 *   data: StockDetailData | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 *
 * @example
 * const { data, loading, error } = useStockData('AAPL');
 */
export const useStockData = (symbol: string | undefined) => {
  const [data, setData] = useState<StockDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const sym = symbol.trim().toUpperCase();

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [meta, prices] = await Promise.all([
          readMetadata(sym),
          readAndSummarizePrices(sym),
        ]);
        const result: StockDetailData = {
          symbol: sym,
          ...meta,
          ...prices,
        };

        if (cancelled) return;
        setData(result);
      } catch (e) {
        if (cancelled) return;
        let err = e instanceof Error ? e : new Error('Unknown error');
        const anyErr = err as any;
        if (
          typeof anyErr?.code === 'string' &&
          anyErr.code === 'failed-precondition' &&
          /index/i.test(err.message || '')
        ) {
          err = new Error(
            'Firestore index required for price history query. Open the provided link in the error message to create the index, wait until it builds, then retry.\n' +
              (err.message || '')
          );
        }
        setError(err);
        setData(null);
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

/* -------------------------------------------------------------------------- */
/*                        ADDITION: METADATA-ONLY HOOK                        */
/* -------------------------------------------------------------------------- */

/**
 * Hook to fetch metadata only (companyName, sector, marketCap).
 * Use this for lightweight summary cards that don’t need prices.
 *
 * @param {string | undefined} symbol - Stock ticker
 * @returns {{
 *   data: StockMetadata | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 * @example
 * const { data: meta } = useStockMetadata('AAPL');
 */
export function useStockMetadata(symbol: string | undefined) {
  const [data, setData] = useState<StockMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const sym = symbol.trim().toUpperCase();
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const meta = await readMetadata(sym);
        if (cancelled) return;
        setData(meta);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error('Unknown error'));
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { data, loading, error };
}

/* -------------------------------------------------------------------------- */
/*                        ADDITION: HISTORY + LIST HOOKS                      */
/* -------------------------------------------------------------------------- */

/**
 * Normalized OHLCV bar for charting.
 */
export interface PriceBar {
  /** Sortable key (expected YYYY-MM-DD from document ID) */
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

/**
 * Item for the stock listing page.
 */
export interface StockIndexItem {
  symbol: string;
  companyName: string;
  sector: string;
  marketCap: string;
}

/**
 * Read full daily price history for a symbol.
 * Ordered ascending by documentId (oldest -> newest).
 *
 * @param {string} symbol
 * @returns {Promise<PriceBar[]>}
 * @throws {DataNotFoundError} If no documents exist
 */
async function readPriceHistory(symbol: string): Promise<PriceBar[]> {
  const dailyRef = collection(db, 'prices', symbol, 'daily');
  const qy = query(dailyRef, orderBy(documentId()));
  const snap = await getDocs(qy);
  if (snap.empty) throw new DataNotFoundError('price data', symbol);

  const bars: PriceBar[] = [];
  for (const d of snap.docs) {
    const raw = d.data() as DailyPriceDoc;
    const c = pickDailyPrice(raw, d.id);
    const o = Number.isFinite(Number(raw?.o)) ? Number(raw.o) : c;
    const h = Number.isFinite(Number(raw?.h)) ? Number(raw.h) : c;
    const l = Number.isFinite(Number(raw?.l)) ? Number(raw.l) : c;
    const v = Number.isFinite(Number(raw?.v)) ? Number(raw.v) : undefined;

    bars.push({ t: d.id, o, h, l, c, v });
  }
  return bars;
}

/**
 * Hook to fetch full price history for charts.
 * One-time fetch; no caching.
 *
 * @param {string | undefined} symbol
 * @returns {{
 *   data: PriceBar[] | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 * @example
 * const { data: bars } = useStockHistory('AAPL');
 */
export function useStockHistory(symbol: string | undefined) {
  const [data, setData] = useState<PriceBar[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol?.trim()) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    const sym = symbol.trim().toUpperCase();
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const bars = await readPriceHistory(sym);
        if (cancelled) return;
        setData(bars);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error('Unknown error'));
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { data, loading, error };
}

/**
 * Fetch all symbols and their metadata for the listing page.
 * For <=100 symbols, a simple fan-out is acceptable.
 *
 * @returns {Promise<StockIndexItem[]>}
 */
async function readAllStocksList(): Promise<StockIndexItem[]> {
  const stocksSnap = await getDocs(collection(db, 'stocks'));
  if (stocksSnap.empty) return [];

  const symbols = stocksSnap.docs.map((d) => d.id);
  const items = await Promise.all(
    symbols.map(async (sym) => {
      try {
        const meta = await readMetadata(sym);
        return { symbol: sym, ...meta };
      } catch {
        return null;
      }
    })
  );
  return items.filter(Boolean) as StockIndexItem[];
}

/**
 * Hook to fetch all stocks + metadata for a listing.
 * One-time fetch; no caching.
 *
 * @returns {{
 *   data: StockIndexItem[] | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 * @example
 * const { data: stocks } = useStocksList();
 */
export function useStocksList() {
  const [data, setData] = useState<StockIndexItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await readAllStocksList();
        if (cancelled) return;
        setData(list);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error('Unknown error'));
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
