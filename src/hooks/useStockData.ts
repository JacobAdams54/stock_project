/**
 * useStockData.ts
 * -----------------------------------------------------------------------------
 * Purpose
 * - Minimal data layer for Stalk.ai.
 * - Fetches stock summaries from /stocks/{ticker} and daily history from
 *   /stock_prices/{ticker}.daily (single document read) in Firestore.
 *
 * What’s included
 * - readStockSummary(symbol)          → single /stocks/{symbol}
 * - readAllStockSummaries()           → all symbols from constants/tickers.ts
 * - readPriceHistory(symbol)          → daily bars from /stock_prices/{symbol}
 * - Hooks: useStockSummaryDoc, useAllStockSummaries, usePriceHistory
 *
 * What was removed
 * - Legacy functions and types (useStockData, useStockHistory, useStockMetadata,
 *   formatMarketCap, pickDailyPrice, etc.). This file now focuses only on the
 *   fields explicitly allowed for the summary card and on basic OHLC history.
 *
 * Education notes
 * - Prefer separating “functions that fetch” from “hooks that manage state”.
 * - Hooks below are thin wrappers around the pure fetcher functions.
 */

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore'; 
import { db } from '../firebase/firebase';
import { TICKERS } from '../constants/tickers';
import type { Ticker } from '../constants/tickers';
/* ----------------------------------------------------------------------------
 * Types
 * --------------------------------------------------------------------------*/

/**
 * Fields stored in Firestore /stocks/{ticker} documents.
 * Only these are allowed in UI components (e.g., StockCard).
 */
export interface StockRealtimeFields {
  address1: string;
  change24hPercent: number;
  city: string;
  companyName: string;
  country: string;
  currentPrice: number;
  dividendYield: number;
  dividendYieldPercent: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  industry: string;
  marketCap: number;
  open: number;
  peRatio: number;
  sector: string;
  state: string;
  updatedAt: Date | string | number | Timestamp;
  volume: number;
  website: string;
  zip: string;
  isVisible: boolean;
}

/**
 * Single stock summary with ticker symbol.
 */
export type StockRealtime = StockRealtimeFields & { symbol: Ticker };

/**
 * Historical daily bar from /stock_prices/{ticker}.daily map entries.
 */
export interface PriceBar {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ts?: any; // optional Firestore Timestamp or Date
}

/**
 * AI prediction data for a single stock.
 */
export interface PredictionData {
  direction: 'up' | 'down';
  probability: number;
}

/**
 * Response from AI prediction documents containing all ticker predictions.
 */
export interface AIPredictionResponse {
  predicted: Record<string, PredictionData>;
  updatedAt: Date | null;
}

/* ----------------------------------------------------------------------------
 * Errors
 * --------------------------------------------------------------------------*/

/**
 * Error thrown when expected Firestore documents are missing.
 */
class DataNotFoundError extends Error {
  constructor(kind: string, id?: string) {
    super(`${kind} not found${id ? `: ${id}` : ''}`);
    this.name = 'DataNotFoundError';
  }
}

/**
 * Normalize a raw Firestore stock doc into the shape the UI expects.
 * Falls back to sensible defaults when fields are missing.
 */
function normalizeSummary(symbol: string, raw: any): StockRealtime {
  const dy = typeof raw?.dividendYield === 'number' ? raw.dividendYield : 0;
  const dyPct =
    typeof raw?.dividendYieldPercent === 'number'
      ? raw.dividendYieldPercent
      : dy * 100;

  return {
    symbol: symbol as Ticker,
    address1: String(raw?.address1 ?? ''),
    change24hPercent: Number(raw?.change24hPercent ?? 0),
    city: String(raw?.city ?? ''),
    companyName: String(raw?.companyName ?? symbol),
    country: String(raw?.country ?? ''),
    currentPrice: Number(raw?.currentPrice ?? raw?.close ?? raw?.open ?? 0),
    dividendYield: Number(dy),
    dividendYieldPercent: Number(dyPct),
    fiftyTwoWeekHigh: Number(raw?.fiftyTwoWeekHigh ?? 0),
    fiftyTwoWeekLow: Number(raw?.fiftyTwoWeekLow ?? 0),
    industry: String(raw?.industry ?? ''),
    marketCap: Number(raw?.marketCap ?? 0),
    open: Number(raw?.open ?? 0),
    peRatio: Number(raw?.peRatio ?? 0),
    sector: String(raw?.sector ?? ''),
    state: String(raw?.state ?? ''),
    updatedAt: raw?.updatedAt ?? Date.now(),
    volume: Number(raw?.volume ?? 0),
    website: String(raw?.website ?? ''),
    zip: String(raw?.zip ?? ''),
    isVisible: raw.isVisible !== false, // default to true if undefined
  };
}

