// ==============================
// Imports
// ==============================

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ==============================
// Firebase Configuration
// ==============================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ==============================
// Validate Configuration
// ==============================

const requiredConfig = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

for (const key of requiredConfig) {
  if (!process.env[key]) {
    throw new Error(`Missing Firebase environment variable: ${key}`);
  }
}

// ==============================
// Initialize Firebase
// ==============================

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig);

// ==============================
// Firebase Services
// ==============================

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;