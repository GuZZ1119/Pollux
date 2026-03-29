import type { MessageItem, InboxFetchOptions } from "@/lib/types";
import type { InboxAdapter } from "./inbox";
import { createGmailClient } from "@/lib/gmail/client";
import {
  getHeader,
  extractTextBody,
  extractHtmlBody,
  extractAttachments,
} from "@/lib/gmail/parse";
import { classifyRisk } from "@/lib/services/risk-service";
import { INBOX_MAX_RESULTS } from "@/lib/config";

export class GmailInboxAdapter implements InboxAdapter {
  constructor(private userId: string) {}

  async fetchMessages(options?: InboxFetchOptions): Promise<MessageItem[]> {
    const gmail = createGmailClient(this.userId);
    const limit = options?.limit ?? INBOX_MAX_RESULTS;
    const filter = options?.filter ?? "primary";

    const q = filter === "primary" ? "category:primary" : undefined;

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      labelIds: ["INBOX"],
      ...(q ? { q } : {}),
    });

    const messageIds = listRes.data.messages ?? [];
    if (messageIds.length === 0) return [];

    const details = await Promise.all(
      messageIds.map((m) =>
        gmail.users.messages.get({
          userId: "me",
          id: m.id!,
          format: "full",
        }),
      ),
    );

    return details.map((res) => {
      const msg = res.data;
      const headers = msg.payload?.headers;
      const from = getHeader(headers, "From");
      const subject = getHeader(headers, "Subject");
      const date = getHeader(headers, "Date");
      const body = extractTextBody(msg.payload ?? undefined);
      const htmlBody = extractHtmlBody(msg.payload ?? undefined);
      const attachments = extractAttachments(msg.payload ?? undefined);
      const isUnread = msg.labelIds?.includes("UNREAD") ?? false;

      const riskLevel = classifyRisk({
        sender: from,
        subject: subject || undefined,
        content: body || msg.snippet || "",
        provider: "gmail",
      });

      return {
        id: `gmail-${msg.id}`,
        provider: "gmail" as const,
        threadId: msg.threadId ?? "",
        sender: from,
        subject: subject || undefined,
        snippet: msg.snippet ?? "",
        content: body || msg.snippet || "(No content)",
        htmlContent: htmlBody || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: date
          ? new Date(date).toISOString()
          : new Date(Number(msg.internalDate)).toISOString(),
        riskLevel,
        status: isUnread ? "unread" : "read",
      };
    });
  }
}
