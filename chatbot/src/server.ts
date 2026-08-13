// ==============================
// Imports
// ==============================

import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import chatRoutes from "./routes/chat.routes.js";

// ==============================
// Create Application
// ==============================

const app = express();

// ==============================
// Middleware
// ==============================

app.use(
  cors({
    origin: env.websiteOrigin,
    methods: ["GET", "POST"],
    allowedHeaders: [
  "Content-Type",
  "Authorization",
],
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

// ==============================
// Health Check
// ==============================

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "nura-chatbot",
    model: env.ollamaModel,
  });
});

// ==============================
// Chat Route
// ==============================

app.use("/api/chat", chatRoutes);

// ==============================
// 404
// ==============================

app.use((_request, response) => {
  response.status(404).json({
    error: "Route not found.",
  });
});

// ==============================
// Start Server
// ==============================

app.listen(env.port, () => {
  console.log(
    `Nura chatbot backend running on http://localhost:${env.port}`
  );
});