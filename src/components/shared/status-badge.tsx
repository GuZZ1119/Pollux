import type { RiskLevel, AccountStatus } from "@/lib/types";

const riskConfig: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  LOW: { bg: "bg-green-50", text: "text-green-600", label: "Low" },
  MEDIUM: { bg: "bg-amber-50", text: "text-amber-600", label: "Medium" },
  HIGH: { bg: "bg-red-50", text: "text-red-600", label: "High" },
};

const statusConfig: Record<AccountStatus, { bg: string; text: string; dot: string }> = {
  CONNECTED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  DISCONNECTED: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-300" },
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const c = riskConfig[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      {level === "HIGH" && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
        </svg>
      )}
      {c.label}
    </span>
  );
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status === "CONNECTED" ? "Connected" : status === "PENDING" ? "Pending" : "Disconnected"}
    </span>
  );
}
