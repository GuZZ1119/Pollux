"use client";

import type { ConnectedAccount } from "@/lib/types";
import { AccountStatusBadge } from "@/components/shared/status-badge";

interface Props {
  account: ConnectedAccount;
}

export function AccountStatusCard({ account }: Props) {
  const syncTime = account.lastSyncAt
    ? new Date(account.lastSyncAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })
    : null;

  const isGmail = account.provider === "gmail";
  const isSlack = account.provider === "slack";
  const isConnected = account.status === "CONNECTED";

  const connectUrl = isGmail
    ? "/api/auth/gmail/connect"
    : isSlack
      ? "/api/auth/slack/connect"
      : undefined;

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      isConnected ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
            isConnected
              ? isGmail ? "bg-red-100" : "bg-purple-100"
              : "bg-gray-100"
          }`}>
            {isGmail ? "\u2709\uFE0F" : "\uD83D\uDCAC"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 capitalize">{account.provider}</p>
            </div>
            {isConnected && syncTime ? (
              <p className="text-xs text-gray-500">Last synced {syncTime}</p>
            ) : isConnected ? (
              <p className="text-xs text-green-600">Active connection</p>
            ) : (
              <p className="text-xs text-gray-400">Not connected</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AccountStatusBadge status={account.status} />
          {connectUrl && !isConnected && (
            <a
              href={connectUrl}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect
            </a>
          )}
          {connectUrl && isConnected && (
            <a
              href={connectUrl}
              className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              Reconnect
            </a>
          )}
        </div>
      </div>
      {isConnected && account.scopes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-100">
          <div className="flex flex-wrap gap-1">
            {account.scopes.filter(s => s).map((scope, i) => {
              const short = scope.split("/").pop() ?? scope;
              return (
                <span key={i} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  {short}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
