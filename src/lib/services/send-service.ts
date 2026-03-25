import { MockGmailSendAdapter } from "@/lib/adapters/send";
import type { SendResult } from "@/lib/adapters/send";

const sendAdapter = new MockGmailSendAdapter();
// TODO: Select adapter based on provider of the original message

export async function sendReply(messageId: string, replyText: string): Promise<SendResult> {
  console.log(`[sendService] Sending reply for message ${messageId}`);
  return sendAdapter.send("recipient@example.com", replyText, messageId);
}
