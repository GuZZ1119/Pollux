import type { ConnectedAccount } from "@/lib/types";
import { hasGmailConnection, getGmailTokens, ensureTokensLoaded } from "@/lib/gmail/token-store";
import { hasSlackConnection, getSlackTokens, ensureSlackTokensLoaded } from "@/lib/slack/token-store";
import { hasOutlookConnection } from "@/lib/outlook/token-vault";

export async function getConnectedAccounts(userId?: string): Promise<ConnectedAccount[]> {
  if (userId) {
    await ensureTokensLoaded();
    await ensureSlackTokensLoaded();
  }

  const accounts: ConnectedAccount[] = [];

  // Gmail (app-managed OAuth)
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

  // Slack (app-managed OAuth)
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

  // Outlook (Auth0 Token Vault — session-based check, no userId param)
  if (userId) {
    const outlookConnected = await hasOutlookConnection();
    accounts.push(
      outlookConnected
        ? {
            id: "acc-outlook-vault",
            provider: "outlook",
            scopes: ["Mail.Read"],
            status: "CONNECTED",
            lastSyncAt: new Date().toISOString(),
          }
        : {
            id: "acc-outlook-placeholder",
            provider: "outlook",
            scopes: [],
            status: "DISCONNECTED",
            lastSyncAt: null,
          },
    );
  } else {
    accounts.push({
      id: "acc-outlook-placeholder",
      provider: "outlook",
      scopes: [],
      status: "DISCONNECTED",
      lastSyncAt: null,
    });
  }

  return accounts;
}
