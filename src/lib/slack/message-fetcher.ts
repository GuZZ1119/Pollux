import { createSlackClient } from "./client";

export interface FetchedSlackMessage {
  id: string;
  channelId: string;
  threadTs: string;
  sender: string;
  subject?: string;
  content: string;
  provider: "slack";
}

/**
 * Parse a Slack messageId of format "slack-{channelId}-{ts}".
 * The ts contains a period (e.g. "1234567890.123456").
 * channelId always starts with C/D/G so we split on the second hyphen.
 */
function parseSlackMessageId(messageId: string): { channelId: string; ts: string } {
  const stripped = messageId.startsWith("slack-") ? messageId.slice(6) : messageId;
  const firstHyphen = stripped.indexOf("-");
  if (firstHyphen === -1) throw new Error(`Invalid Slack messageId: ${messageId}`);
  return {
    channelId: stripped.slice(0, firstHyphen),
    ts: stripped.slice(firstHyphen + 1),
  };
}

/**
 * Fetch a single Slack message by its Pollux messageId.
 */
export async function fetchSlackMessageById(
  userId: string,
  messageId: string,
): Promise<FetchedSlackMessage> {
  const { channelId, ts } = parseSlackMessageId(messageId);
  const client = createSlackClient(userId);

  const result = await client.conversations.history({
    channel: channelId,
    oldest: ts,
    latest: ts,
    inclusive: true,
    limit: 1,
  });

  const msg = result.messages?.[0];
  if (!msg) throw new Error(`Slack message not found: ${messageId}`);

  let sender = msg.user ?? "Unknown";
  try {
    const userInfo = await client.users.info({ user: msg.user ?? "" });
    sender = userInfo.user?.real_name || userInfo.user?.name || sender;
  } catch { /* keep raw user ID */ }

  let subject: string | undefined;
  try {
    const chInfo = await client.conversations.info({ channel: channelId });
    if (chInfo.channel?.name) subject = `#${chInfo.channel.name}`;
  } catch { /* DMs have no channel name */ }

  return {
    id: ts,
    channelId,
    threadTs: msg.thread_ts ?? ts,
    sender,
    subject,
    content: msg.text ?? "",
    provider: "slack",
  };
}
