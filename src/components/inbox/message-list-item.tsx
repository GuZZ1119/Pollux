import type { MessageItem, RiskLevel } from "@/lib/types";

interface Props {
  message: MessageItem;
  isSelected: boolean;
  isViewed: boolean;
  onClick: () => void;
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractName(sender: string): string {
  const match = sender.match(/^([^<]+)</);
  if (match) return match[1].trim();
  return sender.split("@")[0];
}

const riskIndicator: Record<RiskLevel, string> = {
  LOW: "",
  MEDIUM: "bg-caution",
  HIGH: "bg-danger",
};

export function MessageListItem({ message, isSelected, isViewed, onClick }: Props) {
  const time = new Date(message.timestamp);
  const isGmailUnread = message.status === "unread";
  const isNew = isGmailUnread && !isViewed;
  const name = extractName(message.sender);
  const isGmail = message.provider === "gmail";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 mx-1 my-0.5 rounded-lg transition-all ${
        isSelected
          ? "bg-accent-subtle"
          : "hover:bg-subtle"
      }`}
      style={{ width: "calc(100% - 8px)" }}
    >
      <div className="flex items-start gap-2.5">
        {/* Status dot */}
        <div className="pt-1.5 w-2 shrink-0">
          {isNew ? (
            <div className="w-[7px] h-[7px] rounded-full bg-accent" title="New" />
          ) : isGmailUnread ? (
            <div className="w-[7px] h-[7px] rounded-full border-[1.5px] border-accent-muted" title="Unread in Gmail" />
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          {/* Sender + time */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[13px] truncate flex-1 ${
              isNew ? "font-semibold text-ink" : isViewed ? "text-ink-secondary" : "text-ink"
            }`}>
              {name}
            </span>
            <span className="text-[11px] text-ink-faint shrink-0 tabular-nums">
              {relativeTime(time)}
            </span>
          </div>

          {/* Subject */}
          {message.subject && (
            <p className={`text-[12px] truncate mb-0.5 ${
              isNew ? "font-medium text-ink" : isViewed ? "text-ink-tertiary" : "text-ink-secondary"
            }`}>
              {message.subject}
            </p>
          )}

          {/* Snippet + metadata */}
          <div className="flex items-center gap-1.5">
            <p className={`text-[11px] truncate flex-1 ${isViewed ? "text-ink-faint" : "text-ink-tertiary"}`}>
              {message.snippet}
            </p>
            {message.riskLevel !== "LOW" && (
              <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${riskIndicator[message.riskLevel]}`}
                title={`${message.riskLevel} risk`} />
            )}
            <span className={`text-[10px] px-1 py-px rounded font-medium shrink-0 ${
              isGmail ? "bg-danger-subtle text-danger/70" : "bg-accent-subtle text-accent/70"
            }`}>
              {isGmail ? "Gmail" : "Slack"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
