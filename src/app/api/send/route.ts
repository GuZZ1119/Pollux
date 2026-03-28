import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { sendReply } from "@/lib/services/send-service";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? undefined;

    const body = await request.json();
    const { messageId, replyText, provider, threadId, sender, subject } = body;

    if (!messageId || !replyText) {
      return NextResponse.json(
        { success: false, error: "messageId and replyText are required" },
        { status: 400 }
      );
    }

    const result = await sendReply({
      messageId,
      replyText,
      provider: provider ?? "gmail",
      threadId,
      sender,
      subject,
      userId,
    });

    return NextResponse.json({ success: result.success, data: result, error: result.error });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
