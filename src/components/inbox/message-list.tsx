import type { MessageItem } from "@/lib/types";
import { MessageListItem } from "./message-list-item";

interface Props {
  messages: MessageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MessageList({ messages, selectedId, onSelect }: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No messages
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {messages.map((msg) => (
        <MessageListItem
          key={msg.id}
          message={msg}
          isSelected={selectedId === msg.id}
          onClick={() => onSelect(msg.id)}
        />
      ))}
    </div>
  );
}
