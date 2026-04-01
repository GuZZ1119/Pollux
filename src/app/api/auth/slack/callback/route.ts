import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { exchangeSlackCode } from "@/lib/slack/oauth";
import { setSlackTokens, hasSlackConnection } from "@/lib/slack/token-store";

function appUrl(path: string): string {
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  return `${base}${path}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.redirect(appUrl("/auth/login"));
    }

    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("[Slack OAuth] Error:", error);
      return NextResponse.redirect(appUrl("/settings?slack_error=" + error));
    }

    if (!code) {
      return NextResponse.redirect(appUrl("/settings?slack_error=no_code"));
    }

    const result = await exchangeSlackCode(code);
    const userId = session.user.sub;

    console.log(
      `[Slack OAuth] Success. userId="${userId}", team=${result.teamId}, ` +
      `botUserId=${result.botUserId}, scope="${result.scope}"`,
    );

    await setSlackTokens(userId, {
      botToken: result.botToken,
      teamId: result.teamId,
      teamName: result.teamName,
      botUserId: result.botUserId,
      scope: result.scope,
    });

    const verified = hasSlackConnection(userId);
    console.log(`[Slack OAuth] Verify: hasSlackConnection("${userId}")=${verified}`);

    return NextResponse.redirect(appUrl("/settings?slack_connected=true"));
  } catch (e) {
    console.error("[Slack OAuth Callback] Error:", e);
    return NextResponse.redirect(appUrl("/settings?slack_error=exchange_failed"));
  }
}
