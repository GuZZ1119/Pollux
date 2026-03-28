"use client";

import type { ConnectedAccount } from "@/lib/types";
import { AccountStatusBadge } from "@/components/shared/status-badge";
import { ProviderIcon } from "@/components/shared/provider-icon";

interface Props {
  account: ConnectedAccount;
}

export function AccountStatusCard({ account }: Props) {
  const syncTime = account.lastSyncAt
    ? new Date(account.lastSyncAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })
    : "Never";

  const isGmail = account.provider === "gmail";
  const canConnect = isGmail && account.status !== "CONNECTED";
  const canDisconnect = isGmail && account.status === "CONNECTED";

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ProviderIcon provider={account.provider} />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 capitalize">{account.provider}</p>
            {!isGmail && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">mock</span>
            )}
          </div>
          <p className="text-xs text-gray-500">Last sync: {syncTime}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AccountStatusBadge status={account.status} />
        {canConnect && (
          <a
            href="/api/auth/gmail/connect"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            Connect
          </a>
        )}
        {canDisconnect && (
          <span className="text-xs text-green-600 font-medium">Live</span>
        )}
        {!isGmail && (
          <button className="text-xs text-gray-400 cursor-not-allowed" disabled>
            Coming soon
          </button>
        )}
      </div>
    </div>
  );
}
