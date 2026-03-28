"use client";

import { useState } from "react";
import type { MessageItem, ReplyCandidate } from "@/lib/types";
import { RiskBadge } from "@/components/shared/status-badge";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { ReplyCandidateCard } from "@/components/reply/reply-candidate-card";

interface Props {
  message: MessageItem;
}

export function MessageDetail({ message }: Props) {
  const [candidates, setCandidates] = useState<ReplyCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [replySource, setReplySource] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setSendStatus(null);
    setGenerateError(null);
    try {
      const res = await fetch("/api/reply/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          content: message.content,
          sender: message.sender,
          subject: message.subject,
          provider: message.provider,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCandidates(data.data as ReplyCandidate[]);
        setReplySource(data.source ?? null);
        setSelectedCandidate(null);
        setReplyText("");
      } else {
        setGenerateError(data.error ?? "Failed to generate replies");
      }
    } catch {
      setGenerateError("Network error — could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (c: ReplyCandidate) => {
    setSelectedCandidate(c.id);
    setReplyText(c.text);
  };

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          replyText,
          provider: message.provider,
          threadId: message.threadId,
          sender: message.sender,
          subject: message.subject,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const isReal = data.data?.provider === "gmail" && data.data?.externalMessageId && !data.data.externalMessageId.startsWith("mock-");
        setSendStatus(isReal ? "Sent via Gmail" : "Sent (mock)");
      } else {
        setSendStatus(`Error: ${data.error}`);
      }
    } catch {
      setSendStatus("Network error — could not send");
    } finally {
      setLoading(false);
    }
  };

  const time = new Date(message.timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <ProviderIcon provider={message.provider} />
          <span className="font-medium text-gray-900">{message.sender}</span>
          <RiskBadge level={message.riskLevel} />
        </div>
        {message.subject && <h2 className="text-lg font-semibold text-gray-900 mt-1">{message.subject}</h2>}
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          {message.content && message.content !== "(No content)" ? (
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No text content available for this message.</p>
          )}
        </div>

        {/* Reply section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Generating..." : "Generate Replies"}
            </button>
            {generateError && (
              <span className="text-sm text-red-500">{generateError}</span>
            )}
          </div>

          {candidates.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-700">Reply Candidates</p>
                {replySource && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    replySource === "openai" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {replySource === "openai" ? "AI generated" : "mock fallback"}
                  </span>
                )}
              </div>
              {candidates.map((c) => (
                <ReplyCandidateCard
                  key={c.id}
                  candidate={c}
                  isSelected={selectedCandidate === c.id}
                  onSelect={() => handleSelectCandidate(c)}
                />
              ))}
            </div>
          )}

          {(candidates.length > 0 || replyText) && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Edit & Send</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                placeholder="Edit your reply before sending..."
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={loading || !replyText.trim()}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Send Reply
                </button>
                {sendStatus && (
                  <span
                    className={`text-sm ${sendStatus.startsWith("Sent") ? "text-green-600" : "text-red-600"}`}
                  >
                    {sendStatus}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