/* ----------------------------------------------------------------------------
 * Public fetch functions
 * --------------------------------------------------------------------------*/

/**
 * Read one stock summary from /stocks/{symbol}.
 * @param {Ticker | string} symbol - Ticker symbol (e.g., "AAPL")
 * @returns {Promise<StockRealtime>} Normalized stock record
 * @throws {DataNotFoundError | InvalidDataError}
 * @example
 * const aapl = await readStockSummary('AAPL');
 */
export async function readStockSummary(
  symbol: Ticker | string
): Promise<StockRealtime> {
  const s = String(symbol).toUpperCase();
  const snap = await getDoc(doc(db, 'stocks', s));
  if (!snap.exists()) throw new DataNotFoundError('stock doc', s);
  const out = normalizeSummary(s, snap.data());
  return out;
}

/**
 * Fetch summaries for all tickers listed in constants/tickers.ts.
 * Skips docs that are missing/invalid.
 * @returns {Promise<StockRealtime[]>}
 * @example
 * const all = await readAllStockSummaries();
 */
export async function readAllStockSummaries(): Promise<StockRealtime[]> {
  const symbols = TICKERS;
  const tasks = symbols.map(async (s) => {
    const snap = await getDoc(doc(db, 'stocks', s));
    if (!snap.exists()) return null;
    return normalizeSummary(s, snap.data());
  });

  const results = (await Promise.allSettled(tasks))
    .filter(
      (r): r is PromiseFulfilledResult<StockRealtime | null> =>
        r.status === 'fulfilled'
    )
    .map((r) => r.value)
    .filter((v): v is StockRealtime => v != null);

  return results;
}

/**
 * Read ARIMAX model predictions from /stock_predictions/arimax.
 * Returns a map of all ticker predictions and the last update timestamp.
 *
 * @returns {Promise<AIPredictionResponse>} Map of predictions by ticker
 * @throws {DataNotFoundError} if the arimax document does not exist
 * @example
 * const { predicted, updatedAt } = await readArimaxPredictions();
 * const aaplPrediction = predicted['AAPL'];
 */
export async function readArimaxPredictions(): Promise<AIPredictionResponse> {
  const snap = await getDoc(doc(db, 'stock_predictions', 'arimax'));
  if (!snap.exists()) throw new DataNotFoundError('arimax predictions');

  const data = snap.data() as any;
  const predicted = (data?.predicted as Record<string, any>) ?? {};
  const updatedAt = data?.updatedAt?.toDate?.() ?? null;

  return { predicted, updatedAt };
}

/**
 * Read Deep Learning model predictions from /stock_predictions/dl.
 * Returns a map of all ticker predictions and the last update timestamp.
 *
 * @returns {Promise<AIPredictionResponse>} Map of predictions by ticker
 * @throws {DataNotFoundError} if the dl document does not exist
 * @example
 * const { predicted, updatedAt } = await readDLPredictions();
 * const aaplPrediction = predicted['AAPL'];
 */
export async function readDLPredictions(): Promise<AIPredictionResponse> {
  const snap = await getDoc(doc(db, 'stock_predictions', 'dl'));
  if (!snap.exists()) throw new DataNotFoundError('dl predictions');

  const data = snap.data() as any;
  const predicted = (data?.predicted as Record<string, any>) ?? {};
  const updatedAt = data?.updatedAt?.toDate?.() ?? null;

  return { predicted, updatedAt };
}

/**
 * Read daily OHLCV from /stock_prices/{symbol}.
 * Expects a single document per ticker with a "daily" map whose keys are "YYYY-MM-DD"
 * and values are compact { o, h, l, c, v } (verbose fields also accepted).
 *
 * One Firestore read returns all daily bars.
 *
 * @param {Ticker | string} symbol - Ticker symbol (e.g., "AAPL")
 * @returns {Promise<PriceBar[]>} Normalized, date-sorted OHLCV rows
 * @throws {DataNotFoundError} if the stock_prices doc does not exist
 * @example
 * const bars = await readPriceHistory('AAPL');
 */
