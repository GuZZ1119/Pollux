"use client";

import { useState } from "react";
import type { ConnectedAccount, AutomationLevel, SessionUser } from "@/lib/types";
import { AccountStatusCard } from "./account-status-card";
import { mockStyleCard } from "@/lib/mocks/style";

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
      {/* Auth Status */}
      <section className="border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Account</h2>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name ?? "User"}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <a
              href="/auth/logout"
              className="text-xs text-gray-500 hover:text-red-600 hover:underline transition-colors"
            >
              Sign out
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Not signed in</p>
            <a
              href="/auth/login"
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
            >
              Sign in
            </a>
          </div>
        )}
      </section>

      {/* Connected Accounts */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Connected Accounts</h2>
        <p className="text-sm text-gray-500 mb-4">
          {gmailConnected
            ? "Gmail is connected via Google OAuth. Slack integration coming soon."
            : "Connect your Gmail account to start using Pollux with real emails."}
        </p>
        <div className="space-y-3">
          {accounts.map((acc) => (
            <AccountStatusCard key={acc.id} account={acc} />
          ))}
        </div>
      </section>

      {/* Automation Level */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Automation Level</h2>
        <div className="space-y-2">
          {automationOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                level === opt.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="automation"
                value={opt.value}
                checked={level === opt.value}
                onChange={() => setLevel(opt.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Style / Persona */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Communication Style</h2>
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Persona</p>
            <p className="text-sm text-gray-900 capitalize">{mockStyleCard.persona}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Tone Rules</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {mockStyleCard.toneRules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Banned Phrases</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {mockStyleCard.bannedPhrases.map((p, i) => (
                <span key={i} className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Sign-off Patterns</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {mockStyleCard.signoffPatterns.map((s, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integration status */}
      <section className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-1">Integration Status</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>✅ Auth0 Universal Login — active</li>
          <li>{gmailConnected ? "✅" : "☐"} Gmail OAuth — {gmailConnected ? "connected" : "not connected"}</li>
          <li>☐ Slack — mock only (coming soon)</li>
          <li>☐ OpenAI reply generation — next milestone</li>
          <li>☐ Token Vault / DB persistence — planned</li>
        </ul>
      </section>
    </div>
  );
}
