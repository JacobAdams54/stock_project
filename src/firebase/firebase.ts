/**
 * Firebase configuration and initialization module
 *
 * This module initializes Firebase services used throughout the application:
 * - Authentication for user management
 * - Firestore for database operations
 * - (NEW) Analytics for event tracking
 *
 * @module firebase
 */

// Import Firebase core + services
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Analytics imports
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


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);

/**
 * Analytics instance
 * Initialized only if supported (browser, measurementId present, no SSR)
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
      // Analytics unsupported in this environment — safe to ignore
    });
}

export function logAppEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch {
    // swallow analytics errors in production — do not break UI
  }
}

export { app, auth, db, analytics };
