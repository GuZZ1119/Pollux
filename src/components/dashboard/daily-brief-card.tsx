"use client";

import { useEffect, useState, useCallback } from "react";
import type { DailyBrief, ApiResponse } from "@/lib/types";
import Link from "next/link";

const riskColors = {
  HIGH: "text-red-600 bg-red-50 border-red-200",
  MEDIUM: "text-amber-600 bg-amber-50 border-amber-200",
  LOW: "text-blue-600 bg-blue-50 border-blue-200",
};

const riskDot = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-blue-400",
};

const priorityLabel = {
  high: "Urgent",
  medium: "Soon",
  low: "Low",
};

const priorityColor = {
  high: "text-red-600 bg-red-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-gray-500 bg-gray-100",
};

const sourceModeLabel = {
  ai_generated: "AI summary",
  rule_based: "Rule-based",
  fallback: "Rule-based (AI unavailable)",
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
      setError("Network error — could not reach the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrief();
  }, [fetchBrief]);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
          <div className="h-4 w-1/2 bg-gray-50 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">{error}</p>
        <button
          onClick={() => fetchBrief(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Daily Brief</h2>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">{brief.periodLabel}</p>
            </div>
          </div>
          <button
            onClick={() => fetchBrief(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
            title="Refresh summary (force new)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Headline */}
        <p className="text-lg font-semibold text-gray-900 mb-2">{brief.headline}</p>

        {/* Summary */}
        <p className="text-sm text-gray-600 leading-relaxed">{brief.summaryText}</p>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-gray-900">{displayTotal}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mt-0.5">
              {brief.periodLabel === "Today" ? "Today" : "Total"}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-blue-700">{unreadTotal}</p>
            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-medium mt-0.5">Unread</p>
          </div>
          <div className={`rounded-xl px-3 py-3 text-center ${brief.attentionItems.length > 0 ? "bg-amber-50" : "bg-gray-50"}`}>
            <p className={`text-xl font-bold ${brief.attentionItems.length > 0 ? "text-amber-600" : "text-gray-300"}`}>
              {brief.attentionItems.length}
            </p>
            <p className={`text-[10px] uppercase tracking-wider font-medium mt-0.5 ${brief.attentionItems.length > 0 ? "text-amber-400" : "text-gray-300"}`}>
              Attention
            </p>
          </div>
        </div>

        {/* Provider breakdown */}
        <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
          {brief.providerCounts.map((p) => (
            <span key={p.provider} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${p.provider === "gmail" ? "bg-red-400" : "bg-purple-400"}`} />
              {p.total} {p.provider} ({p.unread} unread)
            </span>
          ))}
        </div>
      </div>

      {/* Attention items */}
      {brief.attentionItems.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2.5">
            Needs Attention
          </p>
          <div className="space-y-2">
            {brief.attentionItems.slice(0, 5).map((item) => (
              <div
                key={item.messageId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${riskColors[item.riskLevel]}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${riskDot[item.riskLevel]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.subject ?? `Message from ${item.sender}`}
                  </p>
                  <p className="text-[11px] opacity-70">
                    {item.sender} · {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action items */}
      {brief.actionItems.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2.5">
            Action Items
          </p>
          <div className="space-y-2">
            {brief.actionItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="w-5 h-5 rounded border-2 border-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.description}</p>
                  <p className="text-[11px] text-gray-400">{item.sender}</p>
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
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {sourceModeLabel[brief.sourceMode]} · {new Date(brief.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <Link href="/inbox" className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
          Open Inbox →
        </Link>
      </div>
    </div>
  );
}
