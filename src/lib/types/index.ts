export type Provider = "gmail" | "slack";
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
}

export interface StyleExample {
  id: string;
  persona: string;
  sourceProvider: Provider;
  text: string;
}

export interface MessageItem {
  id: string;
  provider: Provider;
  threadId: string;
  sender: string;
  subject?: string;
  snippet: string;
  content: string;
  timestamp: string;
  riskLevel: RiskLevel;
  status: string;
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
