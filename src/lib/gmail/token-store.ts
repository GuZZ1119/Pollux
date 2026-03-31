/**
 * Gmail token store — memory cache + Neon DB persistence.
 *
 * Reads are synchronous (from memory). Writes persist to DB asynchronously.
 * On cold start, call ensureTokensLoaded() to hydrate the memory cache from DB.
 */

import { prisma } from "@/lib/prisma";

export interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiresAt: number;
  email?: string;
}

const g = globalThis as unknown as {
  __polluxGmailTokenStore?: Map<string, GmailTokens>;
  __polluxTokensLoaded?: boolean;
};
if (!g.__polluxGmailTokenStore) g.__polluxGmailTokenStore = new Map();
const store = g.__polluxGmailTokenStore;

// ---- Sync reads (hot path, unchanged API) ----

export function getGmailTokens(userId: string): GmailTokens | null {
  return store.get(userId) ?? null;
}

export function hasGmailConnection(userId: string): boolean {
  return store.has(userId);
}

export function getStoreDebugInfo(): { size: number; keys: string[] } {
  return { size: store.size, keys: Array.from(store.keys()) };
}

// ---- Async writes (memory + DB) ----

export async function setGmailTokens(userId: string, tokens: GmailTokens): Promise<void> {
  store.set(userId, tokens);
  console.log(
    `[token-store] SET userId="${userId}", hasAccess=${Boolean(tokens.accessToken)}, ` +
    `hasRefresh=${Boolean(tokens.refreshToken)}, storeSize=${store.size}`,
  );
  try {
    await prisma.gmailToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        scope: tokens.scope,
        expiresAt: BigInt(tokens.expiresAt),
        email: tokens.email ?? null,
      },
      create: {
        userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        scope: tokens.scope,
        expiresAt: BigInt(tokens.expiresAt),
        email: tokens.email ?? null,
      },
    });
  } catch (e) {
    console.error("[token-store] DB persist failed:", e);
  }
}

export async function removeGmailTokens(userId: string): Promise<void> {
  store.delete(userId);
  try {
    await prisma.gmailToken.delete({ where: { userId } }).catch(() => {});
  } catch {
    /* ignore if row doesn't exist */
  }
}

// ---- Cold-start hydration ----

export async function ensureTokensLoaded(): Promise<void> {
  if (g.__polluxTokensLoaded) return;
  try {
    const rows = await prisma.gmailToken.findMany();
    for (const r of rows) {
      if (!store.has(r.userId)) {
        store.set(r.userId, {
          accessToken: r.accessToken,
          refreshToken: r.refreshToken,
          scope: r.scope,
          expiresAt: Number(r.expiresAt),
          email: r.email ?? undefined,
        });
      }
    }
    g.__polluxTokensLoaded = true;
    console.log(`[token-store] Loaded ${rows.length} token(s) from DB, store size=${store.size}`);
  } catch (e) {
    console.error("[token-store] DB load failed (will retry next call):", e);
  }
}
