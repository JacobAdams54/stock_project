// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: 'AIzaSyBlJRzG6An9B4ygK_QA75q90A-TN0ESmOs',
  authDomain: 'stock-project-32dbd.firebaseapp.com',
  projectId: 'stock-project-32dbd',
  storageBucket: 'stock-project-32dbd.firebasestorage.app',
  messagingSenderId: '1001296567859',
  appId: '1:1001296567859:web:8716a707f36d77c02ccd46',
  measurementId: 'G-977QMD4SE4',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
