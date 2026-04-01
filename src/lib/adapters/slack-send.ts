import type { SendAdapter, SendResult } from "./send";
import { createSlackClient } from "@/lib/slack/client";

export class SlackSendAdapter implements SendAdapter {
  constructor(private userId: string) {}

  async send(
    to: string,
    content: string,
    threadId?: string,
  ): Promise<SendResult> {
    const client = createSlackClient(this.userId);

    const channelId = to;
    const threadTs = threadId ?? undefined;

    const res = await client.chat.postMessage({
      channel: channelId,
      text: content,
      thread_ts: threadTs,
    });

    return {
      success: res.ok ?? false,
      externalMessageId: res.ts ?? undefined,
    };
  }
}
