import type { SendResult } from "@/lib/adapters/send";
import { MockSlackSendAdapter } from "@/lib/adapters/send";
import { GmailSendAdapter } from "@/lib/adapters/gmail-send";
import { hasGmailConnection } from "@/lib/gmail/token-store";
import type { Provider } from "@/lib/types";

export interface SendInput {
  messageId: string;
  replyText: string;
  provider: Provider;
  threadId?: string;
  sender?: string;
  subject?: string;
  userId?: string;
}

export async function sendReply(input: SendInput): Promise<SendResult & { provider: Provider }> {
  const { provider, replyText, threadId, sender, subject, userId } = input;

  const recipientEmail = extractEmail(sender ?? "");

  if (provider === "gmail" && userId && hasGmailConnection(userId)) {
    try {
      const adapter = new GmailSendAdapter(userId);
      const result = await adapter.send(recipientEmail, replyText, threadId, subject, input.messageId);
      return { ...result, provider: "gmail" };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gmail send failed";
      console.error("[send-service] Gmail send error:", e);
      return { success: false, error: message, provider: "gmail" };
    }
  }

  // Slack or unconnected Gmail → mock
  const adapter = new MockSlackSendAdapter();
  const result = await adapter.send(recipientEmail, replyText, threadId);
  return { ...result, provider };
}

function extractEmail(sender: string): string {
  const match = sender.match(/<([^>]+)>/);
  if (match) return match[1];
  if (sender.includes("@")) return sender.trim();
  return "unknown@example.com";
}
