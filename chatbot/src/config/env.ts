// ==============================
// Environment Configuration
// ==============================

import "dotenv/config";

// ==============================
// Environment Values
// ==============================

export const env = {
  port: Number(process.env.PORT ?? 4000),

  websiteOrigin:
    process.env.WEBSITE_ORIGIN ??
    "http://localhost:3000",

  ollamaBaseUrl:
    process.env.OLLAMA_BASE_URL ??
    "http://localhost:11434",

  ollamaModel:
    process.env.OLLAMA_MODEL ??
    "qwen3.5:4b",
};