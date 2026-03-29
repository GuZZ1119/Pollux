import type { MessageItem, InboxFetchOptions } from "@/lib/types";

export interface InboxAdapter {
  fetchMessages(options?: InboxFetchOptions): Promise<MessageItem[]>;
}

export class MockGmailInboxAdapter implements InboxAdapter {
  async fetchMessages(): Promise<MessageItem[]> {
    const { mockGmailMessages } = await import("@/lib/mocks/messages");
    return mockGmailMessages;
  }
}

export class MockSlackInboxAdapter implements InboxAdapter {
  async fetchMessages(): Promise<MessageItem[]> {
    const { mockSlackMessages } = await import("@/lib/mocks/messages");
    return mockSlackMessages;
  }
}
