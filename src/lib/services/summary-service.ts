import type {
  MessageItem,
  DailyBrief,
  AttentionItem,
  ActionItem,
  ProviderCount,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Timezone config
// ---------------------------------------------------------------------------

const TIMEZONE = "Australia/Sydney";
const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE });

function isToday(ts: string): boolean {
  try {
    const msgDate = new Date(ts);
    if (isNaN(msgDate.getTime())) return false;
    return dayFormatter.format(msgDate) === dayFormatter.format(new Date());
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Action-item extraction patterns (provider-agnostic)
// ---------------------------------------------------------------------------

const ACTION_PATTERNS: { pattern: RegExp; type: string; verb: string }[] = [
  { pattern: /\b(invoice|payment|billing|wire\s*transfer|receipt|overdue)\b/i, type: "payment", verb: "Process payment" },
  { pattern: /\b(deadline|due\s+date|due\s+by)\b/i, type: "deadline", verb: "Review deadline" },
  { pattern: /\b(interview|screening|phone\s+screen)\b/i, type: "interview", verb: "Prepare for interview" },
  { pattern: /\b(contract|nda|agreement|terms)\b/i, type: "contract", verb: "Review document" },
  { pattern: /\b(follow[\s-]*up|get\s+back|circle\s+back|ping\s+back)\b/i, type: "follow_up", verb: "Follow up" },
  { pattern: /\b(meeting|calendar|schedule|appointment|sync)\b/i, type: "meeting", verb: "Check schedule" },
  { pattern: /\b(delivery|shipping|tracking|package|shipment)\b/i, type: "delivery", verb: "Track delivery" },
  { pattern: /\b(test|testing|QA|staging|deploy|release)\b/i, type: "review", verb: "Review & test" },
  { pattern: /\b(proposal|quote|estimate|pricing)\b/i, type: "proposal", verb: "Review proposal" },
  { pattern: /\b(approval|approve|sign[\s-]*off)\b/i, type: "approval", verb: "Give approval" },
];

function extractName(sender: string): string {
  const match = sender.match(/^([^<]+)</);
  if (match) return match[1].trim();
  return sender.split("@")[0];
}

// ---------------------------------------------------------------------------
// Core aggregation
// ---------------------------------------------------------------------------

function computeProviderCounts(msgs: MessageItem[]): ProviderCount[] {
  const map = new Map<string, { total: number; unread: number }>();
  for (const m of msgs) {
    const entry = map.get(m.provider) ?? { total: 0, unread: 0 };
    entry.total++;
    if (m.status === "unread") entry.unread++;
    map.set(m.provider, entry);
  }
  return [...map.entries()]
    .map(([provider, c]) => ({ provider, ...c }))
    .sort((a, b) => b.total - a.total);
}

function extractActionItems(msgs: MessageItem[]): ActionItem[] {
  const items: ActionItem[] = [];
  const seenPerMsg = new Set<string>();
  const seenCross = new Set<string>();

  for (const m of msgs) {
    const text = `${m.subject ?? ""} ${m.content}`;
    const senderName = extractName(m.sender);

    for (const ap of ACTION_PATTERNS) {
      if (!ap.pattern.test(text)) continue;

      const msgKey = `${m.id}:${ap.type}`;
      if (seenPerMsg.has(msgKey)) continue;
      seenPerMsg.add(msgKey);

      const crossKey = `${ap.type}:${senderName.toLowerCase()}:${(m.subject ?? "").slice(0, 50).toLowerCase()}`;
      if (seenCross.has(crossKey)) continue;
      seenCross.add(crossKey);

      let description: string;
      if (m.subject) {
        description = `${ap.verb}: ${m.subject}`;
        if (!m.subject.toLowerCase().includes(senderName.toLowerCase().split(" ")[0].toLowerCase())) {
          description += ` (from ${senderName})`;
        }
      } else {
        description = `${ap.verb} with ${senderName}`;
      }

      items.push({
        id: `action-${Date.now()}-${items.length}`,
        type: ap.type,
        description,
        sourceMessageId: m.id,
        sourceProvider: m.provider,
        sender: senderName,
        priority: m.riskLevel === "HIGH" ? "high" : m.riskLevel === "MEDIUM" ? "medium" : "low",
      });
    }
  }

  return items
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    })
    .slice(0, 10);
}

/**
 * Scoring-based attention extraction.
 * HIGH risk always qualifies regardless of read status.
 */
function extractAttentionItems(msgs: MessageItem[], actionMsgIds: Set<string>): AttentionItem[] {
  const scored = msgs.map((m) => {
    let score = 0;
    if (m.riskLevel === "HIGH") score += 10;
    else if (m.riskLevel === "MEDIUM") score += 5;
    if (m.status === "unread") score += 3;
    if (actionMsgIds.has(m.id)) score += 2;
    return { m, score };
  });

  return scored
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ m }) => {
      let reason: string;
      if (m.riskLevel === "HIGH" && m.status === "unread") reason = "High-risk, unread";
      else if (m.riskLevel === "HIGH") reason = "High-risk — requires attention";
      else if (m.riskLevel === "MEDIUM" && m.status === "unread") reason = "Medium-risk, unread";
      else if (m.riskLevel === "MEDIUM") reason = "Medium-risk — action may be needed";
      else if (m.status === "unread") reason = "Unread — new message";
      else reason = "Has pending action items";
      return {
        messageId: m.id,
        provider: m.provider,
        sender: extractName(m.sender),
        subject: m.subject,
        reason,
        riskLevel: m.riskLevel,
      };
    });
}

// ---------------------------------------------------------------------------
// Rule-based natural-language summary
// ---------------------------------------------------------------------------

