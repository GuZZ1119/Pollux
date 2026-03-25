import type { RiskLevel, AccountStatus } from "@/lib/types";

const riskColors: Record<RiskLevel, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

const statusColors: Record<AccountStatus, string> = {
  CONNECTED: "bg-green-100 text-green-700",
  DISCONNECTED: "bg-gray-100 text-gray-500",
  PENDING: "bg-yellow-100 text-yellow-700",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${riskColors[level]}`}>
      {level}
    </span>
  );
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  );
}
