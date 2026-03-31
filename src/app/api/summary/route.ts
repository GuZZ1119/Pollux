import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAggregatedInbox } from "@/lib/services/inbox-service";
import { generateDailyBrief } from "@/lib/services/summary-service";
import type { DailyBrief } from "@/lib/types";

// ---------------------------------------------------------------------------
// Lightweight in-memory cache (globalThis, survives HMR)
// ---------------------------------------------------------------------------

interface CacheEntry {
  brief: DailyBrief;
  expiresAt: number;
}

const g = globalThis as unknown as { __polluxSummaryCache?: Map<string, CacheEntry> };
if (!g.__polluxSummaryCache) g.__polluxSummaryCache = new Map();
const cache = g.__polluxSummaryCache;

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const userId = session.user.sub;
  const url = new URL(request.url);
  const useAI = url.searchParams.get("ai") !== "false";
  const forceRefresh = url.searchParams.get("refresh") === "true";

  if (!forceRefresh) {
    const cached = cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ success: true, data: cached.brief, cached: true });
    }
  }

  try {
    const messages = await getAggregatedInbox(userId, { filter: "primary" });
    const brief = await generateDailyBrief(messages, {
      useAI: useAI && !!process.env.OPENAI_API_KEY,
    });

    cache.set(userId, { brief, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json({ success: true, data: brief, cached: false });
  } catch (err) {
    console.error("[summary API]", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
