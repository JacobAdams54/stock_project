/**
 * useStockData.ts
 * -----------------------------------------------------------------------------
 * Purpose
 * - Minimal data layer for Stalk.ai.
 * - Fetches stock summaries from /stocks/{ticker} and daily history from
 *   /prices/{ticker}/daily/* in Firestore.
 *
 * What’s included
 * - readStockSummary(symbol)          → single /stocks/{symbol}
 * - readAllStockSummaries()           → all symbols from constants/tickers.ts
 * - readPriceHistory(symbol)          → daily bars from /prices/{symbol}/daily/*
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
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
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
  updatedAt: Date | string | number;
  volume: number;
  website: string;
  zip: string;
}

/**
 * Single stock summary with ticker symbol.
 */
export type StockRealtime = StockRealtimeFields & { symbol: Ticker };

/**
 * Historical daily bar from /prices/{ticker}/daily/{YYYY-MM-DD}.
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
 * Error thrown when a value cannot be parsed into the expected type.
 */
class InvalidDataError extends Error {
  constructor(label: string) {
    super(`Invalid or missing field: ${label}`);
    this.name = 'InvalidDataError';
  }
}

/* ----------------------------------------------------------------------------
 * Internal helpers
 * --------------------------------------------------------------------------*/

/**
 * Coerce an unknown value into a number.
 * @throws {InvalidDataError} If the value is not finite.
 */
function asNumber(v: unknown, label: string): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) throw new InvalidDataError(label);
  return n;
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
 * Read daily OHLCV from /prices/{symbol}/daily and normalize field names.
 * Accepts both verbose (open/high/low/close/volume) and compact (o/h/l/c/v).
 */
export async function readPriceHistory(
  symbol: Ticker | string
): Promise<PriceBar[]> {
  const s = String(symbol).toUpperCase();
  const colRef = collection(db, 'prices', s, 'daily');
  const snap = await getDocs(colRef);

  const num = (x: any) => (typeof x === 'number' && isFinite(x) ? x : 0);

  const rows: PriceBar[] = snap.docs.map((d) => {
    const data: any = d.data() ?? {};
    const date = typeof data.date === 'string' && data.date ? data.date : d.id; // fallback to doc ID (YYYY-MM-DD)

    return {
      date,
      open: num(data.open ?? data.o),
      high: num(data.high ?? data.h),
      low: num(data.low ?? data.l),
      close: num(
        data.close ?? data.c ?? data.price ?? data.open ?? data.o ?? 0
      ),
      volume: num(data.volume ?? data.v),
      ts: data.ts,
    };
  });

  rows.sort((a, b) => a.date.localeCompare(b.date));
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
