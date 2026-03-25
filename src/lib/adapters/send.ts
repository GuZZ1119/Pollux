export interface SendResult {
  success: boolean;
  externalMessageId?: string;
  error?: string;
}

export interface SendAdapter {
  send(to: string, content: string, threadId?: string): Promise<SendResult>;
}

// TODO: Replace with real Gmail send via gmail.users.messages.send
export class MockGmailSendAdapter implements SendAdapter {
  async send(to: string, content: string, threadId?: string): Promise<SendResult> {
    console.log(`[MockGmailSend] to=${to}, threadId=${threadId}, length=${content.length}`);
    return { success: true, externalMessageId: `mock-gmail-sent-${Date.now()}` };
  }
}

// TODO: Replace with real Slack send via chat.postMessage
export class MockSlackSendAdapter implements SendAdapter {
  async send(to: string, content: string, threadId?: string): Promise<SendResult> {
    console.log(`[MockSlackSend] to=${to}, threadId=${threadId}, length=${content.length}`);
    return { success: true, externalMessageId: `mock-slack-sent-${Date.now()}` };
  }
}
