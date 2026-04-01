"use client";

import { useEffect, useState, useCallback } from "react";
import type { DailyBrief, ApiResponse } from "@/lib/types";
import Link from "next/link";

const riskColors = {
  HIGH: "text-danger bg-danger-subtle",
  MEDIUM: "text-caution bg-caution-subtle",
  LOW: "text-accent bg-accent-subtle",
};

const priorityLabel = {
  high: "Urgent",
  medium: "Soon",
  low: "Low",
};

const priorityColor = {
  high: "text-danger bg-danger-subtle",
  medium: "text-caution bg-caution-subtle",
  low: "text-ink-tertiary bg-subtle",
};

const sourceModeLabel = {
  ai_generated: "AI summary",
  rule_based: "Rule-based",
  fallback: "Rule-based",
};

export function DailyBriefCard() {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrief = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/summary${refresh ? "?refresh=true" : ""}`);
      const data: ApiResponse<DailyBrief> = await res.json();
      if (data.success && data.data) {
        setBrief(data.data);
      } else {
        setError(data.error ?? "Failed to generate brief");
      }
    } catch {
      setError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrief();
  }, [fetchBrief]);

  if (loading) {
    return (
      <div className="border border-border rounded-xl bg-surface p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-subtle" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-subtle rounded" />
            <div className="h-3 w-24 bg-page rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-page rounded" />
          <div className="h-3 w-3/4 bg-page rounded" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-14 bg-page rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-border rounded-xl bg-surface p-6 text-center">
        <p className="text-[13px] text-ink-tertiary mb-3">{error}</p>
        <button
          onClick={() => fetchBrief(true)}
          className="px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!brief) return null;

  const unreadTotal = brief.providerCounts.reduce((s, p) => s + p.unread, 0);
  const displayTotal = brief.totalToday > 0 ? brief.totalToday : brief.totalAll;

  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-ink">Daily Brief</h2>
              <p className="text-[11px] text-ink-tertiary tracking-wide uppercase">{brief.periodLabel}</p>
            </div>
          </div>
          <button
            onClick={() => fetchBrief(true)}
            className="p-1.5 rounded-md text-ink-faint hover:text-ink-secondary hover:bg-subtle transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <p className="text-[14px] font-medium text-ink mb-1.5">{brief.headline}</p>
        <p className="text-[13px] text-ink-secondary leading-relaxed">{brief.summaryText}</p>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-t border-border-light">
        <div className="flex gap-3">
          <div className="flex-1 bg-page rounded-lg px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-ink tabular-nums">{displayTotal}</p>
            <p className="text-[10px] text-ink-tertiary font-medium tracking-wide uppercase mt-0.5">
              {brief.periodLabel === "Today" ? "Today" : "Total"}
            </p>
          </div>
          <div className="flex-1 bg-accent-subtle rounded-lg px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-accent tabular-nums">{unreadTotal}</p>
            <p className="text-[10px] text-accent-muted font-medium tracking-wide uppercase mt-0.5">Unread</p>
          </div>
          <div className={`flex-1 rounded-lg px-3 py-2.5 text-center ${brief.attentionItems.length > 0 ? "bg-caution-subtle" : "bg-page"}`}>
            <p className={`text-lg font-semibold tabular-nums ${brief.attentionItems.length > 0 ? "text-caution" : "text-ink-faint"}`}>
              {brief.attentionItems.length}
            </p>
            <p className={`text-[10px] font-medium tracking-wide uppercase mt-0.5 ${brief.attentionItems.length > 0 ? "text-caution/60" : "text-ink-faint"}`}>
              Attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-ink-faint">
          {brief.providerCounts.map((p) => (
            <span key={p.provider} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${p.provider === "gmail" ? "bg-danger/50" : "bg-accent-muted"}`} />
              {p.total} {p.provider} ({p.unread} unread)
            </span>
          ))}
        </div>
      </div>

      {/* Attention */}
      {brief.attentionItems.length > 0 && (
        <div className="px-6 py-4 border-t border-border-light">
          <p className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase mb-2.5">
            Needs Attention
          </p>
          <div className="space-y-1.5">
            {brief.attentionItems.slice(0, 5).map((item) => (
              <div
                key={item.messageId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${riskColors[item.riskLevel]}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">
                    {item.subject ?? `Message from ${item.sender}`}
                  </p>
                  <p className="text-[11px] opacity-60">
                    {item.sender} · {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {brief.actionItems.length > 0 && (
        <div className="px-6 py-4 border-t border-border-light">
          <p className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase mb-2.5">
            Action Items
          </p>
          <div className="space-y-1.5">
            {brief.actionItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-page hover:bg-subtle transition-colors"
              >
                <div className="w-4 h-4 rounded border-[1.5px] border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-ink-secondary truncate">{item.description}</p>
                  <p className="text-[11px] text-ink-faint">{item.sender}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${priorityColor[item.priority]}`}>
                  {priorityLabel[item.priority]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border-light flex items-center justify-between">
        <span className="text-[11px] text-ink-faint">
          {sourceModeLabel[brief.sourceMode]} · {new Date(brief.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <Link href="/inbox" className="text-[12px] font-medium text-accent hover:text-accent-hover transition-colors">
          Open Inbox
        </Link>
      </div>
    </div>
  );
}
