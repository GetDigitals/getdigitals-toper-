/**
 * firebase.js — Firebase app initialization.
 * These config values are safe to be public in client code (Firebase
 * restricts access via Security Rules, not by hiding this config).
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBNbTNEDCEcBSnUu2xUqezibHQgYiNGKjs',
  authDomain: 'getdigitals-toppers-tool.firebaseapp.com',
  projectId: 'getdigitals-toppers-tool',
  storageBucket: 'getdigitals-toppers-tool.firebasestorage.app',
  messagingSenderId: '332004884585',
  appId: '1:332004884585:web:ec028e454d7eb9e10962f8',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
