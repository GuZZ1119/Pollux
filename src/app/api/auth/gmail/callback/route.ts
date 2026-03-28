import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { exchangeCodeForTokens } from "@/lib/gmail/oauth";
import { setGmailTokens } from "@/lib/gmail/token-store";

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("[Gmail OAuth] Error:", error);
      return NextResponse.redirect(new URL("/settings?gmail_error=" + error, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/settings?gmail_error=no_code", request.url));
    }

    const tokens = await exchangeCodeForTokens(code);

    setGmailTokens(session.user.sub, {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      scope: tokens.scope ?? "",
      expiresAt: tokens.expiry_date ?? Date.now() + 3600 * 1000,
      email: session.user.email ?? undefined,
    });

    return NextResponse.redirect(new URL("/settings?gmail_connected=true", request.url));
  } catch (e) {
    console.error("[Gmail OAuth Callback] Error:", e);
    return NextResponse.redirect(new URL("/settings?gmail_error=exchange_failed", request.url));
  }
}
