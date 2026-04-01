"use client";

import { useState } from "react";
import type { ConnectedAccount, AutomationLevel, SessionUser } from "@/lib/types";
import { AccountStatusCard } from "./account-status-card";
import { StyleBuilder } from "./style-builder";
import { UserAvatar } from "@/components/shared/user-avatar";

interface Props {
  accounts: ConnectedAccount[];
  user: SessionUser | null;
}

const automationOptions: { value: AutomationLevel; label: string; desc: string }[] = [
  { value: "DRAFT_ONLY", label: "Draft Only", desc: "AI generates drafts — you review and send" },
  { value: "ONE_CLICK", label: "One-Click Send", desc: "AI generates replies — approve with one click" },
  { value: "AUTO_ALLOWLIST", label: "Auto (Allowlist)", desc: "Auto-send for trusted contacts" },
];

export function SettingsPanel({ accounts, user }: Props) {
  const [level, setLevel] = useState<AutomationLevel>("DRAFT_ONLY");

  const gmailAccount = accounts.find((a) => a.provider === "gmail");
  const gmailConnected = gmailAccount?.status === "CONNECTED";

  return (
    <div className="space-y-8">
      {/* Account */}
      <section className="border border-border rounded-xl bg-surface p-5">
        <h2 className="text-[13px] font-medium text-ink mb-4">Account</h2>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar src={user.picture} name={user.name} size="lg" />
              <div>
                <p className="text-[13px] font-medium text-ink">{user.name ?? "User"}</p>
                <p className="text-[12px] text-ink-tertiary">{user.email}</p>
              </div>
            </div>
            <a
              href="/auth/logout"
              className="text-[12px] text-ink-faint hover:text-danger transition-colors"
            >
              Sign out
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-ink-tertiary">Not signed in</p>
            <a
              href="/auth/login"
              className="px-4 py-2 bg-accent text-white text-[12px] font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Sign in
            </a>
          </div>
        )}
      </section>

      {/* Integrations */}
      <section>
        <h2 className="text-[13px] font-medium text-ink mb-1">Integrations</h2>
        <p className="text-[12px] text-ink-tertiary mb-4">
          {gmailConnected
            ? "Gmail is connected and syncing."
            : "Connect Gmail or Slack to use Pollux."}
        </p>
        <div className="space-y-2">
          {accounts.map((acc) => (
            <AccountStatusCard key={acc.id} account={acc} />
          ))}
        </div>
      </section>

      {/* Automation */}
      <section>
        <h2 className="text-[13px] font-medium text-ink mb-1">Automation</h2>
        <p className="text-[12px] text-ink-tertiary mb-4">
          How Pollux handles reply generation and sending.
        </p>
        <div className="space-y-1.5">
          {automationOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                level === opt.value
                  ? "border-accent bg-accent-subtle"
                  : "border-border hover:border-border bg-surface"
              }`}
            >
              <input
                type="radio"
                name="automation"
                value={opt.value}
                checked={level === opt.value}
                onChange={() => setLevel(opt.value)}
                className="mt-0.5 accent-accent"
              />
              <div>
                <p className="text-[13px] font-medium text-ink">{opt.label}</p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Style */}
      <section>
        <StyleBuilder gmailConnected={gmailConnected} />
      </section>
    </div>
  );
}
