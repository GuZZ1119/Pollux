import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { generateReplies } from "@/lib/services/reply-service";
import { logEvent } from "@/lib/services/event-log";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? "anonymous";

    const body = await request.json();
    const { messageId, content, sender, subject, provider } = body;

    if (!messageId || !content) {
      return NextResponse.json(
        { success: false, error: "messageId and content are required" },
        { status: 400 },
      );
    }

    const { candidates, source } = await generateReplies(
      { content, sender: sender ?? "Unknown", subject, provider: provider ?? "gmail" },
      userId,
    );

    logEvent({
      eventType: "reply_generated",
      userId,
      provider: provider ?? "gmail",
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
