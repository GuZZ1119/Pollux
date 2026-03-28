// In-memory token store for hackathon MVP.
// TODO: Migrate to database (ConnectedAccount table) or Auth0 Token Vault.
// Tokens are lost on server restart — acceptable for MVP demo.

export interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiresAt: number;
  email?: string;
}

const store = new Map<string, GmailTokens>();

export function getGmailTokens(userId: string): GmailTokens | null {
  return store.get(userId) ?? null;
}

export function setGmailTokens(userId: string, tokens: GmailTokens): void {
  store.set(userId, tokens);
}

export function removeGmailTokens(userId: string): void {
  store.delete(userId);
}

export function hasGmailConnection(userId: string): boolean {
  const tokens = store.get(userId);
  if (!tokens) return false;
  return true;
}
