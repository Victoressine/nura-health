// ==============================
// Imports
// ==============================

import type {
  Request,
  Response,
} from "express";

import {
  generateChatResponse,
  type ChatMessage,
} from "../services/openai.service.js";

import {
  checkForEmergency,
} from "../safety/emergency-check.js";

// ==============================
// Types
// ==============================

type ChatRequestBody = {
  messages?: ChatMessage[];
};

type ClientChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// ==============================
// Constants
// ==============================

const MAX_MESSAGES = 30;

const MAX_MESSAGE_LENGTH = 10_000;

const VALID_CLIENT_ROLES =
  new Set([
    "user",
    "assistant",
  ]);

// ==============================
// Chat Controller
// ==============================

export async function chatController(
  request: Request<
    Record<string, never>,
    Record<string, never>,
    ChatRequestBody
  >,
  response: Response
) {
  try {
    // ==============================
    // Validate Request Body
    // ==============================

    const messages =
      request.body.messages;

    if (!Array.isArray(messages)) {
      return response.status(400).json({
        error:
          "Messages must be provided as an array.",
      });
    }

    if (messages.length === 0) {
      return response.status(400).json({
        error:
          "At least one message is required.",
      });
    }

    // ==============================
    // Prevent Excessive Payloads
    // ==============================

    if (
      messages.length >
      MAX_MESSAGES
    ) {
      return response.status(400).json({
        error:
          `A maximum of ${MAX_MESSAGES} conversation messages is allowed per request.`,
      });
    }

    // ==============================
    // Validate Message Structure
    // ==============================

    const cleanMessages:
      ClientChatMessage[] = [];

    for (
      const message
      of messages
    ) {
      if (
        !message ||
        typeof message !==
          "object"
      ) {
        return response.status(400).json({
          error:
            "Each message must be a valid object.",
        });
      }

      // ==============================
      // Prevent System Prompt Injection
      // ==============================

      if (
        !VALID_CLIENT_ROLES.has(
          message.role
        )
      ) {
        return response.status(400).json({
          error:
            "Message role must be either user or assistant.",
        });
      }

      if (
        typeof message.content !==
        "string"
      ) {
        return response.status(400).json({
          error:
            "Each message must contain text content.",
        });
      }

      const content =
        message.content.trim();

      if (!content) {
        return response.status(400).json({
          error:
            "Message content cannot be empty.",
        });
      }

      if (
        content.length >
        MAX_MESSAGE_LENGTH
      ) {
        return response.status(400).json({
          error:
            `Each message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
        });
      }

      cleanMessages.push({
        role:
          message.role as
            | "user"
            | "assistant",

        content,
      });
    }

    // ==============================
// Require Latest Message From User
// ==============================

const latestMessage =
  cleanMessages[
    cleanMessages.length - 1
  ];

if (
  !latestMessage ||
  latestMessage.role !== "user"
) {
  return response.status(400).json({
    error:
      "The latest conversation message must be from the user.",
  });
}

const latestUserMessage =
  latestMessage;

    // ==============================
    // Emergency Safety Screening
    // ==============================

    const emergency =
      checkForEmergency(
        latestUserMessage.content
      );

    if (
      emergency.isEmergency &&
      emergency.response
    ) {
      // ==============================
      // Bypass AI Model Completely
      // ==============================

      return response
        .status(200)
        .json({
          reply:
            emergency.response,

          emergency: true,

          category:
            emergency.category ??
            "general_emergency",

          source:
            "safety_layer",
        });
    }

    // ==============================
    // Generate AI Response
    // ==============================

        const reply =
      await generateChatResponse(
        cleanMessages
      );

    // ==============================
    // Validate AI Response
    // ==============================

    const cleanReply =
      reply.trim();

    if (!cleanReply) {
      throw new Error(
        "The AI model returned an empty response."
      );
    }

    // ==============================
    // Return Successful Response
    // ==============================

    return response.status(200).json({
      reply:
        cleanReply,

      emergency: false,

      source:
        "ollama",
    });

  } catch (error) {
  // ==============================
  // Server-side Logging
  // ==============================

  console.error(
    "Chat controller error:",
    error
  );

  // ==============================
  // Known Safe Errors
  // ==============================

  if (error instanceof Error) {
    const safeMessages = new Set([
      "Nura AI took too long to respond.",
      "The AI service could not complete the request.",
      "The AI service returned an invalid response.",
      "Nura AI could not communicate with the AI service.",
    ]);

    if (safeMessages.has(error.message)) {
      return response.status(503).json({
        error: error.message,
      });
    }
  }

  // ==============================
  // Generic Server Error
  // ==============================

  return response.status(500).json({
    error:
      "Nura AI could not generate a response. Please try again.",
  });
}
}