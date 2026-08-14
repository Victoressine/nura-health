"use client";

// ==============================
// Imports
// ==============================

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import Link from "next/link";

import {
  Bot,
  History,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  X,
} from "lucide-react";

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

// ==============================
// Types
// ==============================

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatApiResponse = {
  reply?: string;
  error?: string;
};

// ==============================
// Constants
// ==============================

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I’m Nura AI. I can provide general health guidance and help you think through symptoms. I do not replace a doctor or emergency service.",
};

// ==============================
// Chatbot API Configuration
// ==============================

const CHATBOT_API_URL =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL
    ?.trim()
    .replace(/\/+$/, "") ?? "";

const chatbotConfigured =
  CHATBOT_API_URL.length > 0;
const MAX_MESSAGE_LENGTH = 2000;

const REQUEST_TIMEOUT_MS = 90_000;

// ==============================
// Nura Chat Widget
// ==============================

export default function NuraChatWidget() {
  // ==============================
  // State
  // ==============================

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // ==============================
  // Refs
  // ==============================

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ==============================
  // Auto-scroll
  // ==============================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading, error]);

  // ==============================
  // Start New Conversation
  // ==============================

  function handleNewChat() {
    if (loading) {
      return;
    }

    setMessages([INITIAL_MESSAGE]);

    setCurrentSessionId(null);
    setMessage("");
    setError("");
  }

  // ==============================
  // Create Chat Session
  // ==============================

  async function createChatSession(firstMessage: string): Promise<string> {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be signed in to use Nura AI.");
    }

    const cleanTitle = firstMessage.trim();

    const title =
      cleanTitle.length > 60 ? `${cleanTitle.slice(0, 60)}...` : cleanTitle;

    const sessionRef = await addDoc(
      collection(db, "users", user.uid, "chatSessions"),
      {
        title: title || "Nura AI conversation",

        lastMessage: firstMessage,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      },
    );

    setCurrentSessionId(sessionRef.id);

    return sessionRef.id;
  }

  // ==============================
  // Save Chat Message
  // ==============================

  async function saveMessage(sessionId: string, chatMessage: ChatMessage) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be signed in to save this conversation.");
    }

    // ==============================
    // Save Message
    // ==============================

    await addDoc(
      collection(db, "users", user.uid, "chatSessions", sessionId, "messages"),
      {
        role: chatMessage.role,

        content: chatMessage.content,

        createdAt: serverTimestamp(),
      },
    );

    // ==============================
    // Update Session Preview
    // ==============================

    await updateDoc(doc(db, "users", user.uid, "chatSessions", sessionId), {
      lastMessage: chatMessage.content,

      updatedAt: serverTimestamp(),
    });
  }

  // ==============================
  // Send Message
  // ==============================

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || loading) {
      return;
    }

    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      setError(`Messages cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);

      return;
    }

    const user =
      auth.currentUser;

    if (!user) {
      setError(
        "Please sign in to use Nura AI."
      );

      return;
    }

    // ==============================
    // Validate Chatbot Configuration
    // ==============================

    if (!chatbotConfigured) {
      setError(
        "Nura AI is temporarily unavailable in this environment."
      );

      return;
    }

    // ==============================
    // Build User Message
    // ==============================

    const userMessage: ChatMessage = {
      role: "user",
      content: cleanMessage,
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    // ==============================
    // Optimistic UI Update
    // ==============================

    setMessages(nextMessages);

    setMessage("");
    setError("");
    setLoading(true);

    // ==============================
    // Request Timeout
    // ==============================

    const controller = new AbortController();

    const timeout = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      // ==============================
      // Create / Reuse Session
      // ==============================

      let sessionId = currentSessionId;

      if (!sessionId) {
        sessionId = await createChatSession(cleanMessage);
      }

      // ==============================
      // Save User Message
      // ==============================

      await saveMessage(sessionId, userMessage);

      // ==============================
      // Firebase ID Token
      // ==============================

      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const idToken = await currentUser.getIdToken();


      // ==============================
      // Call Secured Chatbot API
      // ==============================

      const response = await fetch(`${CHATBOT_API_URL}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },

        signal: controller.signal,

        body: JSON.stringify({
          messages: nextMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });
      // ==============================
      // Parse API Response
      // ==============================

      let data: ChatApiResponse | null = null;

      try {
        data = (await response.json()) as ChatApiResponse;
      } catch {
        data = null;
      }

      // ==============================
      // Handle HTTP Errors
      // ==============================

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (response.status === 429) {
          throw new Error(
            "Nura AI is receiving too many requests. Please try again shortly.",
          );
        }

        throw new Error(
          data?.error || "The Nura AI service is currently unavailable.",
        );
      }

      // ==============================
      // Validate AI Response
      // ==============================

      const reply = data?.reply?.trim();

      if (!reply) {
        throw new Error(data?.error || "Nura AI returned an empty response.");
      }

      // ==============================
      // Assistant Message
      // ==============================

      const assistantMessage: ChatMessage = {
        role: "assistant",

        content: reply,
      };

      setMessages((current) => [...current, assistantMessage]);

      // ==============================
