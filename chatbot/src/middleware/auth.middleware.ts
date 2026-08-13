// ==============================
// Imports
// ==============================

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  adminAuth,
} from "../config/firebase-admin.js";

// ==============================
// Authentication Middleware
// ==============================

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    // ==============================
    // Read Authorization Header
    // ==============================

    const authorization =
      request.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return response.status(401).json({
        error:
          "Authentication required.",
      });
    }

    // ==============================
    // Extract Firebase ID Token
    // ==============================

    const idToken =
      authorization
        .slice(7)
        .trim();

    if (!idToken) {
      return response.status(401).json({
        error:
          "Authentication token is missing.",
      });
    }

    // ==============================
    // Verify Firebase Token
    // ==============================

    await adminAuth.verifyIdToken(
      idToken
    );

    next();
  } catch (error) {
    console.error(
      "Authentication failed:",
      error
    );

    return response.status(401).json({
      error:
        "Invalid or expired authentication token.",
    });
  }
}