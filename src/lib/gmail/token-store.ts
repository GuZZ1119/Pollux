/**
 * In-memory token store for hackathon MVP.
 *
 * Uses globalThis to survive Next.js dev server HMR (Hot Module Replacement).
 * Without globalThis, `const store = new Map()` is re-executed on every HMR
 * cycle, clearing all stored tokens. This is the same pattern Prisma recommends
 * for PrismaClient in Next.js dev mode.
 *
 * TODO: Migrate to database (ConnectedAccount table) for production persistence.
 */

export interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiresAt: number;
  email?: string;
}

const globalStore = globalThis as unknown as {
  __polluxGmailTokenStore?: Map<string, GmailTokens>;
};

if (!globalStore.__polluxGmailTokenStore) {
  globalStore.__polluxGmailTokenStore = new Map();
}

const store: Map<string, GmailTokens> = globalStore.__polluxGmailTokenStore;

export function getGmailTokens(userId: string): GmailTokens | null {
  return store.get(userId) ?? null;
}

export function setGmailTokens(userId: string, tokens: GmailTokens): void {
  store.set(userId, tokens);
  console.log(
    `[token-store] SET key="${userId}", hasAccess=${Boolean(tokens.accessToken)}, ` +
    `hasRefresh=${Boolean(tokens.refreshToken)}, storeSize=${store.size}`,
  );
}

export function removeGmailTokens(userId: string): void {
  store.delete(userId);
}

export function hasGmailConnection(userId: string): boolean {
  return store.has(userId);
}

export function getStoreDebugInfo(): { size: number; keys: string[] } {
  return { size: store.size, keys: Array.from(store.keys()) };
}
