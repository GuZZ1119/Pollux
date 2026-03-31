/**
 * Style profile store — memory cache + Neon DB persistence.
 *
 * Same pattern as token-store: sync reads, async writes, cold-start hydration.
 */

import { prisma } from "@/lib/prisma";
import type { UserStyleProfile } from "@/lib/types";

const g = globalThis as unknown as {
  __polluxStyleStore?: Map<string, UserStyleProfile>;
  __polluxStyleLoaded?: Set<string>;
};
if (!g.__polluxStyleStore) g.__polluxStyleStore = new Map();
if (!g.__polluxStyleLoaded) g.__polluxStyleLoaded = new Set();
const store = g.__polluxStyleStore;
const loadedUsers = g.__polluxStyleLoaded;

// ---- Sync reads ----

export function getUserStyleProfile(userId: string): UserStyleProfile | null {
  return store.get(userId) ?? null;
}

// ---- Async writes (memory + DB) ----

export async function setUserStyleProfile(userId: string, profile: UserStyleProfile): Promise<void> {
  store.set(userId, profile);
  console.log(
    `[style-store] SET userId="${userId}", source=${profile.source}, ` +
    `examples=${profile.exampleCount}, persona=${profile.styleCard.persona}`,
  );
  try {
    await prisma.styleProfile.upsert({
      where: { userId },
      update: { data: JSON.parse(JSON.stringify(profile)) },
      create: { userId, data: JSON.parse(JSON.stringify(profile)) },
    });
  } catch (e) {
    console.error("[style-store] DB persist failed:", e);
  }
}

export async function removeUserStyleProfile(userId: string): Promise<void> {
  store.delete(userId);
  try {
    await prisma.styleProfile.delete({ where: { userId } }).catch(() => {});
  } catch {
    /* ignore */
  }
}

// ---- Cold-start hydration (per user, lazy) ----

export async function ensureStyleLoaded(userId: string): Promise<void> {
  if (loadedUsers.has(userId)) return;
  if (store.has(userId)) {
    loadedUsers.add(userId);
    return;
  }
  try {
    const row = await prisma.styleProfile.findUnique({ where: { userId } });
    if (row) {
      store.set(userId, row.data as unknown as UserStyleProfile);
    }
    loadedUsers.add(userId);
  } catch (e) {
    console.error("[style-store] DB load failed:", e);
  }
}
