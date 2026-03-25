"use client";

import { useState } from "react";
import type { ConnectedAccount, AutomationLevel } from "@/lib/types";
import { AccountStatusCard } from "./account-status-card";
import { mockStyleCard } from "@/lib/mocks/style";

interface Props {
  accounts: ConnectedAccount[];
}

const automationOptions: { value: AutomationLevel; label: string; desc: string }[] = [
  { value: "DRAFT_ONLY", label: "Draft Only", desc: "AI generates drafts, you review and send manually" },
  { value: "ONE_CLICK", label: "One-Click Send", desc: "AI generates replies, you approve with one click" },
  { value: "AUTO_ALLOWLIST", label: "Auto (Allowlist)", desc: "Auto-send for low-risk contacts on your allowlist" },
];

export function SettingsPanel({ accounts }: Props) {
  const [level, setLevel] = useState<AutomationLevel>("DRAFT_ONLY");

  return (
    <div className="space-y-8">
      {/* Connected Accounts */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Connected Accounts</h2>
        <p className="text-sm text-gray-500 mb-4">
          {/* TODO: Auth0 Token Vault will manage OAuth tokens for each provider */}
          Manage your email and messaging integrations.
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

      {/* Future integration placeholder */}
      <section className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-1">Coming Soon</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Auth0 Universal Login for secure authentication</li>
          <li>• Token Vault for managing OAuth tokens per provider</li>
          <li>• Real-time Gmail & Slack sync via webhooks</li>
          <li>• Custom style training from your sent messages</li>
        </ul>
      </section>
    </div>
  );
}
