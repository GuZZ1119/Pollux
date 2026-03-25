import type { MessageItem } from "@/lib/types";
import { MockGmailInboxAdapter, MockSlackInboxAdapter, type InboxAdapter } from "@/lib/adapters/inbox";

const adapters: InboxAdapter[] = [
  new MockGmailInboxAdapter(),
  new MockSlackInboxAdapter(),
  // TODO: Add real adapters here when providers are connected
];

export async function getAggregatedInbox(): Promise<MessageItem[]> {
  const results = await Promise.all(adapters.map((a) => a.fetchMessages()));
  const all = results.flat();
  return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
