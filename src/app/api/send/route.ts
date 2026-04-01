import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { sendReply } from "@/lib/services/send-service";
import { logEvent } from "@/lib/services/event-log";
import { ensureTokensLoaded, hasGmailConnection } from "@/lib/gmail/token-store";
import { ensureSlackTokensLoaded, hasSlackConnection } from "@/lib/slack/token-store";
import { fetchMessageById } from "@/lib/gmail/message-fetcher";
import { fetchSlackMessageById } from "@/lib/slack/message-fetcher";
import { getUserStyleProfile } from "@/lib/style/style-store";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? undefined;

    const body = await request.json();
    const {
      messageId,
      replyText,
      provider: fallbackProvider,
      threadId: fallbackThreadId,
      sender: fallbackSender,
      subject: fallbackSubject,
      candidateText,
    } = body;

    if (!messageId || !replyText) {
      return NextResponse.json(
        { success: false, error: "messageId and replyText are required" },
        { status: 400 },
      );
    }

    let provider = fallbackProvider ?? "gmail";
    let threadId = fallbackThreadId;
    let sender = fallbackSender;
    let subject = fallbackSubject;
    let slackChannelId: string | undefined;

    if (userId && messageId.startsWith("gmail-")) {
      await ensureTokensLoaded();
      if (hasGmailConnection(userId)) {
        try {
          const msg = await fetchMessageById(userId, messageId);
          provider = msg.provider;
          threadId = msg.threadId;
          sender = msg.sender;
          subject = msg.subject;
        } catch (e) {
          console.warn("[send] Gmail backend fetch failed, using frontend data:", e);
        }
      }
    } else if (userId && messageId.startsWith("slack-")) {
      await ensureSlackTokensLoaded();
      if (hasSlackConnection(userId)) {
        try {
          const msg = await fetchSlackMessageById(userId, messageId);
          provider = msg.provider;
          threadId = `${msg.channelId}-${msg.threadTs}`;
          sender = msg.sender;
          subject = msg.subject;
          slackChannelId = msg.channelId;
        } catch (e) {
          console.warn("[send] Slack backend fetch failed, using frontend data:", e);
        }
      }
    }

    const styleProfile = userId ? getUserStyleProfile(userId) : null;

    const result = await sendReply({
      messageId,
      replyText,
      provider,
      threadId,
      sender,
      subject,
      userId,
      candidateText,
      styleSource: styleProfile?.source,
      stylePersona: styleProfile?.styleCard.persona,
      slackChannelId,
    });

    logEvent({
      eventType: "reply_sent",
      userId: userId ?? "anonymous",
      provider: result.provider,
      messageId,
      threadId,
      metadata: {
        success: result.success,
        sendChannel: result.sendChannel,
        externalMessageId: result.externalMessageId,
        error: result.error,
      },
    });

    return NextResponse.json({
      success: result.success,
      data: {
        provider: result.provider,
        sendChannel: result.sendChannel,
        externalMessageId: result.externalMessageId,
      },
      error: result.error,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
