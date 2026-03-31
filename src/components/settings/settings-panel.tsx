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
  { value: "DRAFT_ONLY", label: "Draft Only", desc: "AI generates drafts, you review and send manually" },
  { value: "ONE_CLICK", label: "One-Click Send", desc: "AI generates replies, you approve with one click" },
  { value: "AUTO_ALLOWLIST", label: "Auto (Allowlist)", desc: "Auto-send for low-risk contacts on your allowlist" },
];

export function SettingsPanel({ accounts, user }: Props) {
  const [level, setLevel] = useState<AutomationLevel>("DRAFT_ONLY");

  const gmailAccount = accounts.find((a) => a.provider === "gmail");
  const gmailConnected = gmailAccount?.status === "CONNECTED";

  return (
    <div className="space-y-8">
      {/* Account */}
      <section className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar src={user.picture} name={user.name} size="lg" className="ring-2 ring-gray-100" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name ?? "User"}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <a
              href="/auth/logout"
              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
            >
              Sign out
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Not signed in</p>
            <a
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
            >
              Sign in
            </a>
          </div>
        )}
      </section>

      {/* Integrations */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1">Integrations</h2>
        <p className="text-sm text-gray-500 mb-4">
          {gmailConnected
            ? "Gmail is connected and syncing your inbox."
            : "Connect Gmail to use Pollux with your real emails."}
        </p>
        <div className="space-y-3">
          {accounts.map((acc) => (
            <AccountStatusCard key={acc.id} account={acc} />
          ))}
        </div>
      </section>

      {/* Automation */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1">Automation Level</h2>
        <p className="text-sm text-gray-500 mb-4">
          Control how Pollux handles reply generation and sending.
        </p>
        <div className="space-y-2">
          {automationOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                level === opt.value
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="automation"
                value={opt.value}
                checked={level === opt.value}
                onChange={() => setLevel(opt.value)}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Style Personalization */}
      <section>
        <StyleBuilder gmailConnected={gmailConnected} />
      </section>
    </div>
  );
}
