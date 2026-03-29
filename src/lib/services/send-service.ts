import type { SendResult } from "@/lib/adapters/send";
import { MockSlackSendAdapter } from "@/lib/adapters/send";
import { GmailSendAdapter } from "@/lib/adapters/gmail-send";
import { hasGmailConnection, getStoreDebugInfo } from "@/lib/gmail/token-store";
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

export type SendChannel = "gmail_api" | "mock" | "gmail_api_error";

export interface SendReplyResult extends SendResult {
  provider: Provider;
  sendChannel: SendChannel;
}

export async function sendReply(input: SendInput): Promise<SendReplyResult> {
  const { provider, replyText, threadId, sender, subject, userId } = input;
  const recipientEmail = extractEmail(sender ?? "");

  const hasUser = Boolean(userId);
  const hasConnection = userId ? hasGmailConnection(userId) : false;
  const storeInfo = getStoreDebugInfo();

  console.log(
    `[send-service] provider=${provider}, userId="${userId}", ` +
    `hasGmailConnection=${hasConnection}, recipient=${recipientEmail}, ` +
    `storeSize=${storeInfo.size}, storeKeys=${JSON.stringify(storeInfo.keys)}`,
  );

  if (provider === "gmail" && userId && hasConnection) {
    try {
      const adapter = new GmailSendAdapter(userId);
      const rawMessageId = stripGmailPrefix(input.messageId);
      const result = await adapter.send(
        recipientEmail,
        replyText,
        threadId,
        subject,
        rawMessageId,
      );
      console.log(
        `[send-service] Gmail send SUCCESS: externalId=${result.externalMessageId}`,
      );
      return { ...result, provider: "gmail", sendChannel: "gmail_api" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gmail send failed";
      console.error("[send-service] Gmail send ERROR:", e);
      return {
        success: false,
        error: msg,
        provider: "gmail",
        sendChannel: "gmail_api_error",
      };
    }
  }

  if (provider === "gmail") {
    console.warn(
      `[send-service] Gmail requested but falling back to mock. ` +
      `Reason: userId=${hasUser ? "OK" : "MISSING"}, ` +
      `hasGmailConnection=${hasConnection ? "OK" : "FALSE (token store may have been cleared by dev server restart)"}`,
    );
  }

  const adapter = new MockSlackSendAdapter();
  const result = await adapter.send(recipientEmail, replyText, threadId);
  return { ...result, provider, sendChannel: "mock" };
}

function stripGmailPrefix(messageId: string): string {
  return messageId.startsWith("gmail-") ? messageId.slice(6) : messageId;
}

function extractEmail(sender: string): string {
  const match = sender.match(/<([^>]+)>/);
  if (match) return match[1];
  if (sender.includes("@")) return sender.trim();
  return "unknown@example.com";
}
