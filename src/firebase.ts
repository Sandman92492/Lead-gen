import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables (Netlify)
// Falls back to development values if env vars not set
const isDev = (import.meta as any).env.DEV;
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || (isDev ? "dev-api-key" : undefined),
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || (isDev ? "dev.firebaseapp.com" : undefined),
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || (isDev ? "dev-project" : undefined),
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || (isDev ? "dev.firebasestorage.app" : undefined),
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isDev ? "0000000000000" : undefined),
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || (isDev ? "1:0000000000000:web:0000000000000000000000" : undefined),
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || (isDev ? "G-XXXXXXXXXX" : undefined)
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
