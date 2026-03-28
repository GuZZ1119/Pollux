import type { ReplyCandidate } from "@/lib/types";
import { generateRepliesWithOpenAI, type GenerateInput } from "@/lib/openai/generate";
import { mockStyleCard } from "@/lib/mocks/style";
import { defaultMockReplies } from "@/lib/mocks/replies";

export type ReplySource = "openai" | "fallback_mock";

export interface GenerateResult {
  candidates: ReplyCandidate[];
  source: ReplySource;
}

export async function generateReplies(input: GenerateInput): Promise<GenerateResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[reply-service] OPENAI_API_KEY not set — returning mock replies");
    return { candidates: defaultMockReplies, source: "fallback_mock" };
  }

  try {
    const candidates = await generateRepliesWithOpenAI(input, mockStyleCard);
    return { candidates, source: "openai" };
  } catch (e) {
    console.error("[reply-service] OpenAI generation failed, falling back to mock:", e);
    return { candidates: defaultMockReplies, source: "fallback_mock" };
  }
}
