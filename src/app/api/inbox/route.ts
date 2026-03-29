import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAggregatedInbox } from "@/lib/services/inbox-service";
import type { InboxFetchOptions } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? undefined;

    const url = new URL(request.url);
    const options: InboxFetchOptions = {};

    const limitParam = url.searchParams.get("limit");
    if (limitParam) options.limit = parseInt(limitParam, 10);

    const filterParam = url.searchParams.get("filter");
    if (filterParam === "primary" || filterParam === "all") {
      options.filter = filterParam;
    }

    const cursor = url.searchParams.get("cursor");
    if (cursor) options.cursor = cursor;

    const messages = await getAggregatedInbox(userId, options);

    return NextResponse.json({
      success: true,
      data: messages,
      meta: {
        count: messages.length,
        filter: options.filter ?? "primary",
        cursor: null,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
