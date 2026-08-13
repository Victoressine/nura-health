// ==============================
// Imports
// ==============================

import {
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

// ==============================
// Read Firebase Environment
// ==============================

const firebaseApiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseAuthDomain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

const firebaseProjectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseStorageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const firebaseMessagingSenderId =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;

const firebaseAppId =
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// ==============================
// Validate Firebase Environment
// ==============================

if (!firebaseApiKey) {
  throw new Error(
    "Missing Firebase environment variable: NEXT_PUBLIC_FIREBASE_API_KEY"
  );
}

if (!firebaseAuthDomain) {
  throw new Error(
    "Missing Firebase environment variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  );
}

if (!firebaseProjectId) {
  throw new Error(
    "Missing Firebase environment variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  );
}

if (!firebaseStorageBucket) {
  throw new Error(
    "Missing Firebase environment variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  );
}

if (!firebaseMessagingSenderId) {
  throw new Error(
    "Missing Firebase environment variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  );
}

if (!firebaseAppId) {
  throw new Error(
    "Missing Firebase environment variable: NEXT_PUBLIC_FIREBASE_APP_ID"
  );
}

// ==============================
// Firebase Configuration
// ==============================

const firebaseConfig = {
  apiKey:
    firebaseApiKey,

  authDomain:
    firebaseAuthDomain,

  projectId:
    firebaseProjectId,

  storageBucket:
    firebaseStorageBucket,

  messagingSenderId:
    firebaseMessagingSenderId,

  appId:
    firebaseAppId,
};

// ==============================
// Initialize Firebase
// ==============================

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(
        firebaseConfig
      );

// ==============================
// Firebase Services
// ==============================

export const auth =
  getAuth(firebaseApp);

export const db =
  getFirestore(firebaseApp);

// ==============================
// Export Firebase App
// ==============================

export default firebaseApp;