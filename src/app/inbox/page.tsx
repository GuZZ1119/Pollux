"use client";

import { useEffect, useState } from "react";
import type { MessageItem, ApiResponse } from "@/lib/types";
import { MessageList } from "@/components/inbox/message-list";
import { MessageDetail } from "@/components/inbox/message-detail";

export default function InboxPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/inbox")
      .then((r) => r.json())
      .then((data: ApiResponse<MessageItem[]>) => {
        if (data.success && data.data) {
          setMessages(data.data);
        } else {
          setError(data.error ?? "Failed to load messages");
        }
      })
      .catch(() => setError("Network error — could not reach the server"))
      .finally(() => setLoading(false));
  }, []);

  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  const gmailCount = messages.filter((m) => m.provider === "gmail").length;
  const slackCount = messages.filter((m) => m.provider === "slack").length;
  const hasGmail = gmailCount > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          <p className="text-red-500 text-sm mb-2">Failed to load inbox</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left panel — message list */}
      <div className="w-96 shrink-0 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
          <p className="text-xs text-gray-500">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
            {hasGmail ? ` — ${gmailCount} Gmail (live)` : ""}
            {slackCount > 0 ? ` · ${slackCount} Slack (mock)` : ""}
          </p>
          {!hasGmail && (
            <a
              href="/settings"
              className="inline-block mt-2 text-xs text-blue-600 hover:underline"
            >
              Connect Gmail to see real emails →
            </a>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      {/* Right panel — detail + reply */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            {messages.length > 0
              ? "Select a message to view details"
              : "No messages yet. Connect Gmail in Settings to get started."}
          </div>
        )}
      </div>
    </div>
  );
}
