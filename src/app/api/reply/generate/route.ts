import { NextResponse } from "next/server";
import { generateReplies } from "@/lib/services/reply-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ success: false, error: "messageId is required" }, { status: 400 });
    }

    const candidates = await generateReplies(messageId);
    return NextResponse.json({ success: true, data: candidates });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
