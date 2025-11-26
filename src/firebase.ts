import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables (Netlify)
// Falls back to hardcoded development values if env vars not set
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyDAKhgJEkxOczLBWBNtQbjGnfmyGGZ7nMg",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "holiday-pass-6dc84.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "holiday-pass-6dc84",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "holiday-pass-6dc84.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1052646766613",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:1052646766613:web:87010c43d403785ab5361c",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-FQN6HQ62JF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
