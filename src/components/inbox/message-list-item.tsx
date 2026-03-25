import type { MessageItem } from "@/lib/types";
import { RiskBadge } from "@/components/shared/status-badge";
import { ProviderIcon } from "@/components/shared/provider-icon";

interface Props {
  message: MessageItem;
  isSelected: boolean;
  onClick: () => void;
}

export function MessageListItem({ message, isSelected, onClick }: Props) {
  const time = new Date(message.timestamp);
  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-gray-100 transition-colors ${
        isSelected ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-gray-50"
      } ${message.status === "unread" ? "font-medium" : ""}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <ProviderIcon provider={message.provider} />
        <span className="text-sm text-gray-900 truncate flex-1">{message.sender}</span>
        <span className="text-xs text-gray-400 shrink-0">{timeStr}</span>
      </div>
      {message.subject && (
        <p className="text-sm text-gray-800 truncate mb-0.5">{message.subject}</p>
      )}
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-500 truncate flex-1">{message.snippet}</p>
        <RiskBadge level={message.riskLevel} />
      </div>
    </button>
  );
}
