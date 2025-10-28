/**
 * Firebase configuration and initialization module
 *
 * This module initializes Firebase services used throughout the application:
 * - Authentication for user management
 * - Firestore for database operations
 *
 * @module firebase
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
 * @type {import('firebase/app').FirebaseApp}
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication service instance
 * Used for user authentication, login, logout, and session management
 * @type {import('firebase/auth').Auth}
 * @example
 * import { auth } from '@/firebase/firebase';
 * const user = auth.currentUser;
 */
const auth = getAuth(app);

/**
 * Firestore database instance
 * Used for storing and retrieving user data, portfolios, watchlists, and stock information
 * @type {import('firebase/firestore').Firestore}
 * @example
 * import { db } from '@/firebase/firebase';
 * const docRef = doc(db, 'users', userId);
 */
const db = getFirestore(app);

export { app, auth, db };
