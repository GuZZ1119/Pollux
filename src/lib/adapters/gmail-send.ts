import type { SendAdapter, SendResult } from "./send";
import { createGmailClient } from "@/lib/gmail/client";

export class GmailSendAdapter implements SendAdapter {
  constructor(private userId: string) {}

  async send(to: string, content: string, threadId?: string, subject?: string, inReplyToMessageId?: string): Promise<SendResult> {
    const gmail = createGmailClient(this.userId);

    const replySubject = subject ? (subject.startsWith("Re:") ? subject : `Re: ${subject}`) : "";
    const raw = buildRawEmail(to, replySubject, content, inReplyToMessageId);

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
        threadId: threadId || undefined,
      },
    });

    return {
      success: true,
      externalMessageId: res.data.id ?? undefined,
    };
  }
}

function buildRawEmail(to: string, subject: string, body: string, inReplyTo?: string): string {
  const lines: string[] = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
  ];

  if (inReplyTo) {
    lines.push(`In-Reply-To: ${inReplyTo}`);
    lines.push(`References: ${inReplyTo}`);
  }

  lines.push("", body);

  const raw = lines.join("\r\n");
  return Buffer.from(raw).toString("base64url");
}
