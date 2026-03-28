import type { ConnectedAccount } from "@/lib/types";
import { hasGmailConnection, getGmailTokens } from "@/lib/gmail/token-store";

export async function getConnectedAccounts(userId?: string): Promise<ConnectedAccount[]> {
  const accounts: ConnectedAccount[] = [];

  // Gmail — real connection check
  if (userId && hasGmailConnection(userId)) {
    const tokens = getGmailTokens(userId);
    accounts.push({
      id: "acc-gmail-real",
      provider: "gmail",
      scopes: tokens?.scope.split(" ") ?? [],
      status: "CONNECTED",
      lastSyncAt: new Date().toISOString(),
    });
  } else {
    accounts.push({
      id: "acc-gmail-placeholder",
      provider: "gmail",
      scopes: [],
      status: "DISCONNECTED",
      lastSyncAt: null,
    });
  }

  // Slack — still mock / disconnected for Phase 2
  accounts.push({
    id: "acc-slack-mock",
    provider: "slack",
    scopes: [],
    status: "DISCONNECTED",
    lastSyncAt: null,
  });

  return accounts;
}
