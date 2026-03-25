"use client";

import { useEffect, useState } from "react";
import type { MessageItem, ApiResponse } from "@/lib/types";
import { MessageList } from "@/components/inbox/message-list";
import { MessageDetail } from "@/components/inbox/message-detail";

export default function InboxPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inbox")
      .then((r) => r.json())
      .then((data: ApiResponse<MessageItem[]>) => {
        if (data.success && data.data) {
          setMessages(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left panel — message list */}
      <div className="w-96 shrink-0 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
          <p className="text-xs text-gray-500">{messages.length} messages from Gmail & Slack</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      {/* Right panel — detail + reply */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a message to view details
          </div>
        )}
      </div>
    </div>
  );
}
