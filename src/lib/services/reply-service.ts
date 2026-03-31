import type { ReplyCandidate } from "@/lib/types";
import { generateRepliesWithOpenAI, type GenerateInput, type EnhancedStyleContext } from "@/lib/openai/generate";
import { getUserStyleProfile } from "@/lib/style/style-store";
import { mockStyleCard } from "@/lib/mocks/style";
import { defaultMockReplies } from "@/lib/mocks/replies";

export type ReplySource = "openai" | "fallback_mock";

export interface GenerateResult {
  candidates: ReplyCandidate[];
  source: ReplySource;
  styleMeta?: { persona: string; source: string; exampleCount: number };
}

export async function generateReplies(input: GenerateInput, userId?: string): Promise<GenerateResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[reply-service] OPENAI_API_KEY not set — returning mock replies");
    return { candidates: defaultMockReplies, source: "fallback_mock" };
  }

  const profile = userId ? getUserStyleProfile(userId) : null;
  const styleCtx: EnhancedStyleContext = profile
    ? {
        styleCard: profile.styleCard,
        examples: profile.examples,
        guardrails: profile.guardrails,
      }
    : { styleCard: mockStyleCard };

  const meta = profile
    ? { persona: profile.styleCard.persona, source: profile.source, exampleCount: profile.exampleCount }
    : { persona: mockStyleCard.persona, source: "default", exampleCount: 0 };

  console.log(
    `[reply-service] Generating with style: persona=${meta.persona}, source=${meta.source}, examples=${meta.exampleCount}`,
  );

  try {
    const candidates = await generateRepliesWithOpenAI(input, styleCtx);
    return { candidates, source: "openai", styleMeta: meta };
  } catch (e) {
    console.error("[reply-service] OpenAI generation failed, falling back to mock:", e);
    return { candidates: defaultMockReplies, source: "fallback_mock" };
  }
}