function generateRuleSummary(
  msgs: MessageItem[],
  providerCounts: ProviderCount[],
  attentionItems: AttentionItem[],
  actionItems: ActionItem[],
  periodLabel: string,
): string {
  if (msgs.length === 0) {
    return "No messages to summarize. Connect your accounts and check back later.";
  }

  const parts: string[] = [];

  const providerList = providerCounts.map((p) => `${p.total} from ${p.provider}`).join(", ");
  parts.push(
    `You received ${msgs.length} message${msgs.length === 1 ? "" : "s"} ${periodLabel.toLowerCase()} — ${providerList}.`,
  );

  const highCount = attentionItems.filter((a) => a.riskLevel === "HIGH").length;
  const medCount = attentionItems.filter((a) => a.riskLevel === "MEDIUM").length;
  if (highCount > 0 || medCount > 0) {
    const attnParts: string[] = [];
    if (highCount > 0) attnParts.push(`${highCount} high-risk`);
    if (medCount > 0) attnParts.push(`${medCount} medium-risk`);
    parts.push(`${attnParts.join(" and ")} item${highCount + medCount === 1 ? " needs" : "s need"} your attention.`);

    const topItem = attentionItems[0];
    if (topItem) {
      parts.push(`The most urgent is ${topItem.subject ? `"${topItem.subject}"` : "a message"} from ${topItem.sender}.`);
    }
  } else {
    parts.push("All messages are low priority — nothing urgent.");
  }

  if (actionItems.length > 0) {
    const types = [...new Set(actionItems.map((a) => a.type))];
    parts.push(
      `${actionItems.length} action item${actionItems.length === 1 ? "" : "s"} detected, including ${types.slice(0, 3).join(", ")}.`,
    );
  }

  return parts.join(" ");
}

function generateHeadline(msgs: MessageItem[], attention: AttentionItem[]): string {
  if (msgs.length === 0) return "All clear — no new messages";
  const highCount = attention.filter((a) => a.riskLevel === "HIGH").length;
  if (highCount > 0) {
    return `${highCount} urgent item${highCount > 1 ? "s" : ""} need your attention`;
  }
  if (attention.length > 0) {
    return `${attention.length} item${attention.length > 1 ? "s" : ""} to review`;
  }
  return `${msgs.length} message${msgs.length > 1 ? "s" : ""} — all clear`;
}

// ---------------------------------------------------------------------------
// AI-powered summary (strictly grounded, no fabrication)
// ---------------------------------------------------------------------------

async function generateAISummary(
  msgs: MessageItem[],
  attentionItems: AttentionItem[],
  actionItems: ActionItem[],
): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const client = new OpenAI({ apiKey });

  const msgList = msgs
    .slice(0, 20)
    .map((m, i) => `${i + 1}. [${m.provider}] From: ${extractName(m.sender)} | Subject: ${m.subject ?? "(none)"} | Risk: ${m.riskLevel} | ${m.status}`)
    .join("\n");

  const attnList = attentionItems
    .slice(0, 5)
    .map((a) => `- ${a.sender}: ${a.subject ?? "no subject"} (${a.riskLevel}) — ${a.reason}`)
    .join("\n");

  const actionList = actionItems
    .slice(0, 5)
    .map((a) => `- ${a.description} [${a.priority}]`)
    .join("\n");

  const prompt = `You are a concise executive assistant. Rewrite the following pre-extracted data into 2-3 natural, flowing sentences.

STRICT RULES — you MUST follow all of these:
- ONLY mention facts explicitly present in the data below.
- Do NOT invent, infer, or speculate about any information not provided.
- Do NOT add people, events, dates, numbers, or details that are not listed.
- Do NOT present uncertain information as definitive.
- Do NOT expand acronyms or guess the meaning of subjects.
- If data is sparse, write a shorter summary. Never pad with fabricated detail.
- Your role is to REPHRASE the provided facts — NOT to add new insights.

Messages (${msgs.length} total):
${msgList}

Needs attention:
${attnList || "(none)"}

Action items:
${actionList || "(none)"}

Rewrite the above into a brief, actionable paragraph. No bullet points, no headers — just flowing prose.`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty AI response");
  return text;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SummaryOptions {
  useAI?: boolean;
}

export async function generateDailyBrief(
  allMessages: MessageItem[],
  options?: SummaryOptions,
): Promise<DailyBrief> {
  const todayMsgs = allMessages.filter((m) => isToday(m.timestamp));
  const useToday = todayMsgs.length > 0;
  const msgs = useToday ? todayMsgs : allMessages;
  const periodLabel = useToday ? "today" : "recently";

  const providerCounts = computeProviderCounts(msgs);
  const actionItems = extractActionItems(msgs);
  const actionMsgIds = new Set(actionItems.map((a) => a.sourceMessageId));
  const attentionItems = extractAttentionItems(msgs, actionMsgIds);
  const headline = generateHeadline(msgs, attentionItems);

  let summaryText: string;
  let sourceMode: DailyBrief["sourceMode"];

  if (options?.useAI && msgs.length > 0) {
    try {
      summaryText = await generateAISummary(msgs, attentionItems, actionItems);
      sourceMode = "ai_generated";
    } catch {
      summaryText = generateRuleSummary(msgs, providerCounts, attentionItems, actionItems, periodLabel);
      sourceMode = "fallback";
    }
  } else {
    summaryText = generateRuleSummary(msgs, providerCounts, attentionItems, actionItems, periodLabel);
    sourceMode = "rule_based";
  }

  return {
    headline,
    summaryText,
    totalToday: todayMsgs.length,
    totalAll: allMessages.length,
    periodLabel: useToday ? "Today" : "Recent",
    providerCounts,
    attentionItems,
    actionItems,
    generatedAt: new Date().toISOString(),
    sourceMode,
  };
}
