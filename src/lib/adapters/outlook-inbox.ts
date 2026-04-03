import type { MessageItem, InboxFetchOptions } from "@/lib/types";
import type { InboxAdapter } from "./inbox";
import { classifyRisk } from "@/lib/services/risk-service";
import { INBOX_MAX_RESULTS } from "@/lib/config";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

interface GraphMessage {
  id: string;
  conversationId?: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  subject?: string;
  bodyPreview?: string;
  body?: { contentType?: string; content?: string };
  receivedDateTime?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
}

/**
 * OutlookInboxAdapter — reads Outlook mail via Microsoft Graph.
 *
 * The Microsoft access token is provided by the caller (retrieved from
 * Auth0 Token Vault). This adapter is a pure Graph API consumer with
 * no Auth0 dependency.
 */
export class OutlookInboxAdapter implements InboxAdapter {
  constructor(private msToken: string) {}

  async fetchMessages(options?: InboxFetchOptions): Promise<MessageItem[]> {
    const limit = Math.min(options?.limit ?? INBOX_MAX_RESULTS, 50);

    const res = await fetch(
      `${GRAPH_BASE}/me/mailFolders/inbox/messages?` +
        `$top=${limit}&$orderby=receivedDateTime desc` +
        `&$select=id,conversationId,from,subject,bodyPreview,body,receivedDateTime,isRead,hasAttachments`,
      {
        headers: {
          Authorization: `Bearer ${this.msToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`[outlook-adapter] Graph API error: ${res.status} ${text}`);
      return [];
    }

    const data = await res.json();
    const messages: GraphMessage[] = data.value ?? [];

    return messages.map((msg) => {
      const fromName = msg.from?.emailAddress?.name ?? "";
      const fromAddr = msg.from?.emailAddress?.address ?? "";
      const sender = fromName ? `${fromName} <${fromAddr}>` : fromAddr;
      const subject = msg.subject ?? undefined;
      const snippet = msg.bodyPreview ?? "";
      const content =
        msg.body?.contentType === "text"
          ? msg.body.content ?? snippet
          : snippet;
      const htmlContent =
        msg.body?.contentType === "html" ? msg.body.content ?? undefined : undefined;

      const riskLevel = classifyRisk({
        sender,
        subject,
        content: content || snippet,
        provider: "outlook",
      });

      return {
        id: `outlook-${msg.id}`,
        provider: "outlook" as const,
        threadId: msg.conversationId ?? msg.id ?? "",
        sender,
        subject,
        snippet,
        content: content || "(No content)",
        htmlContent,
        timestamp: msg.receivedDateTime
          ? new Date(msg.receivedDateTime).toISOString()
          : new Date().toISOString(),
        riskLevel,
        status: msg.isRead ? "read" : "unread",
      };
    });
  }
}