// Save AI Response
// ==============================

try {
  await saveMessage(
    sessionId,
    assistantMessage
  );
} catch (saveError) {
  console.error(
    "Unable to save assistant message:",
    saveError
  );
}

    } catch (chatError) {
      console.error("Nura chatbot error:", chatError);

      // ==============================
      // Friendly Error Handling
      // ==============================

      if (
        chatError instanceof DOMException &&
        chatError.name === "AbortError"
      ) {
        setError("Nura AI took too long to respond. Please try again.");

        return;
      }

      if (chatError instanceof Error) {
        setError(chatError.message);

        return;
      }

      setError("Nura AI is temporarily unavailable. Please try again.");
    } finally {
      window.clearTimeout(timeout);

      setLoading(false);
    }
  }

  // ==============================
  // Keyboard Handling
  // ==============================

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      void handleSubmit();
    }
  }

  // ==============================
  // UI
  // ==============================

  return (
    <>
      {/* ==============================
          Chat Panel
      ============================== */}

      {open && (
        <div
          role="dialog"
          aria-label="Nura AI health assistant"
          className="fixed bottom-24 right-4 z-50 flex h-[620px] max-h-[calc(100vh-120px)] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:right-6"
        >
          {/* ==============================
              Header
          ============================== */}

          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Bot size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  Nura AI
                </p>

                <p className="truncate text-xs text-slate-500">
                  Health guidance assistant
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {/* ==============================
                  New Chat
              ============================== */}

              <button
                type="button"
                onClick={handleNewChat}
                disabled={loading}
                aria-label="Start new chat"
                title="New chat"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={18} />
              </button>

              {/* ==============================
                  History
              ============================== */}

              <Link
                href="/dashboard/chat-history"
                aria-label="Chat history"
                title="Chat history"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <History size={18} />
              </Link>

              {/* ==============================
                  Close
              ============================== */}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Nura AI chat"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ==============================
              Safety Notice
          ============================== */}

          <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs leading-5 text-blue-800">
              Nura provides general health information and does not replace
              professional medical advice, diagnosis, or emergency care.
            </p>
          </div>

          {/* ==============================
              Messages
          ============================== */}

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4"
            aria-live="polite"
          >
            {messages.map((chatMessage, index) => {
              const isUser = chatMessage.role === "user";

              return (
                <div
                  key={`${chatMessage.role}-${index}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isUser
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {chatMessage.content}
                  </div>
                </div>
              );
            })}

            {/* ==============================
                Loading
            ============================== */}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  Nura is thinking...
                </div>
              </div>
            )}

            {/* ==============================
                Error
            ============================== */}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 p-3"
              >
                <p className="text-xs leading-5 text-red-700">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ==============================
              Composer
          ============================== */}

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 bg-white p-4"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Ask Nura about your health..."
                aria-label="Message Nura AI"
                className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={loading || !message.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[10px] text-slate-400">
                {message.length}/{MAX_MESSAGE_LENGTH}
              </p>

              <p className="text-[11px] leading-4 text-slate-400">
                Do not use Nura AI for emergencies.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* ==============================
          Floating Chat Button
      ============================== */}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close Nura AI" : "Open Nura AI"}
        className="fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl sm:right-6"
      >
        {open ? <X size={19} /> : <MessageCircle size={19} />}

        <span className="hidden sm:inline">{open ? "Close" : "Ask Nura"}</span>
      </button>
    </>
  );
}
