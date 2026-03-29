import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { logEvent, getEvents, type EventType } from "@/lib/services/event-log";

export async function GET(request: Request) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? undefined;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
    const eventType = (url.searchParams.get("type") as EventType) || undefined;

    const events = getEvents(userId, limit, eventType);
    return NextResponse.json({ success: true, data: events });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? "anonymous";
    const body = await request.json();

    const entry = logEvent({
      eventType: body.eventType,
      userId,
      provider: body.provider,
      messageId: body.messageId,
      threadId: body.threadId,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
