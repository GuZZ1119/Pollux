import type { RiskLevel, AccountStatus } from "@/lib/types";

const riskConfig: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  LOW: { bg: "bg-subtle", text: "text-ink-tertiary", label: "Low" },
  MEDIUM: { bg: "bg-caution-subtle", text: "text-caution", label: "Medium" },
  HIGH: { bg: "bg-danger-subtle", text: "text-danger", label: "High" },
};

const statusConfig: Record<AccountStatus, { bg: string; text: string; dot: string }> = {
  CONNECTED: { bg: "bg-positive-subtle", text: "text-positive", dot: "bg-positive" },
  DISCONNECTED: { bg: "bg-subtle", text: "text-ink-tertiary", dot: "bg-ink-faint" },
  PENDING: { bg: "bg-caution-subtle", text: "text-caution", dot: "bg-caution" },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const c = riskConfig[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status === "CONNECTED" ? "Connected" : status === "PENDING" ? "Pending" : "Disconnected"}
    </span>
  );
}
