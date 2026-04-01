import type { SendResult } from "@/lib/adapters/send";
import { MockSlackSendAdapter } from "@/lib/adapters/send";
import { GmailSendAdapter } from "@/lib/adapters/gmail-send";
import { SlackSendAdapter } from "@/lib/adapters/slack-send";
import { hasGmailConnection, ensureTokensLoaded } from "@/lib/gmail/token-store";
import { hasSlackConnection, ensureSlackTokensLoaded } from "@/lib/slack/token-store";
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
  slackChannelId?: string;
}

export type SendChannel = "gmail_api" | "slack_api" | "mock" | "gmail_api_error" | "slack_api_error";

export interface SendReplyResult extends SendResult {
  provider: Provider;
  sendChannel: SendChannel;
}

export async function sendReply(input: SendInput): Promise<SendReplyResult> {
  const { provider, replyText, threadId, sender, subject, userId } = input;

  if (userId) {
    await ensureTokensLoaded();
    await ensureSlackTokensLoaded();
  }

  console.log(
    `[send-service] provider=${provider}, userId="${userId}", messageId=${input.messageId}`,
  );

  let result: SendReplyResult;

  // ---- Gmail path ----
  if (provider === "gmail" && userId && hasGmailConnection(userId)) {
    try {
      const adapter = new GmailSendAdapter(userId);
      const rawMessageId = stripGmailPrefix(input.messageId);
      const recipientEmail = extractEmail(sender ?? "");
      const sendResult = await adapter.send(recipientEmail, replyText, threadId, subject, rawMessageId);
      console.log(`[send-service] Gmail send SUCCESS: externalId=${sendResult.externalMessageId}`);
      result = { ...sendResult, provider: "gmail", sendChannel: "gmail_api" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gmail send failed";
      console.error("[send-service] Gmail send ERROR:", e);
      result = { success: false, error: msg, provider: "gmail", sendChannel: "gmail_api_error" };
    }
  }
  // ---- Slack path ----
  else if (provider === "slack" && userId && hasSlackConnection(userId)) {
    try {
      const adapter = new SlackSendAdapter(userId);
      const channelId = input.slackChannelId ?? parseSlackChannel(input.messageId);
      const threadTs = parseSlackThreadTs(threadId);
      const sendResult = await adapter.send(channelId, replyText, threadTs);
      console.log(`[send-service] Slack send SUCCESS: externalId=${sendResult.externalMessageId}`);
      result = { ...sendResult, provider: "slack", sendChannel: "slack_api" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Slack send failed";
      console.error("[send-service] Slack send ERROR:", e);
      result = { success: false, error: msg, provider: "slack", sendChannel: "slack_api_error" };
    }
  }
  // ---- Fallback mock ----
  else {
    if (provider === "gmail") {
      console.warn("[send-service] Gmail requested but falling back to mock");
    } else if (provider === "slack") {
      console.warn("[send-service] Slack requested but falling back to mock");
    }
    const adapter = new MockSlackSendAdapter();
    const recipientEmail = extractEmail(sender ?? "");
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

function parseSlackChannel(messageId: string): string {
  const stripped = messageId.startsWith("slack-") ? messageId.slice(6) : messageId;
  const idx = stripped.indexOf("-");
  return idx > 0 ? stripped.slice(0, idx) : stripped;
}

function parseSlackThreadTs(threadId?: string): string | undefined {
  if (!threadId) return undefined;
  const idx = threadId.indexOf("-");
  return idx > 0 ? threadId.slice(idx + 1) : threadId;
}

function extractEmail(sender: string): string {
  const match = sender.match(/<([^>]+)>/);
  if (match) return match[1];
  if (sender.includes("@")) return sender.trim();
  return "unknown@example.com";
}
