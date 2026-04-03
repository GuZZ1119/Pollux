export type Provider = "gmail" | "slack" | "outlook";
export type AutomationLevel = "DRAFT_ONLY" | "ONE_CLICK" | "AUTO_ALLOWLIST";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AccountStatus = "CONNECTED" | "DISCONNECTED" | "PENDING";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  defaultPersona: string;
  automationLevel: AutomationLevel;
}

export interface ConnectedAccount {
  id: string;
  provider: Provider;
  scopes: string[];
  status: AccountStatus;
  lastSyncAt: string | null;
}

export interface StyleCard {
  id: string;
  persona: string;
  toneRules: string[];
  bannedPhrases: string[];
  signoffPatterns: string[];
  emojiPreference: string;
  sentenceStyle: string;
  greetingPatterns?: string[];
  directness?: string;
  hedgeWords?: string[];
}

export interface StyleExample {
  id: string;
  persona: string;
  sourceProvider: string;
  text: string;
  intent?: string;
  lengthBucket?: "short" | "medium" | "long";
}

export type StyleSource = "preset" | "gmail_sent" | "manual_samples" | "mixed";

export interface UserStyleProfile {
  styleCard: StyleCard;
  examples: StyleExample[];
  guardrails: string[];
  source: StyleSource;
  exampleCount: number;
  updatedAt: string;
}

export interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export interface MessageItem {
  id: string;
  provider: Provider;
  threadId: string;
  sender: string;
  subject?: string;
  snippet: string;
  content: string;
  htmlContent?: string;
  attachments?: Attachment[];
  timestamp: string;
  riskLevel: RiskLevel;
  status: string;
}

export interface InboxFetchOptions {
  limit?: number;
  filter?: "primary" | "all";
  cursor?: string;
}

export interface ReplyCandidate {
  id: string;
  text: string;
  explanation: string;
  confidence: number;
}

export interface SendLog {
  id: string;
  messageId: string;
  mode: string;
  approvedByUser: boolean;
  sentAt: string;
  result: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SessionUser {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

// --- Daily Brief / Summary ---

export interface AttentionItem {
  messageId: string;
  provider: string;
  sender: string;
  subject?: string;
  reason: string;
  riskLevel: RiskLevel;
}

export interface ActionItem {
  id: string;
  type: string;
  description: string;
  sourceMessageId: string;
  sourceProvider: string;
  sender: string;
  priority: "high" | "medium" | "low";
}

export interface ProviderCount {
  provider: string;
  total: number;
  unread: number;
}

export interface DailyBrief {
  headline: string;
  summaryText: string;
  totalToday: number;
  totalAll: number;
  periodLabel: string;
  providerCounts: ProviderCount[];
  attentionItems: AttentionItem[];
  actionItems: ActionItem[];
  generatedAt: string;
  sourceMode: "rule_based" | "ai_generated" | "fallback";
}
