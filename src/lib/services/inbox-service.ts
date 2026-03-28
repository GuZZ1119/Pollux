import type { MessageItem } from "@/lib/types";
import { MockSlackInboxAdapter, type InboxAdapter } from "@/lib/adapters/inbox";
import { GmailInboxAdapter } from "@/lib/adapters/gmail-inbox";
import { hasGmailConnection } from "@/lib/gmail/token-store";

export async function getAggregatedInbox(userId?: string): Promise<MessageItem[]> {
  const adapters: InboxAdapter[] = [];

  if (userId && hasGmailConnection(userId)) {
    adapters.push(new GmailInboxAdapter(userId));
  }

  // Slack: still mock for Phase 2
  adapters.push(new MockSlackInboxAdapter());

  const settled = await Promise.allSettled(adapters.map((a) => a.fetchMessages()));

  const all: MessageItem[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      all.push(...result.value);
    } else {
      console.error("[inbox-service] Adapter failed:", result.reason);
    }
  }

  return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
