import type { ConnectedAccount } from "@/lib/types";
import { hasGmailConnection, getGmailTokens, ensureTokensLoaded } from "@/lib/gmail/token-store";
import { hasSlackConnection, getSlackTokens, ensureSlackTokensLoaded } from "@/lib/slack/token-store";

export async function getConnectedAccounts(userId?: string): Promise<ConnectedAccount[]> {
  if (userId) {
    await ensureTokensLoaded();
    await ensureSlackTokensLoaded();
  }

  const accounts: ConnectedAccount[] = [];

  // Gmail
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

  // Slack
  if (userId && hasSlackConnection(userId)) {
    const tokens = getSlackTokens(userId);
    accounts.push({
      id: "acc-slack-real",
      provider: "slack",
      scopes: tokens?.scope.split(",") ?? [],
      status: "CONNECTED",
      lastSyncAt: new Date().toISOString(),
    });
  } else {
    accounts.push({
      id: "acc-slack-placeholder",
      provider: "slack",
      scopes: [],
      status: "DISCONNECTED",
      lastSyncAt: null,
    });
  }

  return accounts;
}
