"use client";

import { useState, useEffect } from "react";
import type { MessageItem, ReplyCandidate } from "@/lib/types";
import { RiskBadge } from "@/components/shared/status-badge";
import { ReplyCandidateCard } from "@/components/reply/reply-candidate-card";

interface Props {
  message: MessageItem;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractName(sender: string): string {
  const match = sender.match(/^([^<]+)</);
  if (match) return match[1].trim();
  return sender.split("@")[0];
}

export function MessageDetail({ message }: Props) {
  const [candidates, setCandidates] = useState<ReplyCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
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
      setGenerateError("Could not reach the server");
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
      const ch = data.data?.sendChannel ?? null;
      if (data.success) {
        if (ch === "gmail_api") {
          setSendStatus("sent_gmail");
        } else if (ch === "slack_api") {
          setSendStatus("sent_slack");
        } else if (ch === "mock") {
          setSendStatus("sent_mock");
        } else {
          setSendStatus("sent_unknown");
        }
      } else {
        setSendStatus("error");
        setGenerateError(data.error ?? "Send failed");
      }
    } catch {
      setSendStatus("error");
      setGenerateError("Could not send");
    } finally {
      setLoading(false);
    }
  };

  const time = new Date(message.timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const senderName = extractName(message.sender);
  const isGmail = message.provider === "gmail";
  const isSent = sendStatus?.startsWith("sent_");

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="px-7 py-5 border-b border-border-light">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            {message.subject && (
              <h2 className="text-[15px] font-semibold text-ink leading-snug mb-1.5">
                {message.subject}
              </h2>
            )}
            <div className="flex items-center gap-2 flex-wrap text-[12px]">
              <span className="font-medium text-ink-secondary">{senderName}</span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-tertiary">{time}</span>
              <span className="text-ink-faint">·</span>
              <span className={`px-1.5 py-px rounded font-medium ${
                isGmail ? "bg-danger-subtle text-danger/70" : "bg-accent-subtle text-accent/70"
              }`}>
                {isGmail ? "Gmail" : "Slack"}
              </span>
            </div>
          </div>
          <RiskBadge level={message.riskLevel} />
        </div>
        {message.sender.includes("<") && (
          <p className="text-[11px] text-ink-faint truncate">{message.sender}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-7 py-6 space-y-6">
          {/* Email body */}
          <div className="border border-border-light rounded-xl bg-page p-6">
            {sanitizedHtml ? (
              <div
                className="prose prose-sm max-w-none text-ink-secondary leading-relaxed [&_a]:text-accent [&_a]:underline [&_img]:max-w-full [&_img]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-ink-tertiary"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            ) : message.content && message.content !== "(No content)" ? (
              <p className="text-[13px] text-ink-secondary whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            ) : (
              <p className="text-[13px] text-ink-faint italic">
                No content available for this message.
              </p>
            )}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase mb-2">
                Attachments
              </p>
              <div className="grid gap-1.5">
                {message.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border border-border-light rounded-lg px-3 py-2.5 bg-surface hover:border-border transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-ink-secondary truncate">{att.filename}</p>
                      <p className="text-[11px] text-ink-faint">{formatFileSize(att.size)}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-ink-faint bg-subtle px-1.5 py-0.5 rounded shrink-0">
                      {att.mimeType.split("/").pop()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reply divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-light" /></div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 flex items-center gap-1.5 text-[11px] font-medium text-ink-tertiary tracking-wide uppercase">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                AI Reply
              </span>
            </div>
          </div>

          {/* Generate */}
          {candidates.length === 0 && !isSent && (
            <div className="text-center py-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-[13px] font-medium rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Generate reply
                  </>
                )}
              </button>
              {generateError && !isSent && (
                <p className="text-[12px] text-danger mt-2">{generateError}</p>
              )}
            </div>
          )}

          {/* Candidates */}
          {candidates.length > 0 && !isSent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase">
                  Suggestions
                </p>
                {replySource && (
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium ${
                    replySource === "openai"
                      ? "bg-positive-subtle text-positive"
                      : "bg-subtle text-ink-tertiary"
                  }`}>
                    {replySource === "openai" ? "AI" : "Fallback"}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {candidates.map((c, idx) => (
                  <ReplyCandidateCard
                    key={c.id}
                    candidate={c}
                    index={idx + 1}
                    isSelected={selectedCandidate === c.id}
                    onSelect={() => handleSelectCandidate(c)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          {(candidates.length > 0 || replyText) && !isSent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase">
                  Compose
                </p>
                <span className="text-[11px] text-ink-faint">To: {senderName}</span>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full border border-border rounded-lg p-4 text-[13px] leading-relaxed text-ink focus:border-accent focus:shadow-focus outline-none resize-y bg-surface placeholder:text-ink-faint"
                placeholder="Edit your reply before sending…"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSend}
                  disabled={loading || !replyText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-positive text-white text-[13px] font-medium rounded-lg hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      Send
                    </>
                  )}
                </button>
                {generateError && (
                  <span className="text-[11px] text-danger">{generateError}</span>
                )}
              </div>
            </div>
          )}

          {/* Send result */}
          {isSent && (
            <div className={`rounded-xl border p-5 text-center ${
              sendStatus === "sent_gmail" || sendStatus === "sent_slack"
                ? "border-positive/20 bg-positive-subtle"
                : sendStatus === "sent_mock"
                  ? "border-caution/20 bg-caution-subtle"
                  : "border-border bg-subtle"
            }`}>
              {(sendStatus === "sent_gmail" || sendStatus === "sent_slack") && (
                <>
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-positive/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-positive">
                    Sent via {sendStatus === "sent_gmail" ? "Gmail" : "Slack"}
                  </p>
                  <p className="text-[12px] text-positive/70 mt-0.5">Delivered to {senderName}</p>
                </>
              )}
              {sendStatus === "sent_mock" && (
                <>
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-caution/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-caution" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-caution">Sent via mock (not delivered)</p>
                  <p className="text-[12px] text-caution/70 mt-0.5">Connection may have expired</p>
                  <a href="/settings" className="inline-block text-[12px] text-caution font-medium mt-2 hover:underline">
                    Reconnect in Settings
                  </a>
                </>
              )}
              {sendStatus === "sent_unknown" && (
                <p className="text-[13px] text-ink-secondary">Reply sent</p>
              )}
            </div>
          )}

          {sendStatus === "error" && (
            <div className="rounded-xl border border-danger/20 bg-danger-subtle p-4 text-center">
              <p className="text-[13px] font-medium text-danger">Send failed</p>
              <p className="text-[12px] text-danger/70 mt-0.5">{generateError}</p>
              <button
                onClick={handleSend}
                className="mt-3 text-[12px] font-medium text-danger hover:underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
