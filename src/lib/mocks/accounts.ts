import type { ConnectedAccount } from "@/lib/types";

export const mockAccounts: ConnectedAccount[] = [
  {
    id: "acc-gmail-1",
    provider: "gmail",
    scopes: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"],
    status: "CONNECTED",
    lastSyncAt: "2026-03-25T08:30:00Z",
  },
  {
    id: "acc-slack-1",
    provider: "slack",
    scopes: ["channels:history", "chat:write", "users:read"],
    status: "CONNECTED",
    lastSyncAt: "2026-03-25T09:15:00Z",
  },
];
