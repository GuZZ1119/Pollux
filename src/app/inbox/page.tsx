"use client";

import { useEffect, useState, useCallback } from "react";
import type { MessageItem, ApiResponse } from "@/lib/types";
import { MessageList } from "@/components/inbox/message-list";
import { MessageDetail } from "@/components/inbox/message-detail";
import { getViewedIds, markViewed } from "@/lib/viewed-store";

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
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setViewedIds(getViewedIds());
  }, []);

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
    logClientEvent({ eventType: "filter_changed", metadata: { filter: mode } });
  };

  const handleSelectMessage = (id: string) => {
    setSelectedId(id);
    const updated = markViewed(id);
    setViewedIds(updated);
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

  const gmailUnreadCount = messages.filter((m) => m.status === "unread").length;
  const newCount = messages.filter((m) => m.status === "unread" && !viewedIds.has(m.id)).length;
  const highRiskCount = messages.filter((m) => m.riskLevel === "HIGH").length;
  const gmailCount = messages.filter((m) => m.provider === "gmail").length;
  const slackCount = messages.filter((m) => m.provider === "slack").length;
  const hasGmail = gmailCount > 0;

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-[400px] shrink-0 border-r border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-200">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex-1 p-3 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-3/4 bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500">Loading your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">Unable to load inbox</p>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={() => fetchMessages(filter)}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left panel — message list */}
      <div className="w-[400px] shrink-0 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
              <p className="text-xs text-gray-400 mt-0.5">AI-prioritized communication feed</p>
            </div>
            <button
              onClick={() => fetchMessages(filter)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-semibold text-gray-900">{messages.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Messages</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-3 py-2 text-center group relative">
              <p className="text-lg font-semibold text-blue-700">{newCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-blue-400 font-medium">New</p>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  <p>Unread in Gmail &amp; not yet opened in Pollux</p>
                  <p className="text-gray-400 mt-0.5">{gmailUnreadCount} total unread in Gmail</p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <div className={`rounded-lg px-3 py-2 text-center ${highRiskCount > 0 ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-lg font-semibold ${highRiskCount > 0 ? "text-red-600" : "text-gray-300"}`}>{highRiskCount}</p>
              <p className={`text-[10px] uppercase tracking-wider font-medium ${highRiskCount > 0 ? "text-red-400" : "text-gray-300"}`}>High Risk</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleFilterChange("primary")}
              className={`flex-1 text-xs py-2 rounded-md transition-all ${
                filter === "primary"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Important
            </button>
            <button
              onClick={() => handleFilterChange("all")}
              className={`flex-1 text-xs py-2 rounded-md transition-all ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Everything
            </button>
          </div>

          {/* Source */}
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            {hasGmail && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {gmailCount} Gmail
              </span>
            )}
            {slackCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                {slackCount} Slack
              </span>
            )}
            {gmailUnreadCount > 0 && (
              <span className="text-gray-300">·</span>
            )}
            {gmailUnreadCount > 0 && (
              <span>{gmailUnreadCount} unread in Gmail</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No messages yet</p>
              <p className="text-xs text-gray-400 mb-4">Connect your Gmail to see real emails here.</p>
              <a href="/settings" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                Go to Settings →
              </a>
            </div>
          ) : (
            <MessageList messages={messages} selectedId={selectedId} viewedIds={viewedIds} onSelect={handleSelectMessage} />
          )}
        </div>
      </div>

      {/* Right panel — detail */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 mb-5 rounded-2xl bg-blue-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-700 mb-1">Select a conversation</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Choose a message from the left to view details and generate an AI-powered reply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