export async function readPriceHistory(
  symbol: Ticker | string
): Promise<PriceBar[]> {
  const s = String(symbol).toUpperCase();

  // Single doc: /stock_prices/{symbol}
  const snap = await getDoc(doc(db, 'stock_prices', s));
  if (!snap.exists()) throw new DataNotFoundError('stock_prices doc', s);

  const data = snap.data() as any;
  const daily = data?.daily as Record<string, any> | undefined;

  // Coerce to numbers; accepts numeric strings to be defensive.
  const num = (x: any) => {
    const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : 0;
    return Number.isFinite(n) ? n : 0;
  };

  if (!daily || typeof daily !== 'object') return [];

  const rows: PriceBar[] = Object.keys(daily)
    .filter((date) => daily[date] && typeof daily[date] === 'object')
    .map((date) => {
      const d = daily[date] as any;
      return {
        date,
        open: num(d.open ?? d.o),
        high: num(d.high ?? d.h),
        low: num(d.low ?? d.l),
        close: num(d.close ?? d.c ?? d.price ?? d.open ?? d.o ?? 0),
        volume: num(d.volume ?? d.v),
        ts: d.ts,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return rows;
}

/* ----------------------------------------------------------------------------
 * Hooks (thin wrappers around fetchers)
 * --------------------------------------------------------------------------*/

/**
 * Hook: fetch a single stock summary.
 * @param {Ticker | string | undefined} symbol
 * @returns {{ data: StockRealtime | null, loading: boolean, error: Error | null }}
 * @example
 * const { data, loading } = useStockSummaryDoc('MSFT');
 */
export function useStockSummaryDoc(symbol: Ticker | string | undefined) {
  const [data, setData] = useState<StockRealtime | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const d = await readStockSummary(symbol);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e : new Error('Unknown error'));
        if (!cancelled) setData(null);
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
 * Hook: fetch all summaries listed in TICKERS.
 * @returns {{ data: StockRealtime[] | null, loading: boolean, error: Error | null }}
 * @example
 * const { data: stocks } = useAllStockSummaries();
 */
export function useAllStockSummaries() {
  const [data, setData] = useState<StockRealtime[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await readAllStockSummaries();
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e : new Error('Unknown error'));
        if (!cancelled) setData(null);
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

/**
 * Hook: fetch historical daily bars for a single symbol.
 * @param {Ticker | string | undefined} symbol
 * @returns {{ data: PriceBar[] | null, loading: boolean, error: Error | null }}
 * @example
 * const { data: history } = usePriceHistory('AAPL');
 */
export function usePriceHistory(symbol: Ticker | string | undefined) {
  const [data, setData] = useState<PriceBar[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const bars = await readPriceHistory(symbol);
        if (!cancelled) setData(bars);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e : new Error('Unknown error'));
        if (!cancelled) setData(null);
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
 * Hook: fetch ARIMAX model predictions for all tickers.
 * Fetches once on mount - no real-time updates needed as predictions update daily.
 * @returns {{ data: AIPredictionResponse | null, loading: boolean, error: Error | null }}
 * @example
 * const { data: arimaxData } = useArimaxPredictions();
 * if (arimaxData) {
 *   const aaplPrediction = arimaxData.predicted['AAPL'];
 *   console.log(aaplPrediction.direction, aaplPrediction.probability);
 * }
 */
export function useArimaxPredictions() {
  const [data, setData] = useState<AIPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const predictions = await readArimaxPredictions();
        if (!cancelled) setData(predictions);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e : new Error('Unknown error'));
        if (!cancelled) setData(null);
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

/**
 * Hook: fetch Deep Learning model predictions for all tickers.
 * Fetches once on mount - no real-time updates needed as predictions update daily.
 * @returns {{ data: AIPredictionResponse | null, loading: boolean, error: Error | null }}
 * @example
 * const { data: dlData } = useDLPredictions();
 * if (dlData) {
 *   const aaplPrediction = dlData.predicted['AAPL'];
 *   console.log(aaplPrediction.direction, aaplPrediction.probability);
 * }
 */
export function useDLPredictions() {
  const [data, setData] = useState<AIPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const predictions = await readDLPredictions();
        if (!cancelled) setData(predictions);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e : new Error('Unknown error'));
        if (!cancelled) setData(null);
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
