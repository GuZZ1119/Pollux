/**
 * Slack token store — memory cache + Neon DB persistence.
 * Same pattern as Gmail token-store: sync reads, async writes, cold-start hydration.
 */

import { prisma } from "@/lib/prisma";

export interface SlackTokens {
  botToken: string;
  teamId: string;
  teamName?: string;
  botUserId?: string;
  scope: string;
}

const g = globalThis as unknown as {
  __polluxSlackTokenStore?: Map<string, SlackTokens>;
  __polluxSlackTokensLoaded?: boolean;
};
if (!g.__polluxSlackTokenStore) g.__polluxSlackTokenStore = new Map();
const store = g.__polluxSlackTokenStore;

// ---- Sync reads ----

export function getSlackTokens(userId: string): SlackTokens | null {
  return store.get(userId) ?? null;
}

export function hasSlackConnection(userId: string): boolean {
  return store.has(userId);
}

// ---- Async writes (memory + DB) ----

export async function setSlackTokens(userId: string, tokens: SlackTokens): Promise<void> {
  store.set(userId, tokens);
  console.log(
    `[slack-token-store] SET userId="${userId}", team=${tokens.teamId}, storeSize=${store.size}`,
  );
  try {
    await prisma.slackToken.upsert({
      where: { userId },
      update: {
        botToken: tokens.botToken,
        teamId: tokens.teamId,
        teamName: tokens.teamName ?? null,
        botUserId: tokens.botUserId ?? null,
        scope: tokens.scope,
      },
      create: {
        userId,
        botToken: tokens.botToken,
        teamId: tokens.teamId,
        teamName: tokens.teamName ?? null,
        botUserId: tokens.botUserId ?? null,
        scope: tokens.scope,
      },
    });
  } catch (e) {
    console.error("[slack-token-store] DB persist failed:", e);
  }
}

export async function removeSlackTokens(userId: string): Promise<void> {
  store.delete(userId);
  try {
    await prisma.slackToken.delete({ where: { userId } }).catch(() => {});
  } catch { /* ignore */ }
}

// ---- Cold-start hydration ----

export async function ensureSlackTokensLoaded(): Promise<void> {
  if (g.__polluxSlackTokensLoaded) return;
  try {
    const rows = await prisma.slackToken.findMany();
    for (const r of rows) {
      if (!store.has(r.userId)) {
        store.set(r.userId, {
          botToken: r.botToken,
          teamId: r.teamId,
          teamName: r.teamName ?? undefined,
          botUserId: r.botUserId ?? undefined,
          scope: r.scope,
        });
      }
    }
    g.__polluxSlackTokensLoaded = true;
    console.log(`[slack-token-store] Loaded ${rows.length} token(s) from DB, storeSize=${store.size}`);
  } catch (e) {
    console.error("[slack-token-store] DB load failed:", e);
  }
}
