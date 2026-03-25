import type { ReplyCandidate } from "@/lib/types";

export const mockReplyCandidatesMap: Record<string, ReplyCandidate[]> = {
  "msg-gmail-1": [
    {
      id: "reply-g1-a",
      text: "Hi Alice,\n\nThanks for following up. I'll have the updated contract ready by Thursday to give you time to review before Friday. Regarding the revenue-share clause — happy to jump on a call tomorrow afternoon. Does 2pm work?\n\nBest,",
      explanation: "Direct response addressing both requests with a concrete timeline.",
      confidence: 0.92,
    },
    {
      id: "reply-g1-b",
      text: "Hi Alice,\n\nGreat to hear you're ready to move forward! I'll loop in our legal team to prepare the revised contract. For the revenue-share discussion, I'd suggest a 30-min call this week — I'll send a calendar invite.\n\nThanks,",
      explanation: "Slightly more formal, involves legal team for contract review.",
      confidence: 0.85,
    },
  ],
  "msg-gmail-3": [
    {
      id: "reply-g3-a",
      text: "Hi James,\n\nThank you for the positive feedback from the partners. I'll prepare the requested materials:\n\n1. Updated financial projections — will be ready by Sunday\n2. Cap table — I'll send the current version today\n3. Customer references — I'll coordinate introductions early next week\n\nLet me know if there's anything else the IC would find helpful.\n\nBest regards,",
      explanation: "Structured response matching the numbered format of the request.",
      confidence: 0.94,
    },
    {
      id: "reply-g3-b",
      text: "Hi James,\n\nAppreciate the update. I'll have all three items to you by Monday morning. Quick question: should the projections focus on ARR or include services revenue as well?\n\nLooking forward to the IC meeting.\n\nBest,",
      explanation: "Concise with a clarifying question to ensure the right deliverable.",
      confidence: 0.88,
    },
  ],
  "msg-slack-1": [
    {
      id: "reply-s1-a",
      text: "On it — checking the Vercel env vars now. Will update in 10 min.",
      explanation: "Quick acknowledgment appropriate for Slack urgency.",
      confidence: 0.95,
    },
    {
      id: "reply-s1-b",
      text: "Just checked — AUTH0_SECRET was missing from the staging environment. Added it and triggered a redeploy. Should be green in ~5 min.",
      explanation: "Assumes the issue is found and provides a resolution update.",
      confidence: 0.82,
    },
  ],
  "msg-slack-3": [
    {
      id: "reply-s3-a",
      text: "Thanks for flagging. I'll check the sync pipeline logs from yesterday's release. @backend-oncall can you also look at the queue metrics? Will post findings within the hour.",
      explanation: "Acknowledges urgency, assigns investigation, sets time expectation.",
      confidence: 0.91,
    },
    {
      id: "reply-s3-b",
      text: "Looking into this now. First step: checking if yesterday's migration affected the polling interval for Gmail connectors. Will keep this thread updated.",
      explanation: "Provides specific investigation direction for transparency.",
      confidence: 0.87,
    },
  ],
};

export const defaultMockReplies: ReplyCandidate[] = [
  {
    id: "reply-default-a",
    text: "Thanks for your message. I'll review and get back to you shortly.",
    explanation: "Generic acknowledgment reply.",
    confidence: 0.7,
  },
  {
    id: "reply-default-b",
    text: "Got it, thanks! Let me look into this and follow up.",
    explanation: "Casual but responsive acknowledgment.",
    confidence: 0.65,
  },
];
