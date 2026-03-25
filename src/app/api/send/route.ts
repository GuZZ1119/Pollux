import { NextResponse } from "next/server";
import { sendReply } from "@/lib/services/send-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageId, replyText } = body;

    if (!messageId || !replyText) {
      return NextResponse.json(
        { success: false, error: "messageId and replyText are required" },
        { status: 400 }
      );
    }

    const result = await sendReply(messageId, replyText);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
