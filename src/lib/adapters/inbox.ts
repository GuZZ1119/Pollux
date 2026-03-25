import type { MessageItem } from "@/lib/types";

export interface InboxAdapter {
  fetchMessages(): Promise<MessageItem[]>;
}

// TODO: Replace with real Gmail API calls via google-auth-library + googleapis
// Will need: OAuth2 access token from Auth0 Token Vault, Gmail.users.messages.list
export class MockGmailInboxAdapter implements InboxAdapter {
  async fetchMessages(): Promise<MessageItem[]> {
    const { mockGmailMessages } = await import("@/lib/mocks/messages");
    return mockGmailMessages;
  }
}

// TODO: Replace with real Slack API calls via @slack/web-api
// Will need: Bot token or user token from Auth0 Token Vault, conversations.history
export class MockSlackInboxAdapter implements InboxAdapter {
  async fetchMessages(): Promise<MessageItem[]> {
    const { mockSlackMessages } = await import("@/lib/mocks/messages");
    return mockSlackMessages;
  }
}
