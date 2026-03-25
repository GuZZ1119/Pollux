import { getConnectedAccounts } from "@/lib/services/account-service";
import { getAggregatedInbox } from "@/lib/services/inbox-service";
import { mockUser } from "@/lib/mocks/user";

export default async function DashboardPage() {
  const [accounts, messages] = await Promise.all([getConnectedAccounts(), getAggregatedInbox()]);

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const highRiskCount = messages.filter((m) => m.riskLevel === "HIGH").length;

  const cards = [
    { label: "Connected Accounts", value: accounts.length, color: "bg-blue-50 text-blue-700" },
    { label: "Inbox Messages", value: messages.length, color: "bg-purple-50 text-purple-700" },
    { label: "Unread", value: unreadCount, color: "bg-yellow-50 text-yellow-700" },
    { label: "High Risk", value: highRiskCount, color: "bg-red-50 text-red-700" },
  ];

  const automationLabels: Record<string, string> = {
    DRAFT_ONLY: "Draft Only — you review every reply",
    ONE_CLICK: "One-Click — approve with one tap",
    AUTO_ALLOWLIST: "Auto — low-risk contacts auto-send",
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Welcome back, {mockUser.name}</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Status Section */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Project Status</h2>

        <div className="grid gap-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Automation Level</span>
            <span className="font-medium text-gray-900">
              {automationLabels[mockUser.automationLevel] ?? mockUser.automationLevel}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Default Persona</span>
            <span className="font-medium text-gray-900 capitalize">{mockUser.defaultPersona}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Gmail</span>
            <span className="font-medium text-green-600">Connected</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Slack</span>
            <span className="font-medium text-green-600">Connected</span>
          </div>
        </div>
      </div>

      {/* Roadmap placeholder */}
      <div className="mt-6 border border-dashed border-gray-300 rounded-xl p-5 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Next Milestones</h3>
        <ul className="text-xs text-gray-500 space-y-1.5">
          <li>☐ Auth0 Universal Login integration</li>
          <li>☐ Real Gmail API inbox sync</li>
          <li>☐ Slack Events API for real-time messages</li>
          <li>☐ OpenAI-powered reply generation with StyleCard</li>
          <li>☐ Risk scoring engine</li>
        </ul>
      </div>
    </div>
  );
}
