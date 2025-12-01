/**
 * useUserSettings hook
 *
 * Simple hook for reading and writing user preferences (watchlist and AI model).
 * Reads from Firestore `users/{uid}` (preferences field) and updates with optimistic UI.
 *
 * @module hooks/useUserSettings
 */
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../components/layout/AuthContext';
import type { Ticker } from '../constants/tickers';

/**
 * User preferences shape stored under users/{uid}.preferences
 */
export interface UserPreferences {
  preferredModel: 'arimax' | 'dl';
  watchlist: Ticker[];
  availableModels: Array<'arimax' | 'dl'>;
}

/** Default preferences for new users */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  preferredModel: 'arimax',
  watchlist: [],
  availableModels: ['arimax'], // Everyone gets ARIMAX, DL is premium
};

function mergeWithDefaults(
  partial: Partial<UserPreferences> | undefined
): UserPreferences {
  return { ...DEFAULT_USER_PREFERENCES, ...(partial || {}) } as UserPreferences;
}

// Helper to remove undefined values from an object (Firestore doesn't allow undefined)
function removeUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;

  const cleaned: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] =
        typeof obj[key] === 'object' ? removeUndefined(obj[key]) : obj[key];
    }
  }

  return cleaned;
}

/**
 * useUserSettings hook
 * @param uid - Optional user id. If not provided, uses current auth user.
 */
export default function useUserSettings(uid?: string | null) {
  const { user } = useAuth();
  const resolvedUid = uid ?? user?.uid ?? null;

  const [preferences, setPreferences] = useState<UserPreferences>(
    DEFAULT_USER_PREFERENCES
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load preferences from Firestore
  useEffect(() => {
    if (!resolvedUid) {
      setLoading(false);
      return;
    }

    async function loadPreferences() {
      try {
        const ref = doc(db, 'users', resolvedUid);
        const snap = await getDoc(ref);

        // If user doc exists, get preferences field; otherwise use defaults
        const data = snap.exists()
          ? (snap.data()?.preferences as Partial<UserPreferences>)
          : undefined;

        const merged = mergeWithDefaults(data);
        setPreferences(merged);

        // If no preferences exist, initialize them in Firestore
        if (!snap.exists() || !snap.data()?.preferences) {
          const cleanPrefs = removeUndefined(merged);
          await setDoc(ref, { preferences: cleanPrefs }, { merge: true });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [resolvedUid]);

  // Update preferred AI model
  const updatePreferredModel = async (model: 'arimax' | 'dl') => {
    if (!resolvedUid) throw new Error('No user logged in');

    const prev = preferences;
    const updated = { ...preferences, preferredModel: model };
    setPreferences(updated); // Optimistic update

    try {
      const ref = doc(db, 'users', resolvedUid);
      await setDoc(
        ref,
        { preferences: { preferredModel: model } },
        { merge: true }
      );
    } catch (err) {
      setPreferences(prev); // Rollback on error
      setError(err as Error);
      throw err;
    }
  };

  // Add stock to watchlist
  const addToWatchlist = async (ticker: Ticker) => {
    if (!resolvedUid) throw new Error('No user logged in');
    if (preferences.watchlist.includes(ticker)) return; // Already in watchlist

    const prev = preferences;
    const updated = {
      ...preferences,
      watchlist: [...preferences.watchlist, ticker],
    };
    setPreferences(updated); // Optimistic update

    try {
      const ref = doc(db, 'users', resolvedUid);
      await setDoc(
        ref,
        { preferences: { watchlist: updated.watchlist } },
        { merge: true }
      );
    } catch (err) {
      setPreferences(prev); // Rollback on error
      setError(err as Error);
      throw err;
    }
  };

  // Remove stock from watchlist
  const removeFromWatchlist = async (ticker: Ticker) => {
    if (!resolvedUid) throw new Error('No user logged in');

    const prev = preferences;
    const updated = {
      ...preferences,
      watchlist: preferences.watchlist.filter((t) => t !== ticker),
    };
    setPreferences(updated); // Optimistic update

    try {
      const ref = doc(db, 'users', resolvedUid);
      await setDoc(
        ref,
        { preferences: { watchlist: updated.watchlist } },
        { merge: true }
      );
    } catch (err) {
      setPreferences(prev); // Rollback on error
      setError(err as Error);
      throw err;
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferredModel,
    addToWatchlist,
    removeFromWatchlist,
  };
}
