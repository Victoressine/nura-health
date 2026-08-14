// ==============================
// Imports
// ==============================

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import cors from "cors";

import { env } from "./config/env.js";
import chatRoutes from "./routes/chat.routes.js";

// ==============================
// Create Application
// ==============================

const app = express();

// ==============================
// Application Configuration
// ==============================

// Avoid exposing Express through response headers.
app.disable("x-powered-by");

// Useful when running behind Vercel or another reverse proxy.
app.set("trust proxy", 1);

// ==============================
// CORS
// ==============================

app.use(
  cors({
    origin: env.websiteOrigin,

    methods: [
      "GET",
      "POST",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: false,

    optionsSuccessStatus: 204,
  })
);

// ==============================
// Request Parsing
// ==============================

app.use(
  express.json({
    limit: "1mb",
    strict: true,
  })
);

// ==============================
// Health Check
// ==============================

app.get(
  "/health",
  (_request: Request, response: Response) => {
    return response.status(200).json({
      status: "ok",
      service: "nura-chatbot",
    });
  }
);

// ==============================
// Chat Routes
// ==============================

app.use(
  "/api/chat",
  chatRoutes
);

// ==============================
// 404 Handler
// ==============================

app.use(
  (
    _request: Request,
    response: Response
  ) => {
    return response.status(404).json({
      error: "Route not found.",
    });
  }
);

// ==============================
// Global Error Handler
// ==============================

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    console.error(
      "Unhandled server error:",
      error
    );

    // ==============================
    // Invalid JSON
    // ==============================

    if (
      error instanceof SyntaxError &&
      "body" in error
    ) {
      return response.status(400).json({
        error: "Invalid JSON request body.",
      });
    }

    // ==============================
    // Generic Server Error
    // ==============================

    return response.status(500).json({
      error:
        "An unexpected server error occurred.",
    });
  }
);

// ==============================
// Start Server
// ==============================

app.listen(
  env.port,
  () => {
    const environment =
      process.env.NODE_ENV ??
      "development";

    console.log(
      `Nura chatbot backend started on port ${env.port} (${environment})`
    );
  }
);

// ==============================
// Export Application
// ==============================

export default app;