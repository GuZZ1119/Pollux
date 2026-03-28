import { NextResponse } from "next/server";
import { generateReplies } from "@/lib/services/reply-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageId, content, sender, subject, provider } = body;

    if (!messageId || !content) {
      return NextResponse.json(
        { success: false, error: "messageId and content are required" },
        { status: 400 }
      );
    }

    const { candidates, source } = await generateReplies({
      content,
      sender: sender ?? "Unknown",
      subject,
      provider: provider ?? "gmail",
    });

    return NextResponse.json({ success: true, data: candidates, source });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
