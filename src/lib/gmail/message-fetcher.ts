import { createGmailClient } from "./client";
import { getHeader, extractTextBody } from "./parse";

export interface FetchedMessage {
  id: string;
  threadId: string;
  sender: string;
  subject?: string;
  content: string;
  provider: "gmail";
}

/**
 * Fetch a single Gmail message by ID (strips `gmail-` prefix automatically).
 * Used by reply/generate and send routes for backend-authoritative data.
 */
export async function fetchMessageById(
  userId: string,
  messageId: string,
): Promise<FetchedMessage> {
  const rawId = messageId.startsWith("gmail-") ? messageId.slice(6) : messageId;
  const gmail = createGmailClient(userId);

  const res = await gmail.users.messages.get({
    userId: "me",
    id: rawId,
    format: "full",
  });

  const msg = res.data;
  const headers = msg.payload?.headers;

  return {
    id: rawId,
    threadId: msg.threadId ?? "",
    sender: getHeader(headers, "From"),
    subject: getHeader(headers, "Subject") || undefined,
    content: extractTextBody(msg.payload ?? undefined) || msg.snippet || "(No content)",
    provider: "gmail",
  };
}
