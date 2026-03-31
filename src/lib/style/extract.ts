import type { StyleCard, StyleExample } from "@/lib/types";

export interface ExtractionResult {
  styleCard: StyleCard;
  examples: StyleExample[];
}

/**
 * AI-powered style extraction: analyze writing samples and produce a structured StyleCard.
 * Falls back to rule-based extraction if OpenAI is unavailable.
 */
export async function extractStyleFromSamples(
  texts: string[],
  sourceProvider: string = "manual",
): Promise<ExtractionResult> {
  const examples = textsToExamples(texts, sourceProvider);

  if (!process.env.OPENAI_API_KEY || texts.length === 0) {
    return { styleCard: ruleBasedExtract(texts), examples };
  }

  try {
    const styleCard = await aiExtract(texts);
    return { styleCard, examples };
  } catch (e) {
    console.error("[style-extract] AI extraction failed, using rules:", e);
    return { styleCard: ruleBasedExtract(texts), examples };
  }
}

function textsToExamples(texts: string[], sourceProvider: string): StyleExample[] {
  return texts.slice(0, 20).map((text, i) => {
    const wordCount = text.split(/\s+/).length;
    const lengthBucket: StyleExample["lengthBucket"] =
      wordCount < 50 ? "short" : wordCount < 150 ? "medium" : "long";
    return {
      id: `ex-${Date.now()}-${i}`,
      persona: "learned",
      sourceProvider,
      text: text.slice(0, 1000),
      lengthBucket,
    };
  });
}

// ---------------------------------------------------------------------------
// AI extraction
// ---------------------------------------------------------------------------

async function aiExtract(texts: string[]): Promise<StyleCard> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const samplesText = texts
    .slice(0, 10)
    .map((t, i) => `--- Sample ${i + 1} ---\n${t.slice(0, 800)}`)
    .join("\n\n");

  const prompt = `Analyze the following writing samples and extract the author's communication style.

${samplesText}

Return a JSON object with EXACTLY these fields:
- "persona": one-word style label (e.g. "professional", "friendly", "assertive", "casual")
- "toneRules": array of 3-5 specific tone rules this writer follows
- "bannedPhrases": array of phrases this writer clearly avoids (infer from patterns)
- "signoffPatterns": array of sign-off patterns used (e.g. "Best,", "Thanks,")
- "greetingPatterns": array of greeting patterns used (e.g. "Hi {name},", "Hey,")
- "emojiPreference": "none" | "minimal" | "frequent"
- "sentenceStyle": "concise" | "elaborate" | "mixed"
- "directness": "direct" | "diplomatic" | "balanced"
- "hedgeWords": array of hedging words/phrases the writer uses (e.g. "I think", "perhaps")

Be specific and grounded in the actual samples. Return ONLY the JSON object — no markdown fences.`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  let raw = res.choices[0]?.message?.content?.trim() ?? "{}";
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(raw);
  return {
    id: `style-ai-${Date.now()}`,
    persona: String(parsed.persona ?? "professional"),
    toneRules: Array.isArray(parsed.toneRules) ? parsed.toneRules.map(String) : [],
    bannedPhrases: Array.isArray(parsed.bannedPhrases) ? parsed.bannedPhrases.map(String) : [],
    signoffPatterns: Array.isArray(parsed.signoffPatterns) ? parsed.signoffPatterns.map(String) : ["Best,"],
    greetingPatterns: Array.isArray(parsed.greetingPatterns) ? parsed.greetingPatterns.map(String) : [],
    emojiPreference: String(parsed.emojiPreference ?? "none"),
    sentenceStyle: String(parsed.sentenceStyle ?? "concise"),
    directness: String(parsed.directness ?? "balanced"),
    hedgeWords: Array.isArray(parsed.hedgeWords) ? parsed.hedgeWords.map(String) : [],
  };
}

// ---------------------------------------------------------------------------
// Rule-based fallback
// ---------------------------------------------------------------------------

function ruleBasedExtract(texts: string[]): StyleCard {
  const joined = texts.join("\n");

  const signoffs: string[] = [];
  const greetings: string[] = [];
  let totalWords = 0;
  let totalSentences = 0;
  let emojiCount = 0;

  for (const t of texts) {
    totalWords += t.split(/\s+/).length;
    totalSentences += (t.match(/[.!?]+/g) ?? []).length || 1;
    emojiCount += (t.match(/[\u{1F600}-\u{1F9FF}]/gu) ?? []).length;

    const signoffMatch = t.match(/(Best|Thanks|Cheers|Regards|Sincerely|Warm regards|Take care)[,.]?\s*$/im);
    if (signoffMatch) signoffs.push(signoffMatch[0].trim());

    const greetMatch = t.match(/^(Hi|Hey|Hello|Dear|Good morning|Good afternoon)[^.\n]*/im);
    if (greetMatch) greetings.push(greetMatch[0].trim());
  }

  const avgSentLen = totalSentences > 0 ? totalWords / totalSentences : 15;
  const sentenceStyle = avgSentLen < 12 ? "concise" : avgSentLen > 20 ? "elaborate" : "mixed";
  const emojiPref = emojiCount === 0 ? "none" : emojiCount < 3 ? "minimal" : "frequent";
  const directness = joined.match(/\b(I think|perhaps|maybe|possibly|might)\b/gi)
    ? "diplomatic" : "direct";

  return {
    id: `style-rule-${Date.now()}`,
    persona: "learned",
    toneRules: ["Match the author's natural writing style"],
    bannedPhrases: [],
    signoffPatterns: [...new Set(signoffs)].slice(0, 3) || ["Best,"],
    greetingPatterns: [...new Set(greetings)].slice(0, 3),
    emojiPreference: emojiPref,
    sentenceStyle,
    directness,
    hedgeWords: [],
  };
}
