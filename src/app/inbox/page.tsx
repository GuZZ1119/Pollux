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
      setError("Could not reach the server");
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

  const newCount = messages.filter((m) => m.status === "unread" && !viewedIds.has(m.id)).length;
  const highRiskCount = messages.filter((m) => m.riskLevel === "HIGH").length;
  const gmailCount = messages.filter((m) => m.provider === "gmail").length;
  const slackCount = messages.filter((m) => m.provider === "slack").length;

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-[380px] shrink-0 border-r border-border bg-surface flex flex-col">
          <div className="p-5 space-y-4">
            <div className="h-5 w-20 bg-subtle rounded-md animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-14 bg-subtle rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-3 space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-3 space-y-2 rounded-lg">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-28 bg-subtle rounded animate-pulse" />
                    <div className="h-3 w-full bg-page rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-8 bg-page rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-page">
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-ink-tertiary">Loading messages</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-page">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-danger-subtle flex items-center justify-center">
            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-ink mb-1">Unable to load inbox</p>
          <p className="text-[13px] text-ink-tertiary mb-5">{error}</p>
          <button
            onClick={() => fetchMessages(filter)}
            className="px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left — message list */}
      <div className="w-[380px] shrink-0 border-r border-border flex flex-col bg-surface">
        <div className="px-5 pt-5 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[15px] font-semibold text-ink">Inbox</h1>
            <button
              onClick={() => fetchMessages(filter)}
              className="p-1.5 rounded-md text-ink-faint hover:text-ink-secondary hover:bg-subtle transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Metrics row */}
          <div className="flex gap-2">
            <div className="flex-1 bg-page rounded-lg px-3 py-2.5">
              <p className="text-lg font-semibold text-ink tabular-nums">{messages.length}</p>
              <p className="text-[10px] text-ink-tertiary font-medium tracking-wide uppercase">Messages</p>
            </div>
            <div className="flex-1 bg-accent-subtle rounded-lg px-3 py-2.5">
              <p className="text-lg font-semibold text-accent tabular-nums">{newCount}</p>
              <p className="text-[10px] text-accent-muted font-medium tracking-wide uppercase">New</p>
            </div>
            <div className={`flex-1 rounded-lg px-3 py-2.5 ${highRiskCount > 0 ? "bg-danger-subtle" : "bg-page"}`}>
              <p className={`text-lg font-semibold tabular-nums ${highRiskCount > 0 ? "text-danger" : "text-ink-faint"}`}>{highRiskCount}</p>
              <p className={`text-[10px] font-medium tracking-wide uppercase ${highRiskCount > 0 ? "text-danger/60" : "text-ink-faint"}`}>High Risk</p>
            </div>
          </div>

          {/* Filter toggle */}
          <div className="flex items-center gap-0.5 bg-page rounded-lg p-0.5">
            <button
              onClick={() => handleFilterChange("primary")}
              className={`flex-1 text-[12px] py-1.5 rounded-md transition-all font-medium ${
                filter === "primary"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-tertiary hover:text-ink-secondary"
              }`}
            >
              Important
            </button>
            <button
              onClick={() => handleFilterChange("all")}
              className={`flex-1 text-[12px] py-1.5 rounded-md transition-all font-medium ${
                filter === "all"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-tertiary hover:text-ink-secondary"
              }`}
            >
              All
            </button>
          </div>

          {/* Source info */}
          <div className="flex items-center gap-3 text-[11px] text-ink-faint">
            {gmailCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                {gmailCount} Gmail
              </span>
            )}
            {slackCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-muted" />
                {slackCount} Slack
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin border-t border-border-light">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-10 text-center">
              <div className="w-12 h-12 mb-4 rounded-xl bg-subtle flex items-center justify-center">
                <svg className="w-5 h-5 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-ink mb-1">No messages</p>
              <p className="text-[12px] text-ink-tertiary mb-4">Connect Gmail or Slack to see messages here.</p>
              <a href="/settings" className="text-[12px] font-medium text-accent hover:text-accent-hover transition-colors">
                Go to Settings
              </a>
            </div>
          ) : (
            <MessageList messages={messages} selectedId={selectedId} viewedIds={viewedIds} onSelect={handleSelectMessage} />
          )}
        </div>
      </div>

      {/* Right — detail */}
      <div className="flex-1 flex flex-col bg-page">
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <div className="w-14 h-14 mb-5 rounded-2xl bg-accent-subtle flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-ink mb-1">Select a conversation</p>
            <p className="text-[13px] text-ink-tertiary max-w-[260px] leading-relaxed">
              Choose a message to view details and draft an AI-powered reply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
