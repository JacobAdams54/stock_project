/**
 * Firebase configuration and initialization module
 *
 * Uses Firebase Emulator Suite unconditionally (forced ON for now).
 * Firestore emulator: 127.0.0.1:8080
 * Auth emulator:      http://127.0.0.1:9099
 *
 * @module firebase
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/** Firebase project configuration */
const firebaseConfig = {
  apiKey: 'AIzaSyBlJRzG6An9B4ygK_QA75q90A-TN0ESmOs',
  authDomain: 'stock-project-32dbd.firebaseapp.com',
  projectId: 'stock-project-32dbd',
  storageBucket: 'stock-project-32dbd.firebasestorage.app',
  messagingSenderId: '1001296567859',
  appId: '1:1001296567859:web:8716a707f36d77c02ccd46',
  measurementId: 'G-977QMD4SE4',
};

/** Singleton Firebase app (safe for tests/HMR) */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Auth and Firestore services */
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Force emulator usage in all environments (flip back later).
 */
const usingEmulators = true as const;

/** Hard-pinned emulator host/ports */
const EMULATOR_HOST = '127.0.0.1';
const FS_PORT = 8080;
const AUTH_PORT = 9099;

if (usingEmulators) {
  // Must be called before any Firestore/Auth operations
  connectFirestoreEmulator(db, EMULATOR_HOST, FS_PORT);

  // If you are not running the Auth emulator, comment the next line out.
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_PORT}`, {
    disableWarnings: true,
  });

  // eslint-disable-next-line no-console
  console.info(
    `[firebase] Using emulators (Firestore:${EMULATOR_HOST}:${FS_PORT}, Auth:${EMULATOR_HOST}:${AUTH_PORT})`
  );
}

export { app, auth, db, usingEmulators };
