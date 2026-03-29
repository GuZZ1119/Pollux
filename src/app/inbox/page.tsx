"use client";

import { useEffect, useState, useCallback } from "react";
import type { MessageItem, ApiResponse } from "@/lib/types";
import { MessageList } from "@/components/inbox/message-list";
import { MessageDetail } from "@/components/inbox/message-detail";

type FilterMode = "primary" | "all";

const STORAGE_KEY = "pollux_inbox_filter";

function getStoredFilter(): FilterMode {
  if (typeof window === "undefined") return "primary";
  return (localStorage.getItem(STORAGE_KEY) as FilterMode) ?? "primary";
}

function logClientEvent(payload: Record<string, unknown>) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export default function InboxPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("primary");

  const fetchMessages = useCallback(async (mode: FilterMode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inbox?filter=${mode}`);
      const data: ApiResponse<MessageItem[]> = await res.json();
      if (data.success && data.data) {
        setMessages(data.data);
      } else {
        setError(data.error ?? "Failed to load messages");
      }
    } catch {
      setError("Network error — could not reach the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredFilter();
    setFilter(stored);
    fetchMessages(stored);
  }, [fetchMessages]);

  const handleFilterChange = (mode: FilterMode) => {
    setFilter(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    fetchMessages(mode);
    logClientEvent({
      eventType: "filter_changed",
      metadata: { filter: mode },
    });
  };

  const handleSelectMessage = (id: string) => {
    setSelectedId(id);
    const msg = messages.find((m) => m.id === id);
    logClientEvent({
      eventType: "message_opened",
      provider: msg?.provider,
      messageId: id,
      threadId: msg?.threadId,
      metadata: { riskLevel: msg?.riskLevel },
    });
  };

  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const highRiskCount = messages.filter((m) => m.riskLevel === "HIGH").length;
  const mediumRiskCount = messages.filter(
    (m) => m.riskLevel === "MEDIUM",
  ).length;
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
            onClick={() => fetchMessages(filter)}
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
      {/* Left panel */}
      <div className="w-96 shrink-0 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
            <button
              onClick={() => fetchMessages(filter)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>

          {/* Metrics bar */}
          <div className="flex gap-3 text-xs">
            <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-700">
              {messages.length} Messages
            </span>
            <span className="px-2 py-1 bg-yellow-50 rounded-md text-yellow-700">
              {unreadCount} Unread
            </span>
            {highRiskCount > 0 && (
              <span className="px-2 py-1 bg-red-50 rounded-md text-red-700">
                {highRiskCount} High Risk
              </span>
            )}
            {mediumRiskCount > 0 && (
              <span className="px-2 py-1 bg-orange-50 rounded-md text-orange-700">
                {mediumRiskCount} Medium
              </span>
            )}
          </div>

          {/* Filter toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => handleFilterChange("primary")}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                filter === "primary"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Primary Only
            </button>
            <button
              onClick={() => handleFilterChange("all")}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Inbox
            </button>
          </div>

          {/* Source breakdown */}
          <p className="text-xs text-gray-400">
            {hasGmail ? `${gmailCount} Gmail (live)` : ""}
            {hasGmail && slackCount > 0 ? " · " : ""}
            {slackCount > 0 ? `${slackCount} Slack (mock)` : ""}
            {!hasGmail && slackCount === 0 ? "No messages" : ""}
          </p>
          {!hasGmail && (
            <a
              href="/settings"
              className="inline-block text-xs text-blue-600 hover:underline"
            >
              Connect Gmail to see real emails →
            </a>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessageList
            messages={messages}
            selectedId={selectedId}
            onSelect={handleSelectMessage}
          />
        </div>
      </div>

      {/* Right panel */}
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
