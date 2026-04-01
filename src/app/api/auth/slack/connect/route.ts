import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getSlackAuthUrl } from "@/lib/slack/oauth";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const state = session.user.sub;
    const url = getSlackAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
