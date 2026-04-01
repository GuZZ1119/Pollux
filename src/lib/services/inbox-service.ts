import type { MessageItem, InboxFetchOptions } from "@/lib/types";
import { type InboxAdapter } from "@/lib/adapters/inbox";
import { GmailInboxAdapter } from "@/lib/adapters/gmail-inbox";
import { SlackInboxAdapter } from "@/lib/adapters/slack-inbox";
import { hasGmailConnection, ensureTokensLoaded } from "@/lib/gmail/token-store";
import { hasSlackConnection, ensureSlackTokensLoaded } from "@/lib/slack/token-store";
import { INBOX_MAX_RESULTS } from "@/lib/config";
import { logEvent } from "@/lib/services/event-log";

export async function getAggregatedInbox(
  userId?: string,
  options?: InboxFetchOptions,
): Promise<MessageItem[]> {
  if (userId) {
    await ensureTokensLoaded();
    await ensureSlackTokensLoaded();
  }

  const adapters: InboxAdapter[] = [];

  if (userId && hasGmailConnection(userId)) {
    adapters.push(new GmailInboxAdapter(userId));
  }

  if (userId && hasSlackConnection(userId)) {
    adapters.push(new SlackInboxAdapter(userId));
  }

  const settled = await Promise.allSettled(
    adapters.map((a) => a.fetchMessages(options)),
  );

  const all: MessageItem[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      all.push(...result.value);
    } else {
      console.error("[inbox-service] Adapter failed:", result.reason);
    }
  }

  const sorted = all.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const limit = options?.limit ?? INBOX_MAX_RESULTS;
  const messages = sorted.slice(0, limit);

  if (userId) {
    const high = messages.filter((m) => m.riskLevel === "HIGH").length;
    const medium = messages.filter((m) => m.riskLevel === "MEDIUM").length;
    const low = messages.filter((m) => m.riskLevel === "LOW").length;

    logEvent({
      eventType: "inbox_fetched",
      userId,
      metadata: {
        messageCount: messages.length,
        filter: options?.filter ?? "primary",
        limit,
      },
    });

    logEvent({
      eventType: "risk_classified",
      userId,
      metadata: { total: messages.length, high, medium, low },
    });
  }

  return messages;
}
