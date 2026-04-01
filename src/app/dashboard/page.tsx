import { auth0 } from "@/lib/auth0";
import { getConnectedAccounts } from "@/lib/services/account-service";
import type { SessionUser } from "@/lib/types";
import { DailyBriefCard } from "@/components/dashboard/daily-brief-card";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth0.getSession();

  const user: SessionUser | null = session
    ? { sub: session.user.sub, name: session.user.name, email: session.user.email, picture: session.user.picture }
    : null;

  if (!user) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pollux</h1>
        <p className="text-sm text-gray-500 mb-6">AI Communication Copilot</p>
        <div className="border border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-1">Sign in to see your Daily Brief</p>
          <p className="text-sm text-gray-400 mb-5">Pollux summarizes your communications and helps you respond faster.</p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const accounts = await getConnectedAccounts(user.sub);
  const gmailConnected = accounts.some((a) => a.provider === "gmail" && a.status === "CONNECTED");
  const slackConnected = accounts.some((a) => a.provider === "slack" && a.status === "CONNECTED");

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{dateStr}</p>
      </div>

      {/* Daily Brief */}
      <div className="mb-8">
        <DailyBriefCard />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/inbox"
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Open Inbox</p>
            <p className="text-xs text-gray-400">View messages & generate replies</p>
          </div>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Settings</p>
            <p className="text-xs text-gray-400">Integrations & style config</p>
          </div>
        </Link>
      </div>

      {/* Connection status */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Connection Status</h3>
        <div className="grid gap-2.5 text-sm">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${gmailConnected ? "bg-green-400" : "bg-gray-300"}`} />
              <span className="text-gray-600">Gmail</span>
            </div>
            <span className={`text-xs font-medium ${gmailConnected ? "text-green-600" : "text-gray-400"}`}>
              {gmailConnected ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${slackConnected ? "bg-green-400" : "bg-gray-300"}`} />
              <span className="text-gray-600">Slack</span>
            </div>
            <span className={`text-xs font-medium ${slackConnected ? "text-green-600" : "text-gray-400"}`}>
              {slackConnected ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-gray-600">Outlook</span>
            </div>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">planned</span>
          </div>
        </div>
        {(!gmailConnected || !slackConnected) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
            {!gmailConnected && (
              <a href="/api/auth/gmail/connect" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                Connect Gmail to see your Daily Brief →
              </a>
            )}
            {!slackConnected && (
              <a href="/api/auth/slack/connect" className="text-xs font-medium text-purple-600 hover:text-purple-800">
                Connect Slack for team messages →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
