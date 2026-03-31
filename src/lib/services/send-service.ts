import type { SendResult } from "@/lib/adapters/send";
import { MockSlackSendAdapter } from "@/lib/adapters/send";
import { GmailSendAdapter } from "@/lib/adapters/gmail-send";
import { hasGmailConnection, getStoreDebugInfo, ensureTokensLoaded } from "@/lib/gmail/token-store";
import { prisma } from "@/lib/prisma";
import type { Provider } from "@/lib/types";

export interface SendInput {
  messageId: string;
  replyText: string;
  provider: Provider;
  threadId?: string;
  sender?: string;
  subject?: string;
  userId?: string;
  candidateText?: string;
  styleSource?: string;
  stylePersona?: string;
}

export type SendChannel = "gmail_api" | "mock" | "gmail_api_error";

export interface SendReplyResult extends SendResult {
  provider: Provider;
  sendChannel: SendChannel;
}

export async function sendReply(input: SendInput): Promise<SendReplyResult> {
  const { provider, replyText, threadId, sender, subject, userId } = input;
  const recipientEmail = extractEmail(sender ?? "");

  if (userId) await ensureTokensLoaded();

  const hasConnection = userId ? hasGmailConnection(userId) : false;
  const storeInfo = getStoreDebugInfo();

  console.log(
    `[send-service] provider=${provider}, userId="${userId}", ` +
    `hasGmailConnection=${hasConnection}, recipient=${recipientEmail}, ` +
    `storeSize=${storeInfo.size}`,
  );

  let result: SendReplyResult;

  if (provider === "gmail" && userId && hasConnection) {
    try {
      const adapter = new GmailSendAdapter(userId);
      const rawMessageId = stripGmailPrefix(input.messageId);
      const sendResult = await adapter.send(
        recipientEmail,
        replyText,
        threadId,
        subject,
        rawMessageId,
      );
      console.log(
        `[send-service] Gmail send SUCCESS: externalId=${sendResult.externalMessageId}`,
      );
      result = { ...sendResult, provider: "gmail", sendChannel: "gmail_api" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gmail send failed";
      console.error("[send-service] Gmail send ERROR:", e);
      result = {
        success: false,
        error: msg,
        provider: "gmail",
        sendChannel: "gmail_api_error",
      };
    }
  } else {
    if (provider === "gmail") {
      console.warn(
        `[send-service] Gmail requested but falling back to mock. ` +
        `hasGmailConnection=${hasConnection}`,
      );
    }
    const adapter = new MockSlackSendAdapter();
    const sendResult = await adapter.send(recipientEmail, replyText, threadId);
    result = { ...sendResult, provider, sendChannel: "mock" };
  }

  if (userId) {
    persistSendLog(input, result).catch((e) =>
      console.error("[send-service] SendLog persist failed:", e),
    );
  }

  return result;
}

async function persistSendLog(input: SendInput, result: SendReplyResult): Promise<void> {
  const wasEdited = input.candidateText
    ? input.candidateText.trim() !== input.replyText.trim()
    : false;

  await prisma.sendLog.create({
    data: {
      userId: input.userId!,
      provider: input.provider,
      sourceMessageId: input.messageId,
      sourceThreadId: input.threadId ?? null,
      sourceSender: input.sender ?? null,
      sourceSubject: input.subject ?? null,
      candidateText: input.candidateText ?? null,
      finalText: input.replyText,
      wasEdited,
      styleSource: input.styleSource ?? null,
      stylePersona: input.stylePersona ?? null,
      sendChannel: result.sendChannel,
      success: result.success,
      error: result.error ?? null,
    },
  });
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
