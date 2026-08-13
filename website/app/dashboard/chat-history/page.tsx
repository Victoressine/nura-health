// ==============================
// Imports
// ==============================

import {
  Bot,
  ShieldCheck,
} from "lucide-react";

import ChatHistoryList from "@/components/chat/chat-history-list";

// ==============================
// Chat History Page
// ==============================

export default function ChatHistoryPage() {
  return (
    <section className="space-y-6">
      {/* ==============================
          Header
      ============================== */}

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
          <Bot size={17} />

          Nura AI
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Chat history
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review your previous
          conversations with Nura AI
          and revisit health guidance
          from earlier chats.
        </p>
      </div>

      {/* ==============================
          Safety Notice
      ============================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-blue-700"
        />

        <p className="text-xs leading-5 text-blue-700">
          Your saved conversations
          contain health information
          you shared with Nura AI.
          Nura provides general health
          guidance and does not replace
          professional medical advice,
          diagnosis, or emergency care.
        </p>
      </div>

      {/* ==============================
          History
      ============================== */}

      <ChatHistoryList />
    </section>
  );
}