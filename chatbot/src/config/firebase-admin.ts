// ==============================
// Imports
// ==============================

import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getAuth,
} from "firebase-admin/auth";

// ==============================
// Firebase Admin Initialization
// ==============================

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential:
          applicationDefault(),
      });

// ==============================
// Firebase Admin Services
// ==============================

export const adminAuth =
  getAuth(firebaseAdminApp);