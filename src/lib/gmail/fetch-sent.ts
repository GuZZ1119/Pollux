import { createGmailClient } from "./client";
import { extractTextBody } from "./parse";

/**
 * Fetch recent sent emails from Gmail for style learning.
 * Returns plain-text bodies of sent messages.
 */
export async function fetchGmailSentEmails(
  userId: string,
  maxResults: number = 15,
): Promise<string[]> {
  const gmail = createGmailClient(userId);

  const listRes = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["SENT"],
    maxResults,
  });

  const messageIds = listRes.data.messages ?? [];
  if (messageIds.length === 0) return [];

  const results = await Promise.allSettled(
    messageIds.map((m) =>
      gmail.users.messages.get({ userId: "me", id: m.id!, format: "full" }),
    ),
  );

  const texts: string[] = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const msg = r.value.data;
    const body = extractTextBody(msg.payload ?? undefined);
    if (body && body.length > 20 && body !== "(No content)") {
      texts.push(body.slice(0, 1500));
    }
  }

  return texts;
}
