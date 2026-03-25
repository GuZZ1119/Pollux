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

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ProviderIcon provider={account.provider} />
        <div>
          <p className="text-sm font-medium text-gray-900 capitalize">{account.provider}</p>
          <p className="text-xs text-gray-500">Last sync: {syncTime}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AccountStatusBadge status={account.status} />
        {/* TODO: Add connect/disconnect button wired to Auth0 OAuth flow */}
        <button className="text-xs text-blue-600 hover:underline" disabled>
          Manage
        </button>
      </div>
    </div>
  );
}
