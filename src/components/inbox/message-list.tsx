import type { MessageItem } from "@/lib/types";
import { MessageListItem } from "./message-list-item";

interface Props {
  messages: MessageItem[];
  selectedId: string | null;
  viewedIds: Set<string>;
  onSelect: (id: string) => void;
}

export function MessageList({ messages, selectedId, viewedIds, onSelect }: Props) {
  return (
    <div className="py-1">
      {messages.map((msg) => (
        <MessageListItem
          key={msg.id}
          message={msg}
          isSelected={selectedId === msg.id}
          isViewed={viewedIds.has(msg.id)}
          onClick={() => onSelect(msg.id)}
        />
      ))}
    </div>
  );
}
