import type { UserStyleProfile } from "@/lib/types";

const globalStore = globalThis as unknown as {
  __polluxStyleStore?: Map<string, UserStyleProfile>;
};

if (!globalStore.__polluxStyleStore) {
  globalStore.__polluxStyleStore = new Map();
}

const store: Map<string, UserStyleProfile> = globalStore.__polluxStyleStore;

export function getUserStyleProfile(userId: string): UserStyleProfile | null {
  return store.get(userId) ?? null;
}

export function setUserStyleProfile(userId: string, profile: UserStyleProfile): void {
  store.set(userId, profile);
  console.log(
    `[style-store] SET userId="${userId}", source=${profile.source}, ` +
    `examples=${profile.exampleCount}, persona=${profile.styleCard.persona}`,
  );
}

export function removeUserStyleProfile(userId: string): void {
  store.delete(userId);
}
