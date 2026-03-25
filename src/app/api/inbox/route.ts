import { NextResponse } from "next/server";
import { getAggregatedInbox } from "@/lib/services/inbox-service";

export async function GET() {
  try {
    const messages = await getAggregatedInbox();
    return NextResponse.json({ success: true, data: messages });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
