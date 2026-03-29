import type { RiskLevel } from "@/lib/types";

const HIGH_PATTERNS =
  /\b(invoice|payment|wire\s*transfer|bank\s*account|overdue|urgent|asap|deadline|contract|nda|legal|lawsuit|interview|offer\s*letter|confidential|immediate\s*action|penalty|suspend|terminat|fraud|phishing|verify\s*your\s*account)\b/i;

const MEDIUM_PATTERNS =
  /\b(by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|eod|cob|end\s+of\s+day)|action\s+required|please\s+respond|follow[\s-]*up|time[\s.-]*sensitive|due\s+date|expir|remind|schedul|review\s+needed|board\s+meeting|escalat|blocking|approval\s+needed)\b/i;

export interface RiskInput {
  sender: string;
  subject?: string;
  content: string;
  provider: string;
}

/**
 * Rule-based risk classification. Designed as a standalone function so it can
 * be swapped for an ML classifier later without touching the adapter layer.
 */
export function classifyRisk(input: RiskInput): RiskLevel {
  const text = `${input.subject ?? ""} ${input.content}`;

  if (HIGH_PATTERNS.test(text)) return "HIGH";
  if (MEDIUM_PATTERNS.test(text)) return "MEDIUM";

  return "LOW";
}
