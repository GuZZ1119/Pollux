import type { MessageItem } from "@/lib/types";
import type { InboxAdapter } from "./inbox";
import { createGmailClient } from "@/lib/gmail/client";
import { getHeader, extractTextBody } from "@/lib/gmail/parse";

const MAX_RESULTS = 20;

export class GmailInboxAdapter implements InboxAdapter {
  constructor(private userId: string) {}

  async fetchMessages(): Promise<MessageItem[]> {
    const gmail = createGmailClient(this.userId);

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: MAX_RESULTS,
      labelIds: ["INBOX"],
    });

    const messageIds = listRes.data.messages ?? [];
    if (messageIds.length === 0) return [];

    const details = await Promise.all(
      messageIds.map((m) =>
        gmail.users.messages.get({
          userId: "me",
          id: m.id!,
          format: "full",
        })
      )
    );

    return details.map((res) => {
      const msg = res.data;
      const headers = msg.payload?.headers;
      const from = getHeader(headers, "From");
      const subject = getHeader(headers, "Subject");
      const date = getHeader(headers, "Date");
      const body = extractTextBody(msg.payload ?? undefined);
      const isUnread = msg.labelIds?.includes("UNREAD") ?? false;

      return {
        id: `gmail-${msg.id}`,
        provider: "gmail" as const,
        threadId: msg.threadId ?? "",
        sender: from,
        subject: subject || undefined,
        snippet: msg.snippet ?? "",
        content: body || msg.snippet || "(No content)",
        timestamp: date ? new Date(date).toISOString() : new Date(Number(msg.internalDate)).toISOString(),
        riskLevel: "LOW" as const,
        status: isUnread ? "unread" : "read",
      };
    });
  }
}
