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
  date: string; // doc id "YYYY-MM-DD"
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
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
 * Normalize Firestore Timestamp-like to Date | string | number.
 */
function normalizeUpdatedAt(v: any): Date | string | number {
  if (v && typeof v === 'object' && typeof v.toDate === 'function') {
    return v.toDate();
  }
  return v;
}

/**
 * Validate and normalize a /stocks/{ticker} document.
 * @throws {InvalidDataError}
 */
function parseStockRealtimeDoc(d: any): StockRealtimeFields {
  if (!d) throw new InvalidDataError('document');
  return {
    address1: String(d.address1 ?? ''),
    change24hPercent: asNumber(d.change24hPercent, 'change24hPercent'),
    city: String(d.city ?? ''),
    companyName: String(d.companyName ?? ''),
    country: String(d.country ?? ''),
    currentPrice: asNumber(d.currentPrice, 'currentPrice'),
    dividendYield: asNumber(d.dividendYield, 'dividendYield'),
    dividendYieldPercent: asNumber(
      d.dividendYieldPercent,
      'dividendYieldPercent'
    ),
    fiftyTwoWeekHigh: asNumber(d.fiftyTwoWeekHigh, 'fiftyTwoWeekHigh'),
    fiftyTwoWeekLow: asNumber(d.fiftyTwoWeekLow, 'fiftyTwoWeekLow'),
    industry: String(d.industry ?? ''),
    marketCap: asNumber(d.marketCap, 'marketCap'),
    open: asNumber(d.open, 'open'),
    peRatio: asNumber(d.peRatio, 'peRatio'),
    sector: String(d.sector ?? ''),
    state: String(d.state ?? ''),
    updatedAt: normalizeUpdatedAt(d.updatedAt),
    volume: asNumber(d.volume, 'volume'),
    website: String(d.website ?? ''),
    zip: String(d.zip ?? ''),
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
  const sym = symbol.toString().toUpperCase() as Ticker;
  const snap = await getDoc(doc(db, 'stocks', sym));
  if (!snap.exists()) throw new DataNotFoundError('stock doc', sym);
  const fields = parseStockRealtimeDoc(snap.data());
  return { symbol: sym, ...fields };
}

/**
 * Fetch summaries for all tickers listed in constants/tickers.ts.
 * Skips docs that are missing/invalid.
 * @returns {Promise<StockRealtime[]>}
 * @example
 * const all = await readAllStockSummaries();
 */
export async function readAllStockSummaries(): Promise<StockRealtime[]> {
  const results = await Promise.all(
    TICKERS.map(async (sym) => {
      try {
        return await readStockSummary(sym);
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean) as StockRealtime[];
}

/**
 * Read daily OHLC history from /prices/{symbol}/daily/*
 * Assumes doc IDs are "YYYY-MM-DD" and fields { o,h,l,c,v } are numbers.
 * @param {Ticker | string} symbol - Ticker symbol
 * @returns {Promise<PriceBar[]>} Bars sorted ascending by date
 * @throws {DataNotFoundError | InvalidDataError}
 * @example
 * const bars = await readPriceHistory('AAPL');
 */
export async function readPriceHistory(
  symbol: Ticker | string
): Promise<PriceBar[]> {
  const sym = symbol.toString().toUpperCase();
  const colRef = collection(db, 'prices', sym, 'daily');
  const snap = await getDocs(query(colRef));
  if (snap.empty) throw new DataNotFoundError('price history', sym);

  const bars: PriceBar[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      date: d.id,
      o: asNumber(data.o, `o(${d.id})`),
      h: asNumber(data.h, `h(${d.id})`),
      l: asNumber(data.l, `l(${d.id})`),
      c: asNumber(data.c, `c(${d.id})`),
      v: data.v == null ? undefined : asNumber(data.v, `v(${d.id})`),
    };
  });

  // Sort by YYYY-MM-DD ascending using lexical order.
  bars.sort((a, b) => a.date.localeCompare(b.date));
  return bars;
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
