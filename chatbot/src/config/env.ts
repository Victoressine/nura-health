// ==============================
// Environment Configuration
// ==============================

import "dotenv/config";

// ==============================
// Environment Helpers
// ==============================

const isProduction =
  process.env.NODE_ENV === "production";

function requireProductionValue(
  name: string,
  fallback: string
): string {
  const value =
    process.env[name]?.trim();

  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(
      `${name} is required in production.`
    );
  }

  return fallback;
}

// ==============================
// Port Configuration
// ==============================

function getPort(): number {
  const rawPort =
    process.env.PORT?.trim();

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
// Environment Values
// ==============================

export const env = {
  port: getPort(),

  websiteOrigin:
    requireProductionValue(
      "WEBSITE_ORIGIN",
      "http://localhost:3000"
    ),

  ollamaBaseUrl:
    requireProductionValue(
      "OLLAMA_BASE_URL",
      "http://localhost:11434"
    ),

  ollamaModel:
    requireProductionValue(
      "OLLAMA_MODEL",
      "qwen3.5:4b"
    ),
};