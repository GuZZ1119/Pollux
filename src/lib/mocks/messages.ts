import type { MessageItem } from "@/lib/types";

export const mockGmailMessages: MessageItem[] = [
  {
    id: "msg-gmail-1",
    provider: "gmail",
    threadId: "thread-g1",
    sender: "Alice Chen <alice.chen@acme.com>",
    subject: "Q2 Partnership Proposal — Follow Up",
    snippet: "Hi, just wanted to follow up on the partnership proposal we discussed last week...",
    content:
      "Hi,\n\nJust wanted to follow up on the partnership proposal we discussed last week. Our team has reviewed the terms and we're excited to move forward. Could you send over the updated contract by Friday?\n\nAlso, I noticed the revenue-share clause needs minor adjustments — happy to hop on a quick call to align.\n\nBest,\nAlice",
    timestamp: "2026-03-25T09:12:00Z",
    riskLevel: "MEDIUM",
    status: "unread",
  },
  {
    id: "msg-gmail-2",
    provider: "gmail",
    threadId: "thread-g2",
    sender: "noreply@github.com",
    subject: "[pollux] PR #42 merged: Fix inbox pagination",
    snippet: "Your pull request has been merged into main...",
    content:
      "Your pull request #42 \"Fix inbox pagination\" has been merged into main by @david.\n\nCommit: abc1234\nFiles changed: 3\n\nView on GitHub: https://github.com/pollux/pollux/pull/42",
    timestamp: "2026-03-25T07:45:00Z",
    riskLevel: "LOW",
    status: "read",
  },
  {
    id: "msg-gmail-3",
    provider: "gmail",
    threadId: "thread-g3",
    sender: "James Liu <james@investor-group.com>",
    subject: "Due Diligence — Additional Materials Needed",
    snippet: "We need the updated financial projections and cap table before our IC meeting...",
    content:
      "Hi,\n\nThank you for the pitch last Tuesday. The partners were impressed with the product direction.\n\nBefore our Investment Committee meeting next Wednesday, we'll need:\n1. Updated financial projections (2026-2028)\n2. Current cap table\n3. Key customer references\n\nPlease send these by Monday EOD if possible.\n\nRegards,\nJames Liu\nManaging Partner, Horizon Ventures",
    timestamp: "2026-03-24T16:30:00Z",
    riskLevel: "HIGH",
    status: "unread",
  },
];

export const mockSlackMessages: MessageItem[] = [
  {
    id: "msg-slack-1",
    provider: "slack",
    threadId: "thread-s1",
    sender: "Sarah Park",
    subject: undefined,
    snippet: "Hey, the staging deployment is failing on the new auth module...",
    content:
      "Hey, the staging deployment is failing on the new auth module. Error log shows a missing env var `AUTH0_SECRET`. Can you check if it's set in the Vercel dashboard? Blocking QA right now.",
    timestamp: "2026-03-25T10:05:00Z",
    riskLevel: "LOW",
    status: "unread",
  },
  {
    id: "msg-slack-2",
    provider: "slack",
    threadId: "thread-s2",
    sender: "Mike Torres",
    subject: undefined,
    snippet: "Design review for the new inbox UI is scheduled for 3pm today...",
    content:
      "Design review for the new inbox UI is scheduled for 3pm today. I've uploaded the latest Figma mocks to #design-reviews. Please take a look before the meeting — especially the mobile breakpoints. @channel",
    timestamp: "2026-03-25T08:20:00Z",
    riskLevel: "LOW",
    status: "read",
  },
  {
    id: "msg-slack-3",
    provider: "slack",
    threadId: "thread-s3",
    sender: "Emily Zhang",
    subject: undefined,
    snippet: "Client escalation: Acme Corp is reporting data sync delays...",
    content:
      "Client escalation: Acme Corp is reporting data sync delays of 15+ minutes on their connected Gmail accounts. This started after yesterday's release. They have a board meeting tomorrow and need reliable access. Can someone from the backend team investigate ASAP?",
    timestamp: "2026-03-25T06:50:00Z",
    riskLevel: "HIGH",
    status: "unread",
  },
];

export const mockAllMessages: MessageItem[] = [...mockGmailMessages, ...mockSlackMessages].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);
