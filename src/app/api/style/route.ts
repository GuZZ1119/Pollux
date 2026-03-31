import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getUserStyleProfile, setUserStyleProfile } from "@/lib/style/style-store";
import { STYLE_PRESETS } from "@/lib/style/presets";
import type { UserStyleProfile } from "@/lib/types";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const profile = getUserStyleProfile(session.user.sub);
  return NextResponse.json({ success: true, data: profile });
}

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.sub;
  const body = await request.json();
  const { action, presetId, guardrails } = body;

  if (action === "set_preset") {
    const preset = STYLE_PRESETS[presetId];
    if (!preset) {
      return NextResponse.json({ success: false, error: "Unknown preset" }, { status: 400 });
    }

    const profile: UserStyleProfile = {
      styleCard: preset,
      examples: [],
      guardrails: guardrails ?? [],
      source: "preset",
      exampleCount: 0,
      updatedAt: new Date().toISOString(),
    };

    setUserStyleProfile(userId, profile);
    return NextResponse.json({ success: true, data: profile });
  }

  if (action === "update_guardrails") {
    const existing = getUserStyleProfile(userId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "No style profile yet" }, { status: 400 });
    }
    existing.guardrails = guardrails ?? [];
    existing.updatedAt = new Date().toISOString();
    setUserStyleProfile(userId, existing);
    return NextResponse.json({ success: true, data: existing });
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
