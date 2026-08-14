// ==============================
// Environment Configuration
// ==============================

import "dotenv/config";

// ==============================
// Types
// ==============================

export type AiProvider =
  | "ollama"
  | "groq";

// ==============================
// Runtime Environment
// ==============================

const isProduction =
  process.env.NODE_ENV === "production";

// ==============================
// Environment Helpers
// ==============================

function getOptionalValue(
  name: string
): string {
  return (
    process.env[name]?.trim() ??
    ""
  );
}

function requireValue(
  name: string
): string {
  const value =
    getOptionalValue(name);

  if (!value) {
    throw new Error(
      `${name} is required.`
    );
  }

  return value;
}

function requireProductionValue(
  name: string,
  developmentFallback: string
): string {
  const value =
    getOptionalValue(name);

  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(
      `${name} is required in production.`
    );
  }

  return developmentFallback;
}

// ==============================
// Port Configuration
// ==============================

function getPort(): number {
  const rawPort =
    getOptionalValue("PORT");

  if (!rawPort) {
    return 4000;
  }

  const port =
    Number(rawPort);

  if (
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
  ) {
    throw new Error(
      "PORT must be a valid integer between 1 and 65535."
    );
  }

  return port;
}

// ==============================
// AI Provider Configuration
// ==============================

function getAiProvider(): AiProvider {
  const configuredProvider =
    getOptionalValue(
      "AI_PROVIDER"
    ).toLowerCase();

  // ==============================
  // Explicit Provider
  // ==============================

  if (
    configuredProvider ===
      "ollama" ||
    configuredProvider ===
      "groq"
  ) {
    return configuredProvider;
  }

  // ==============================
  // Invalid Provider
  // ==============================

  if (configuredProvider) {
    throw new Error(
      "AI_PROVIDER must be either 'ollama' or 'groq'."
    );
  }

  // ==============================
  // Environment Default
  // ==============================

  return isProduction
    ? "groq"
    : "ollama";
}

const aiProvider =
  getAiProvider();

// ==============================
// Ollama Configuration
// ==============================

function getOllamaBaseUrl(): string {
  return (
    getOptionalValue(
      "OLLAMA_BASE_URL"
    ) ||
    "http://localhost:11434"
  ).replace(/\/+$/, "");
}

function getOllamaModel(): string {
  return (
    getOptionalValue(
      "OLLAMA_MODEL"
    ) ||
    "qwen3.5:4b"
  );
}

// ==============================
// Groq Configuration
// ==============================

function getGroqApiKey(): string {
  const apiKey =
    getOptionalValue(
      "GROQ_API_KEY"
    );

  if (
    aiProvider === "groq" &&
    !apiKey
  ) {
    throw new Error(
      "GROQ_API_KEY is required when AI_PROVIDER is 'groq'."
    );
  }

  return apiKey;
}

function getGroqModel(): string {
  return (
    getOptionalValue(
      "GROQ_MODEL"
    ) ||
    "openai/gpt-oss-20b"
  );
}

// ==============================
// Website / CORS Configuration
// ==============================

function getWebsiteOrigin(): string {
  return requireProductionValue(
    "WEBSITE_ORIGIN",
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

// ==============================
// Environment Values
// ==============================

export const env = {
  // ==============================
  // Runtime
  // ==============================

  isProduction,

  port:
    getPort(),

  websiteOrigin:
    getWebsiteOrigin(),

  // ==============================
  // AI Provider
  // ==============================

  aiProvider,

  // ==============================
  // Ollama
  // ==============================

  ollamaBaseUrl:
    getOllamaBaseUrl(),

  ollamaModel:
    getOllamaModel(),

  // ==============================
  // Groq
  // ==============================

  groqApiKey:
    getGroqApiKey(),

  groqModel:
    getGroqModel(),
} as const;