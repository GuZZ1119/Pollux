import type { ReplyCandidate } from "@/lib/types";
import { mockReplyCandidatesMap, defaultMockReplies } from "@/lib/mocks/replies";

// TODO: Replace with real AI generation via OpenAI / Anthropic API
// Input will include: message content, user's StyleCard, conversation context
export async function generateReplies(messageId: string): Promise<ReplyCandidate[]> {
  await new Promise((r) => setTimeout(r, 300)); // simulate latency
  return mockReplyCandidatesMap[messageId] ?? defaultMockReplies;
}
