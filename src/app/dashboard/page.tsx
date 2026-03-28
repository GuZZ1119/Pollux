import { auth0 } from "@/lib/auth0";
import { getConnectedAccounts } from "@/lib/services/account-service";
import { getAggregatedInbox } from "@/lib/services/inbox-service";
import type { SessionUser } from "@/lib/types";

export default async function DashboardPage() {
  const session = await auth0.getSession();

  const user: SessionUser | null = session
    ? { sub: session.user.sub, name: session.user.name, email: session.user.email, picture: session.user.picture }
    : null;

  if (!user) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 mb-4">Sign in to view your dashboard.</p>
          <a
            href="/auth/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const [accounts, messages] = await Promise.all([
    getConnectedAccounts(user.sub),
    getAggregatedInbox(user.sub),
  ]);

  const connectedCount = accounts.filter((a) => a.status === "CONNECTED").length;
  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const highRiskCount = messages.filter((m) => m.riskLevel === "HIGH").length;

  const gmailAccount = accounts.find((a) => a.provider === "gmail");
  const gmailStatus = gmailAccount?.status === "CONNECTED" ? "Connected" : "Not connected";
  const slackStatus = "Mock only";

  const cards = [
    { label: "Connected Accounts", value: connectedCount, color: "bg-blue-50 text-blue-700" },
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
      <p className="text-sm text-gray-500 mb-6">Welcome back, {user.name ?? "User"}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Project Status</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Automation Level</span>
            <span className="font-medium text-gray-900">{automationLabels["DRAFT_ONLY"]}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Default Persona</span>
            <span className="font-medium text-gray-900 capitalize">professional</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Gmail</span>
            <span className={`font-medium ${gmailAccount?.status === "CONNECTED" ? "text-green-600" : "text-gray-400"}`}>
              {gmailStatus}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Slack</span>
            <span className="font-medium text-gray-400">{slackStatus}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-dashed border-gray-300 rounded-xl p-5 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Next Milestones</h3>
        <ul className="text-xs text-gray-500 space-y-1.5">
          <li>✅ Auth0 Universal Login integration</li>
          <li>{gmailAccount?.status === "CONNECTED" ? "✅" : "☐"} Gmail OAuth connection</li>
          <li>{gmailAccount?.status === "CONNECTED" ? "✅" : "☐"} Real Gmail API inbox sync</li>
          <li>☐ OpenAI-powered reply generation with StyleCard</li>
          <li>☐ Slack Events API for real-time messages</li>
          <li>☐ Risk scoring engine</li>
        </ul>
      </div>
    </div>
  );
}
