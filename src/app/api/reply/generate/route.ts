import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { generateReplies } from "@/lib/services/reply-service";
import { logEvent } from "@/lib/services/event-log";
import { ensureTokensLoaded, hasGmailConnection } from "@/lib/gmail/token-store";
import { ensureSlackTokensLoaded, hasSlackConnection } from "@/lib/slack/token-store";
import { fetchMessageById } from "@/lib/gmail/message-fetcher";
import { fetchSlackMessageById } from "@/lib/slack/message-fetcher";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? "anonymous";

    const body = await request.json();
    const {
      messageId,
      content: fallbackContent,
      sender: fallbackSender,
      subject: fallbackSubject,
      provider: fallbackProvider,
    } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: "messageId is required" },
        { status: 400 },
      );
    }

    let content = fallbackContent;
    let sender = fallbackSender ?? "Unknown";
    let subject = fallbackSubject;
    let provider = fallbackProvider ?? "gmail";

    if (userId !== "anonymous" && messageId.startsWith("gmail-")) {
      await ensureTokensLoaded();
      if (hasGmailConnection(userId)) {
        try {
          const msg = await fetchMessageById(userId, messageId);
          content = msg.content;
          sender = msg.sender;
          subject = msg.subject;
          provider = msg.provider;
        } catch (e) {
          console.warn("[reply/generate] Gmail backend fetch failed, using frontend data:", e);
        }
      }
    } else if (userId !== "anonymous" && messageId.startsWith("slack-")) {
      await ensureSlackTokensLoaded();
      if (hasSlackConnection(userId)) {
        try {
          const msg = await fetchSlackMessageById(userId, messageId);
          content = msg.content;
          sender = msg.sender;
          subject = msg.subject;
          provider = msg.provider;
        } catch (e) {
          console.warn("[reply/generate] Slack backend fetch failed, using frontend data:", e);
        }
      }
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No message content available" },
        { status: 400 },
      );
    }

    const { candidates, source } = await generateReplies(
      { content, sender, subject, provider },
      userId,
    );

    logEvent({
      eventType: "reply_generated",
      userId,
      provider,
      messageId,
      metadata: { source, candidateCount: candidates.length },
    });

    return NextResponse.json({ success: true, data: candidates, source });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
