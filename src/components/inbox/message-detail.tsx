"use client";

import { useState, useEffect } from "react";
import type { MessageItem, ReplyCandidate } from "@/lib/types";
import { RiskBadge } from "@/components/shared/status-badge";
import { ProviderIcon } from "@/components/shared/provider-icon";
import { ReplyCandidateCard } from "@/components/reply/reply-candidate-card";

interface Props {
  message: MessageItem;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageDetail({ message }: Props) {
  const [candidates, setCandidates] = useState<ReplyCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [replySource, setReplySource] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null);

  useEffect(() => {
    setCandidates([]);
    setSelectedCandidate(null);
    setReplyText("");
    setSendStatus(null);
    setGenerateError(null);
    setReplySource(null);

    if (message.htmlContent) {
      import("dompurify").then((mod) => {
        const DOMPurify = mod.default;
        setSanitizedHtml(
          DOMPurify.sanitize(message.htmlContent!, {
            ALLOWED_TAGS: [
              "p", "br", "strong", "em", "b", "i", "u", "a",
              "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
              "blockquote", "pre", "code", "table", "thead", "tbody",
              "tr", "td", "th", "img", "span", "div", "hr", "sup", "sub",
            ],
            ALLOWED_ATTR: [
              "href", "target", "rel", "src", "alt", "width", "height",
              "style", "class", "colspan", "rowspan",
            ],
            ALLOW_DATA_ATTR: false,
            ADD_ATTR: ["target"],
          }),
        );
      });
    } else {
      setSanitizedHtml(null);
    }
  }, [message]);

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
        const channel = data.data?.sendChannel;
        if (channel === "gmail_api") {
          setSendStatus("Sent via Gmail");
        } else if (channel === "mock") {
          setSendStatus(
            "Sent (mock — not delivered). Gmail tokens may have expired; try reconnecting in Settings.",
          );
        } else {
          setSendStatus("Sent");
        }
      } else {
        const channel = data.data?.sendChannel;
        if (channel === "gmail_api_error") {
          setSendStatus(`Gmail send failed: ${data.error}`);
        } else {
          setSendStatus(`Send failed: ${data.error}`);
        }
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
        {message.subject && (
          <h2 className="text-lg font-semibold text-gray-900 mt-1">
            {message.subject}
          </h2>
        )}
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          {sanitizedHtml ? (
            <div
              className="prose prose-sm max-w-none text-gray-800 [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:rounded"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : message.content && message.content !== "(No content)" ? (
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No text content available for this message.
            </p>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-4 border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Attachments ({message.attachments.length})
            </p>
            <div className="space-y-1.5">
              {message.attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded px-3 py-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span className="truncate flex-1">{att.filename}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {att.mimeType.split("/").pop()} ·{" "}
                    {formatFileSize(att.size)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">
              Attachment download coming soon
            </p>
          </div>
        )}

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
                <p className="text-sm font-medium text-gray-700">
                  Reply Candidates
                </p>
                {replySource && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      replySource === "openai"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
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
                    className={`text-sm ${
                      sendStatus === "Sent via Gmail"
                        ? "text-green-600"
                        : sendStatus.startsWith("Sent (mock")
                          ? "text-yellow-600"
                          : sendStatus.startsWith("Sent")
                            ? "text-green-600"
                            : "text-red-600"
                    }`}
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
