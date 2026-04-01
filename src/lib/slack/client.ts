import { WebClient } from "@slack/web-api";
import { getSlackTokens } from "./token-store";

export function createSlackClient(userId: string): WebClient {
  const tokens = getSlackTokens(userId);
  if (!tokens) {
    throw new Error("No Slack tokens found for user");
  }
  return new WebClient(tokens.botToken);
}
