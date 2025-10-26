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
 * Internal structure summarizing price history.
 * Not exported directly; merged into StockDetailData.
 */
interface PriceSummary {
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currentPrice: number;
  change: number;
  changePercent: number;
}

/**
 * Flexible shape for daily price documents from multiple providers.
 * Common provider schema: c (close), o (open), h (high), l (low), v (volume), pc/p (previous close).
 */
interface DailyPriceDoc {
  /** Explicit close price (if normalized upstream) */
  close?: number;
  /** Adjusted close (split/dividend adjusted) */
  adjClose?: number;
  /** Generic price field used by some sources */
  price?: number;

  /** Provider: daily close/current price */
  c?: number;
  /** Provider: previous close (Finnhub-style) */
  pc?: number;
  /** Provider: previous close (alternate) */
  p?: number;

  /** Provider: high of day */
  h?: number;
  /** Provider: low of day */
  l?: number;
  /** Provider: open of day */
  o?: number;
  /** Provider: volume of day */
  v?: number;
}

/* -------------------------------------------------------------------------- */
/*                                   CACHE                                    */
/* -------------------------------------------------------------------------- */

/**
 * In-memory cache time-to-live in milliseconds.
 * Keeps Firestore load low during rapid UI interactions.
 */
const CACHE_TTL_MS = 60_000;

/**
 * Trading days approximating a rolling 52-week window.
 * Used to bound the price history query.
 */
const HISTORY_DAYS_52W = 252; // ~trading days in a year

/**
 * Simple in-memory cache keyed by symbol.
 * Note: Resets on page reload; not persisted.
 */
const memoryCache = new Map<
  string,
  { data: StockDetailData; timestamp: number }
>();

/**
 * Get a cached StockDetailData if present and not expired.
 * @param {string} symbol - Uppercase ticker symbol
 * @returns {StockDetailData | null} Cached value or null if missing/expired
 */
function getCached(symbol: string): StockDetailData | null {
  const entry = memoryCache.get(symbol);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(symbol);
    return null;
  }
  return entry.data;
}

/**
 * Insert or update a cached StockDetailData for the given symbol.
 * @param {string} symbol - Uppercase ticker symbol
 * @param {StockDetailData} data - Value to cache
 * @returns {void}
 */
function putCached(symbol: string, data: StockDetailData) {
  memoryCache.set(symbol, { data, timestamp: Date.now() });
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
 *
 * Behavior:
 * - Normalizes the symbol to uppercase and trims whitespace.
 * - Uses an in-memory TTL cache to avoid redundant Firestore reads.
 * - Performs parallel Firestore reads for metadata and price history.
 * - Cancels state updates when the component unmounts or symbol changes.
 *
 * Side effects:
 * - Reads from Firebase Firestore (external dependency).
 * - Writes to an in-memory cache for up to CACHE_TTL_MS.
 *
 * @param {string | undefined} symbol - Stock symbol input; falsy clears state
 * @returns {{
 *   data: StockDetailData | null,
 *   loading: boolean,
 *   error: Error | null
 * }} Object with current data, loading state, and error (if any)
 *
 * @example
 * const { data, loading, error } = useStockData('AAPL');
 * if (loading) return <Spinner />;
 * if (error) return <ErrorBanner message={error.message} />;
 * return <StockCard stock={data!} />;
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
    const cached = getCached(sym);

    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return; // avoid redundant reads within TTL
    }

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
        putCached(sym, result);
      } catch (e) {
        if (cancelled) return;
        let err = e instanceof Error ? e : new Error('Unknown error');
        // Developer-friendly hint when Firestore index is missing
        // FirebaseError.code === 'failed-precondition' typically indicates an index is required
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
