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
  const isOutlook = account.provider === "outlook";
  const isConnected = account.status === "CONNECTED";

  const connectUrl = isGmail
    ? "/api/auth/gmail/connect"
    : isSlack
      ? "/api/auth/slack/connect"
      : isOutlook
        ? "/api/auth/outlook/connect"
        : undefined;

  const icon = isGmail ? (
    <svg className="w-4 h-4 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.093L2.25 6.75" />
    </svg>
  ) : isSlack ? (
    <svg className="w-4 h-4 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      isConnected ? "border-positive/20 bg-positive-subtle" : "border-border bg-surface"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isConnected ? "bg-positive/10" : "bg-subtle"
          }`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-ink capitalize">{account.provider}</p>
              {isOutlook && (
                <span className="text-[9px] font-medium text-accent bg-accent-subtle px-1.5 py-px rounded">
                  Token Vault
                </span>
              )}
            </div>
            {isConnected && syncTime ? (
              <p className="text-[11px] text-ink-tertiary">Synced {syncTime}</p>
            ) : isConnected ? (
              <p className="text-[11px] text-positive">Active</p>
            ) : (
              <p className="text-[11px] text-ink-faint">Not connected</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <AccountStatusBadge status={account.status} />
          {connectUrl && !isConnected && (
            <a
              href={connectUrl}
              className="px-3 py-1.5 bg-accent text-white text-[11px] font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Connect
            </a>
          )}
          {connectUrl && isConnected && (
            <a
              href={connectUrl}
              className="text-[11px] text-ink-faint hover:text-accent transition-colors"
            >
              Reconnect
            </a>
          )}
        </div>
      </div>
      {isConnected && account.scopes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-positive/10">
          <div className="flex flex-wrap gap-1">
            {account.scopes.filter(s => s).map((scope, i) => {
              const short = scope.split("/").pop() ?? scope;
              return (
                <span key={i} className="text-[10px] bg-positive/10 text-positive px-1.5 py-0.5 rounded">
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
