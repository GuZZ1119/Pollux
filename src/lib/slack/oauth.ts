const SCOPES = [
  "channels:history",
  "channels:read",
  "chat:write",
  "im:history",
  "im:read",
  "users:read",
];

function getRedirectUri(): string {
  if (process.env.SLACK_REDIRECT_URI) return process.env.SLACK_REDIRECT_URI;
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  return `${base}/api/auth/slack/callback`;
}

export function getSlackAuthUrl(state: string): string {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) throw new Error("Missing SLACK_CLIENT_ID");

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SCOPES.join(","),
    redirect_uri: getRedirectUri(),
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code: string): Promise<SlackOAuthResult> {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET");
  }

  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getRedirectUri(),
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error ?? "unknown"}`);
  }

  return {
    botToken: data.access_token,
    teamId: data.team?.id ?? "",
    teamName: data.team?.name ?? undefined,
    botUserId: data.bot_user_id ?? undefined,
    scope: data.scope ?? "",
  };
}

export interface SlackOAuthResult {
  botToken: string;
  teamId: string;
  teamName?: string;
  botUserId?: string;
  scope: string;
}
