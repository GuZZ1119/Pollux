import type { StyleCard } from "@/lib/types";

export const mockStyleCard: StyleCard = {
  id: "style-1",
  persona: "professional",
  toneRules: [
    "Keep a warm but professional tone",
    "Avoid overly casual language in external emails",
    "Use active voice when possible",
  ],
  bannedPhrases: ["ASAP", "per my last email", "circle back", "synergy"],
  signoffPatterns: ["Best,", "Thanks,", "Cheers,"],
  emojiPreference: "minimal",
  sentenceStyle: "concise",
};
