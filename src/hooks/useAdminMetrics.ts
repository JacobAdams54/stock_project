import * as React from 'react';
import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../components/layout/AuthContext';

type Flags = {
  maintenanceMode: boolean;
  experimentalCharts: boolean;
};

export type AdminMetrics = {
  totalUsers: number | null;
  totalWatchlistItems: number | null;
  avgWatchlistSize: number | null;
  topTickers: Array<{ ticker: string; count: number }>;
};

const DEFAULT_FLAGS: Flags = {
  maintenanceMode: false,
  experimentalCharts: false,
};

const DEFAULT_METRICS: AdminMetrics = {
  totalUsers: null,
  totalWatchlistItems: null,
  avgWatchlistSize: null,
  topTickers: [],
};

/**
 * useAdminMetrics
 * Loads lightweight admin metrics and feature flags from Firestore.
 * - Metrics are approximate (caps reads to avoid large costs).
 * - Flags live at config/flags.
 *
 * Returns:
 * - metrics: aggregated counts and top tickers
 * - flags: feature flags
 * - setFlag: helper to update a flag
 * - loading: loading state
 * - error: optional error message
 */
export function useAdminMetrics() {
  const { isAdmin } = useAuth();

  const [flags, setFlags] = React.useState<Flags>(DEFAULT_FLAGS);
  const [metrics, setMetrics] = React.useState<AdminMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Subscribe to feature flags (config/flags)
  React.useEffect(() => {
    if (!isAdmin) {
      setFlags(DEFAULT_FLAGS);
      return;
    }

    const ref = doc(db, 'config', 'flags');

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = (snap.data() || {}) as Partial<Flags>;
        setFlags({
          maintenanceMode: Boolean(data.maintenanceMode),
          experimentalCharts: Boolean(data.experimentalCharts),
        });
      },
      () => {
        // Non-fatal: leave defaults
      }
    );

    return () => unsub();
  }, [isAdmin]);

  // Load metrics (approximate, capped to 500 user docs)
  React.useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      if (!isAdmin) {
        // Non-admin: no Firestore reads, default values
        setMetrics(DEFAULT_METRICS);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      //beginning of error
            try {
        const usersCol = collection(db, 'users');
        const countSnap = await getCountFromServer(usersCol);
        const totalUsers = countSnap.data().count as number;

        const usersQuery = query(usersCol, limit(500));
        const usersSnap = await getDocs(usersQuery);

        let totalWatchlistItems = 0;
        let sampledUsers = 0;
        const tickerTally = new Map<string, number>();

        usersSnap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const wl = data?.watchlist;

          if (Array.isArray(wl)) {
            sampledUsers += 1;
            totalWatchlistItems += wl.length;

            wl.forEach((t) => {
              const ticker = String(t || '').toUpperCase();
              if (!ticker) return;
              tickerTally.set(ticker, (tickerTally.get(ticker) || 0) + 1);
            });
          }
        });

        const avgWatchlistSize =
          sampledUsers > 0
            ? Number((totalWatchlistItems / sampledUsers).toFixed(2))
            : 0;

        const topTickers = Array.from(tickerTally.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([ticker, count]) => ({ ticker, count }));

        if (!cancelled) {
          setMetrics({
            totalUsers,
            totalWatchlistItems,
            avgWatchlistSize,
            topTickers,
          });
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load admin metrics');
          setMetrics(DEFAULT_METRICS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
      //end point of error
    }

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const setFlag = React.useCallback(
    async (key: keyof Flags, value: boolean) => {
      if (!isAdmin) {
        throw new Error('auth/forbidden');
      }

      const ref = doc(db, 'config', 'flags');
      await setDoc(ref, { [key]: value }, { merge: true });
    },
    [isAdmin]
  );

  return { metrics, flags, setFlag, loading, error };
}

export default useAdminMetrics;
