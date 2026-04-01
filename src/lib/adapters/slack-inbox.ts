import type { MessageItem, InboxFetchOptions } from "@/lib/types";
import type { InboxAdapter } from "./inbox";
import { createSlackClient } from "@/lib/slack/client";
import { getSlackTokens } from "@/lib/slack/token-store";
import { classifyRisk } from "@/lib/services/risk-service";

export class SlackInboxAdapter implements InboxAdapter {
  constructor(private userId: string) {}

  async fetchMessages(options?: InboxFetchOptions): Promise<MessageItem[]> {
    const client = createSlackClient(this.userId);
    const tokens = getSlackTokens(this.userId);
    const botUserId = tokens?.botUserId;
    const limit = options?.limit ?? 30;

    const convResult = await client.conversations.list({
      types: "public_channel,im",
      limit: 15,
      exclude_archived: true,
    });

    const channels = (convResult.channels ?? []).filter((c) => c.is_member || c.is_im);
    if (channels.length === 0) return [];

    const userCache = new Map<string, string>();
    const resolveUser = async (uid: string): Promise<string> => {
      if (!uid) return "Unknown";
      if (userCache.has(uid)) return userCache.get(uid)!;
      try {
        const info = await client.users.info({ user: uid });
        const name = info.user?.real_name || info.user?.name || uid;
        userCache.set(uid, name);
        return name;
      } catch {
        userCache.set(uid, uid);
        return uid;
      }
    };

    const allMessages: MessageItem[] = [];
    const perChannel = Math.max(2, Math.ceil(limit / channels.length));

    const settled = await Promise.allSettled(
      channels.slice(0, 10).map(async (ch) => {
        const channelId = ch.id!;
        const history = await client.conversations.history({
          channel: channelId,
          limit: perChannel,
        });

        const channelName = ch.is_im ? undefined : (ch.name ?? undefined);
        const items: MessageItem[] = [];

        for (const msg of history.messages ?? []) {
          if (msg.subtype && msg.subtype !== "bot_message") continue;
          if (msg.user === botUserId) continue;

          const sender = await resolveUser(msg.user ?? "");
          const text = msg.text ?? "";
          const ts = msg.ts ?? "0";

          const riskLevel = classifyRisk({
            sender,
            subject: channelName,
            content: text,
            provider: "slack",
          });

          items.push({
            id: `slack-${channelId}-${ts}`,
            provider: "slack",
            threadId: `${channelId}-${msg.thread_ts ?? ts}`,
            sender,
            subject: channelName ? `#${channelName}` : undefined,
            snippet: text.slice(0, 120),
            content: text,
            timestamp: new Date(parseFloat(ts) * 1000).toISOString(),
            riskLevel,
            status: "read",
          });
        }
        return items;
      }),
    );

    for (const r of settled) {
      if (r.status === "fulfilled") allMessages.push(...r.value);
    }

    return allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}
