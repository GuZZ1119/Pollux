import type { StyleCard } from "@/lib/types";

export const STYLE_PRESETS: Record<string, StyleCard> = {
  professional: {
    id: "preset-professional",
    persona: "professional",
    toneRules: [
      "Keep a warm but professional tone",
      "Use clear, structured language",
      "Be respectful of the reader's time",
    ],
    bannedPhrases: ["ASAP", "per my last email", "circle back", "synergy"],
    signoffPatterns: ["Best regards,", "Best,", "Thank you,"],
    greetingPatterns: ["Hi {name},", "Hello {name},", "Dear {name},"],
    emojiPreference: "none",
    sentenceStyle: "concise",
    directness: "balanced",
    hedgeWords: ["I believe", "it seems"],
  },
  friendly: {
    id: "preset-friendly",
    persona: "friendly",
    toneRules: [
      "Be warm, approachable, and genuine",
      "Use conversational language without being too casual",
      "Show enthusiasm where appropriate",
    ],
    bannedPhrases: ["per my last email", "as previously stated", "kindly"],
    signoffPatterns: ["Cheers,", "Thanks!", "Talk soon,"],
    greetingPatterns: ["Hey {name}!", "Hi {name}!", "Hi there,"],
    emojiPreference: "minimal",
    sentenceStyle: "mixed",
    directness: "diplomatic",
    hedgeWords: ["I think", "maybe", "just wanted to"],
  },
  concise: {
    id: "preset-concise",
    persona: "concise",
    toneRules: [
      "Keep replies as short as possible",
      "One point per sentence",
      "Skip pleasantries unless necessary",
    ],
    bannedPhrases: ["I hope this email finds you well", "just wanted to touch base", "at the end of the day"],
    signoffPatterns: ["Thanks,", "Best,", "—"],
    greetingPatterns: ["Hi,", "{name},", "Hi {name},"],
    emojiPreference: "none",
    sentenceStyle: "concise",
    directness: "direct",
    hedgeWords: [],
  },
  assertive: {
    id: "preset-assertive",
    persona: "assertive",
    toneRules: [
      "Be confident and action-oriented",
      "Use clear directives, not suggestions",
      "State expectations explicitly",
    ],
    bannedPhrases: ["sorry to bother", "if it's not too much trouble", "no worries if not"],
    signoffPatterns: ["Regards,", "Best,", "Thanks,"],
    greetingPatterns: ["Hi {name},", "{name},"],
    emojiPreference: "none",
    sentenceStyle: "concise",
    directness: "direct",
    hedgeWords: [],
  },
};

export const PRESET_META: { id: string; label: string; desc: string; icon: string }[] = [
  { id: "professional", label: "Professional", desc: "Warm but polished — ideal for business", icon: "💼" },
  { id: "friendly", label: "Friendly", desc: "Approachable and genuine — great for teams", icon: "😊" },
  { id: "concise", label: "Concise", desc: "Short and direct — respects everyone's time", icon: "⚡" },
  { id: "assertive", label: "Assertive", desc: "Confident and action-oriented — gets things done", icon: "🎯" },
];
