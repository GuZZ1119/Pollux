import { google, type gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { getGmailTokens, setGmailTokens } from "./token-store";

export function createGmailClient(userId: string): gmail_v1.Gmail {
  const tokens = getGmailTokens(userId);
  if (!tokens) {
    throw new Error("No Gmail tokens found for user");
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiresAt,
  });

  oauth2Client.on("tokens", (refreshed) => {
    setGmailTokens(userId, {
      ...tokens,
      accessToken: refreshed.access_token ?? tokens.accessToken,
      expiresAt: refreshed.expiry_date ?? Date.now() + 3600 * 1000,
    });
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}
