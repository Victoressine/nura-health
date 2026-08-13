// ==============================
// Imports
// ==============================

import { Router } from "express";

import { chatController } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

// ==============================
// Router
// ==============================

const router = Router();

// ==============================
// Protected Chat Endpoint
// ==============================

router.post(
  "/",
  requireAuth,
  chatController
);

// ==============================
// Export
// ==============================

export default router;