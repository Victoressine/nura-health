"use client";

// ==============================
// Imports
// ==============================

import {
  useEffect,
  useState,
} from "react";

import {
  Bot,
  Clock3,
  Loader2,
  MessageCircle,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "@/lib/firebase";

// ==============================
// Types
// ==============================

type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Timestamp;
};

// ==============================
// Date Formatter
// ==============================

function formatDate(
  timestamp?: Timestamp
) {
  if (!timestamp) {
    return "";
  }

  return timestamp
    .toDate()
    .toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
}

// ==============================
// Chat History List
// ==============================

export default function ChatHistoryList() {
  // ==============================
  // State
  // ==============================

  const [
    userId,
    setUserId,
  ] = useState<string | null>(null);

  const [
    sessions,
    setSessions,
  ] = useState<ChatSession[]>([]);

  const [
    selectedSession,
    setSelectedSession,
  ] = useState<ChatSession | null>(
    null
  );

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    messagesLoading,
    setMessagesLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==============================
  // Authentication
  // ==============================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
         if (!user) {
  setUserId(null);
  setSessions([]);
  setSelectedSession(null);
  setMessages([]);
  setError("");
  setLoading(false);
  return;
}

// ==============================
// Prepare Authenticated Session
// ==============================

setError("");
setLoading(true);
setUserId(user.uid);
        }
      );

    return unsubscribe;
  }, []);

  // ==============================
  // Load Chat Sessions
  // ==============================

  useEffect(() => {
    if (!userId) {
      return;
    }

    const sessionsRef =
      collection(
        db,
        "users",
        userId,
        "chatSessions"
      );

    const sessionsQuery =
      query(
        sessionsRef,
        orderBy(
          "updatedAt",
          "desc"
        )
      );

    const unsubscribe =
      onSnapshot(
        sessionsQuery,

        (snapshot) => {
          const items:
            ChatSession[] =
            snapshot.docs.map(
              (document) => {
                const data =
                  document.data();

                return {
                  id:
                    document.id,

                  title:
                    typeof data.title ===
                    "string"
                      ? data.title
                      : "Nura AI conversation",

                  lastMessage:
                    typeof data.lastMessage ===
                    "string"
                      ? data.lastMessage
                      : "",

                  createdAt:
                    data.createdAt instanceof
                    Timestamp
                      ? data.createdAt
                      : undefined,

                  updatedAt:
                    data.updatedAt instanceof
                    Timestamp
                      ? data.updatedAt
                      : undefined,
                };
              }
            );

          setSessions(items);
          setLoading(false);
        },

        (snapshotError) => {
          console.error(
            "Unable to load chat history:",
            snapshotError
          );

          setError(
            "We could not load your chat history."
          );

          setLoading(false);
        }
      );

    return unsubscribe;
  }, [userId]);

  // ==============================
  // Load Selected Conversation
  // ==============================

  useEffect(() => {
    if (
      !userId ||
      !selectedSession
    ) {
      return;
    }

    const messagesRef =
      collection(
        db,
        "users",
        userId,
        "chatSessions",
        selectedSession.id,
        "messages"
      );

    const messagesQuery =
      query(
        messagesRef,
        orderBy(
          "createdAt",
          "asc"
        )
      );

    const unsubscribe =
      onSnapshot(
        messagesQuery,

        (snapshot) => {
          const items:
            ChatMessage[] =
            snapshot.docs.map(
              (document) => {
                const data =
                  document.data();

                return {
                  id:
                    document.id,

                  role:
                    data.role ===
                    "user"
                      ? "user"
                      : "assistant",

                  content:
                    typeof data.content ===
                    "string"
                      ? data.content
                      : "",

                  createdAt:
                    data.createdAt instanceof
                    Timestamp
                      ? data.createdAt
                      : undefined,
                };
              }
            );

          setMessages(items);
          setMessagesLoading(false);
        },

        (snapshotError) => {
          console.error(
            "Unable to load conversation:",
            snapshotError
          );

          setError(
            "We could not load this conversation."
          );

          setMessagesLoading(false);
        }
      );

    return unsubscribe;
  }, [
    userId,
    selectedSession,
  ]);

  // ==============================
  // Select Conversation
  // ==============================

  function handleSelectSession(
    session: ChatSession
  ) {
    // Clear the previous conversation
    // before subscribing to the new one.

    setMessages([]);

    setMessagesLoading(true);

    setError("");

    setSelectedSession(
      session
    );
  }

  // ==============================
  // Loading State
  // ==============================

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2
            size={18}
            className="animate-spin text-blue-600"
          />

          Loading chat history...
        </div>
      </div>
    );
  }

  // ==============================
  // Error With No Sessions
  // ==============================

  if (
    error &&
    sessions.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          {error}
        </p>

        <p className="mt-1 text-xs leading-5 text-red-600">
          Refresh the page or try
          again shortly.
        </p>
      </div>
    );
  }

  // ==============================
  // Empty State
  // ==============================

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <MessageCircle
          size={32}
          className="mx-auto text-slate-400"
        />

        <h2 className="mt-4 text-base font-semibold text-slate-900">
          No conversations yet
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Your conversations with
          Nura AI will appear here
          after you start using the
          health assistant.
        </p>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* ==============================
            Conversation List
        ============================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}

          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Conversations
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {sessions.length} saved{" "}
              conversation
              {sessions.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          {/* Sessions */}

          <div className="max-h-[650px] overflow-y-auto">
            {sessions.map(
              (session) => {
                const active =
                  selectedSession?.id ===
                  session.id;

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() =>
                      handleSelectSession(
                        session
                      )
                    }
                    className={`w-full border-b border-slate-100 px-5 py-4 text-left transition last:border-b-0 ${
                      active
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Title */}

                    <p
                      className={`truncate text-sm font-semibold ${
                        active
                          ? "text-blue-700"
                          : "text-slate-900"
                      }`}
                    >
                      {session.title}
                    </p>

                    {/* Preview */}

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {
                        session.lastMessage
                      }
                    </p>

                    {/* Date */}

                    {session.updatedAt && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock3
                          size={12}
                        />

                        {formatDate(
                          session.updatedAt
                        )}
                      </p>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* ==============================
            Conversation Detail
        ============================== */}

        <div className="min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!selectedSession ? (
            // ==============================
            // No Conversation Selected
            // ==============================

            <div className="flex h-full min-h-[520px] items-center justify-center p-8 text-center">
              <div>
                <Bot
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-base font-semibold text-slate-900">
                  Select a conversation
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Choose a saved chat
                  from the list to view
                  the complete
                  conversation.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ==============================
                  Conversation Header
              ============================== */}

              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-semibold text-slate-900">
                  {
                    selectedSession.title
                  }
                </h2>

                {selectedSession.updatedAt && (
                  <p className="mt-1 text-xs text-slate-500">
                    Last updated{" "}
                    {formatDate(
                      selectedSession.updatedAt
                    )}
                  </p>
                )}
              </div>

              {/* ==============================
                  Messages
              ============================== */}

              <div className="max-h-[590px] min-h-[450px] space-y-4 overflow-y-auto bg-slate-50/60 p-5">
                {messagesLoading ? (
                  // Loading conversation

                  <div className="flex min-h-40 items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2
                        size={20}
                        className="animate-spin text-blue-600"
                      />

                      Loading conversation...
                    </div>
                  </div>
                ) : messages.length ===
                  0 ? (
                  // Empty conversation

                  <div className="flex min-h-40 items-center justify-center text-center">
                    <div>
                      <MessageCircle
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        No messages were
                        found in this
                        conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Conversation messages

                  messages.map(
                    (
                      chatMessage
                    ) => {
                      const isUser =
                        chatMessage.role ===
                        "user";

                      return (
                        <div
                          key={
                            chatMessage.id
                          }
                          className={`flex ${
                            isUser
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                              isUser
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                            }`}
                          >
                            {
                              chatMessage.content
                            }

                            {chatMessage.createdAt && (
                              <p
                                className={`mt-2 text-[10px] ${
                                  isUser
                                    ? "text-blue-100"
                                    : "text-slate-400"
                                }`}
                              >
                                {formatDate(
                                  chatMessage.createdAt
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==============================
          Error
      ============================== */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}