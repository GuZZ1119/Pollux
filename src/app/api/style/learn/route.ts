import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { setUserStyleProfile } from "@/lib/style/style-store";
import { extractStyleFromSamples } from "@/lib/style/extract";
import { fetchGmailSentEmails } from "@/lib/gmail/fetch-sent";
import { hasGmailConnection, ensureTokensLoaded } from "@/lib/gmail/token-store";
import type { UserStyleProfile, StyleSource } from "@/lib/types";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.sub;
  const body = await request.json();
  const { source, texts } = body as { source: string; texts?: string[] };

  try {
    let samples: string[] = [];
    let styleSource: StyleSource = "manual_samples";

    if (source === "gmail_sent") {
      await ensureTokensLoaded();
      if (!hasGmailConnection(userId)) {
        return NextResponse.json(
          { success: false, error: "Gmail is not connected. Please connect Gmail in Settings first." },
          { status: 400 },
        );
      }
      samples = await fetchGmailSentEmails(userId, 15);
      if (samples.length === 0) {
        return NextResponse.json(
          { success: false, error: "No sent emails found. Try sending some emails first, or use another method." },
          { status: 400 },
        );
      }
      styleSource = "gmail_sent";
    } else if (source === "manual_samples") {
      if (!texts || texts.length === 0 || texts.every((t) => !t.trim())) {
        return NextResponse.json(
          { success: false, error: "Please provide at least one writing sample." },
          { status: 400 },
        );
      }
      samples = texts.filter((t) => t.trim().length > 0);
      styleSource = "manual_samples";
    } else {
      return NextResponse.json({ success: false, error: "Unknown source" }, { status: 400 });
    }

    console.log(`[style-learn] source=${styleSource}, userId="${userId}", samples=${samples.length}`);

    const { styleCard, examples } = await extractStyleFromSamples(samples, styleSource);

    const profile: UserStyleProfile = {
      styleCard,
      examples,
      guardrails: [],
      source: styleSource,
      exampleCount: examples.length,
      updatedAt: new Date().toISOString(),
    };

    await setUserStyleProfile(userId, profile);

    return NextResponse.json({ success: true, data: profile });
  } catch (e) {
    console.error("[style-learn] Error:", e);
    const message = e instanceof Error ? e.message : "Style learning failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
