// ==============================
// Imports
// ==============================

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";

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
// Determine Credentials
// ==============================

const hasProjectId =
  Boolean(projectId);

const hasClientEmail =
  Boolean(clientEmail);

const hasPrivateKey =
  Boolean(privateKey);

const hasAnyServerCredential =
  hasProjectId ||
  hasClientEmail ||
  hasPrivateKey;

const hasAllServerCredentials =
  hasProjectId &&
  hasClientEmail &&
  hasPrivateKey;

// ==============================
// Validate Partial Configuration
// ==============================

if (
  hasAnyServerCredential &&
  !hasAllServerCredentials
) {
  throw new Error(
    "Firebase Admin configuration is incomplete. " +
      "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, " +
      "and FIREBASE_PRIVATE_KEY must all be provided."
  );
}

// ==============================
// Firebase Admin Initialization
// ==============================

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: hasAllServerCredentials
          ? cert({
              projectId: projectId!,
              clientEmail: clientEmail!,
              privateKey: privateKey!,
            })
          : applicationDefault(),
      });

// ==============================
// Firebase Admin Services
// ==============================

export const adminAuth =
  getAuth(firebaseAdminApp);