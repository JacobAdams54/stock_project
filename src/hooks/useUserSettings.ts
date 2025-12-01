/**
 * useUserSettings hook
 *
 * Provides a typed interface for reading and writing user dashboard settings.
 * Reads from Firestore path `users/{uid}/settings` and writes updates using
 * optimistic UI updates with rollback on error. The hook exposes `settings`,
 * `loading`, `error`, `updateSetting`, `bulkUpdate`, and `resetSettings`.
 *
 * This file contains sensible defaults and a lightweight `validateSettings`
 * helper. Persistence logic uses `setDoc`/`getDoc` from Firebase; in tests the
 * Firestore calls should be mocked.
 *
 * @module hooks/useUserSettings
 */
import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { FirestoreError } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../components/layout/AuthContext';

/**
 * Settings shape stored under users/{uid}/settings
 */
export interface UserSettings {
  layout: 'compact' | 'expanded';
  refreshIntervalSeconds: number;
  showPortfolioWidgets: boolean;
  chartStyle: 'candles' | 'lines';
  watchlistSortOrder: 'manual' | 'alphabetical' | 'change_desc' | 'change_asc';
  experimentalFeatures: boolean;
  notifications: {
    enabled: boolean;
    channels: { email: boolean; push: boolean };
    frequency: 'immediate' | 'hourly' | 'daily';
    priceAlertThreshold?: number; // simple global threshold
  };
  preferences: {
    timezone: string; // IANA tz name
    currency: string; // ISO currency code, e.g., 'USD'
    theme: 'light' | 'dark' | 'system';
    numberFormat: { thousandsSeparator: string; decimalPlaces: number };
  };
  advanced?: {
    dataRetentionEnabled?: boolean;
    telemetryOptIn?: boolean;
  };
}

/** Sensible defaults used when Firestore has no document */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  layout: 'expanded',
  refreshIntervalSeconds: 60,
  showPortfolioWidgets: true,
  chartStyle: 'candles',
  watchlistSortOrder: 'manual',
  experimentalFeatures: false,
  notifications: {
    enabled: true,
    channels: { email: false, push: true },
    frequency: 'immediate',
    priceAlertThreshold: undefined,
  },
  preferences: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    currency: 'USD',
    theme: 'system',
    numberFormat: { thousandsSeparator: ',', decimalPlaces: 2 },
  },
  advanced: { dataRetentionEnabled: false, telemetryOptIn: false },
};

function mergeWithDefaults(partial: Partial<UserSettings> | undefined): UserSettings {
  return { ...DEFAULT_USER_SETTINGS, ...(partial || {}) } as UserSettings;
}

/** Basic runtime validation — lightweight checks used before writing */
export function validateSettings(s: Partial<UserSettings>): boolean {
  if (s.refreshIntervalSeconds && s.refreshIntervalSeconds < 5) return false;
  if (s.preferences?.numberFormat && s.preferences.numberFormat.decimalPlaces < 0) return false;
  if (s.notifications?.priceAlertThreshold && s.notifications.priceAlertThreshold < 0) return false;
  return true;
}

type UpdateFn = (key: keyof UserSettings, value: any) => Promise<void>;

/**
 * useUserSettings hook implementation.
 * @param uid - Optional user id. If omitted, the hook will remain unloaded (caller responsible for auth).
 */
export default function useUserSettings(uid?: string | null) {
  const { user, loading: authLoading } = useAuth();
  const resolvedUid = uid ?? user?.uid ?? null;

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [loading, setLoading] = useState<boolean>(!!resolvedUid || authLoading);
  const [error, setError] = useState<Error | null>(null);
  const lastRemoteRef = useRef<UserSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!resolvedUid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, 'users', resolvedUid, 'settings');
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() as Partial<UserSettings>) : undefined;
        const merged = mergeWithDefaults(data);
        lastRemoteRef.current = merged;
        if (mounted) setSettings(merged);
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [resolvedUid]);

  async function writeToFirestore(partial: Partial<UserSettings>) {
    if (!resolvedUid) throw new Error('Cannot write settings: no uid provided');
    if (!validateSettings(partial)) throw new Error('Validation failed for settings');
    const ref = doc(db, 'users', resolvedUid, 'settings');
    await setDoc(ref, partial, { merge: true });
  }

  const updateSetting: UpdateFn = async (key, value) => {
    const prev = settings;
    const optimistic = { ...settings, [key]: value } as UserSettings;
    setSettings(optimistic);
    try {
      await writeToFirestore({ [key]: value } as Partial<UserSettings>);
      lastRemoteRef.current = optimistic;
    } catch (err) {
      setSettings(prev);
      setError(err as Error);
      throw err;
    }
  };

  const bulkUpdate = async (partial: Partial<UserSettings>) => {
    const prev = settings;
    const optimistic = { ...settings, ...(partial as UserSettings) } as UserSettings;
    setSettings(optimistic);
    try {
      await writeToFirestore(partial);
      lastRemoteRef.current = optimistic;
    } catch (err) {
      setSettings(prev);
      setError(err as Error);
      throw err;
    }
  };

  const resetSettings = async () => {
    const prev = settings;
    setSettings(DEFAULT_USER_SETTINGS);
    try {
      if (!uid) throw new Error('No uid');
      const ref = doc(db, 'users', uid, 'settings');
      await setDoc(ref, DEFAULT_USER_SETTINGS, { merge: true });
      lastRemoteRef.current = DEFAULT_USER_SETTINGS;
    } catch (err) {
      setSettings(prev);
      setError(err as Error);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSetting,
    bulkUpdate,
    resetSettings,
  };
}
