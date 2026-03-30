import type { MessageItem } from "@/lib/types";
import type { RiskLevel } from "@/lib/types";

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

const riskDot: Record<RiskLevel, string> = {
  LOW: "",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-red-500",
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
      className={`w-full text-left px-4 py-3 transition-all border-l-[3px] ${
        isSelected
          ? "bg-blue-50/80 border-l-blue-600"
          : "border-l-transparent hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator column */}
        <div className="pt-1.5 w-2 shrink-0">
          {isNew ? (
            <div className="w-2 h-2 rounded-full bg-blue-500" title="New — unread in Gmail, not yet opened in Pollux" />
          ) : isGmailUnread ? (
            <div className="w-2 h-2 rounded-full border border-blue-300" title="Unread in Gmail, opened in Pollux" />
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: Sender + time */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm truncate flex-1 ${isNew ? "font-semibold text-gray-900" : isViewed ? "text-gray-500" : "text-gray-700"}`}>
              {name}
            </span>
            <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
              {relativeTime(time)}
            </span>
          </div>

          {/* Row 2: Subject */}
          {message.subject && (
            <p className={`text-[13px] truncate mb-0.5 ${isNew ? "font-medium text-gray-800" : isViewed ? "text-gray-500" : "text-gray-600"}`}>
              {message.subject}
            </p>
          )}

          {/* Row 3: Snippet + badges */}
          <div className="flex items-center gap-1.5">
            <p className={`text-xs truncate flex-1 ${isViewed ? "text-gray-300" : "text-gray-400"}`}>{message.snippet}</p>
            {message.riskLevel !== "LOW" && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${riskDot[message.riskLevel]}`} title={`${message.riskLevel} risk`} />
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
              isGmail ? "bg-red-50 text-red-500" : "bg-purple-50 text-purple-500"
            }`}>
              {isGmail ? "Gmail" : "Slack"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
