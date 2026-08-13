// ==============================
// Imports
// ==============================

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getAuth,
} from "firebase-admin/auth";

// ==============================
// Firebase Admin Environment
// ==============================

const projectId =
  process.env.FIREBASE_PROJECT_ID?.trim();

const clientEmail =
  process.env.FIREBASE_CLIENT_EMAIL?.trim();

const privateKey =
  process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/\\n/g, "\n")
    .trim();

// ==============================
// Validate Configuration
// ==============================

if (!projectId) {
  throw new Error(
    "FIREBASE_PROJECT_ID is not configured."
  );
}

if (!clientEmail) {
  throw new Error(
    "FIREBASE_CLIENT_EMAIL is not configured."
  );
}

if (!privateKey) {
  throw new Error(
    "FIREBASE_PRIVATE_KEY is not configured."
  );
}

// ==============================
// Firebase Admin Initialization
// ==============================

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

// ==============================
// Firebase Admin Services
// ==============================

export const adminAuth =
  getAuth(firebaseAdminApp);