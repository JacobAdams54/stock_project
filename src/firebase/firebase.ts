/**
 * Firebase configuration and initialization module
 *
 * This module initializes Firebase services used throughout the application:
 * - Authentication for user management
 * - Firestore for database operations
 * - Analytics for event tracking (optional)
 *
 * @module firebase
 */

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  getAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBlJRzG6An9B4ygK_QA75q90A-TN0ESmOs',
  authDomain: 'stock-project-32dbd.firebaseapp.com',
  projectId: 'stock-project-32dbd',
  storageBucket: 'stock-project-32dbd.firebasestorage.app',
  messagingSenderId: '1001296567859',
  appId: '1:1001296567859:web:8716a707f36d77c02ccd46',
  measurementId: 'G-977QMD4SE4',
};

/**
 * Initialized Firebase app instance
 * Use getApps()/getApp() to avoid double init in dev/hot-reload.
 * @type {import('firebase/app').FirebaseApp}
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Firebase Authentication service instance
 * Used for user authentication, login, logout, and session management
 * @type {import('firebase/auth').Auth}
 */
const auth = getAuth(app);

/**
 * Firestore database instance
 * Used for storing and retrieving user data, portfolios, watchlists, and stock information
 * @type {import('firebase/firestore').Firestore}
 */
const db = getFirestore(app);


/**
 * Analytics instance (browser-only, optional)
 */
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  isSupported()
    .then((ok) => {
      if (ok) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported in this environment (SSR, no measurementId, etc.)
      // Safe to ignore.
    });
}

/**
 * Log a Firebase Analytics event if Analytics is available.
 * Safe no-op in unsupported environments.
 *
 * @param {string} eventName - Event name (e.g., 'admin_test_click')
 * @param {Record<string, any>} [params] - Optional event params
 *
 * @example
 * logAppEvent('add_to_watchlist', { ticker: 'AAPL' });
 */
export function logAppEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch {
    // Swallow analytics errors to avoid breaking the UI
  }
}

export { app, auth, db, analytics };
