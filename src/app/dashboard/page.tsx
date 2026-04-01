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
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm px-6">
          <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-accent-subtle flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Sign in to continue</p>
          <p className="text-[13px] text-ink-tertiary mb-6 leading-relaxed">
            Pollux summarizes your communications and helps you respond faster.
          </p>
          <a
            href="/auth/login"
            className="inline-block px-5 py-2.5 bg-accent text-white text-[13px] font-medium rounded-lg hover:bg-accent-hover transition-colors"
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
    <div className="max-w-2xl mx-auto px-8 py-10">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">
          {greeting}, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-[13px] text-ink-tertiary mt-1">{dateStr}</p>
      </div>

      {/* Daily Brief */}
      <div className="mb-10">
        <DailyBriefCard />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <Link
          href="/inbox"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:border-accent/30 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink">Open Inbox</p>
            <p className="text-[11px] text-ink-tertiary">View & reply to messages</p>
          </div>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:border-border hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-subtle flex items-center justify-center group-hover:bg-border transition-colors">
            <svg className="w-4 h-4 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink">Settings</p>
            <p className="text-[11px] text-ink-tertiary">Integrations & style</p>
          </div>
        </Link>
      </div>

      {/* Connections */}
      <div className="border border-border rounded-xl bg-surface p-5">
        <h3 className="text-[13px] font-medium text-ink mb-3">Connections</h3>
        <div className="space-y-2">
          {[
            { name: "Gmail", connected: gmailConnected, url: "/api/auth/gmail/connect" },
            { name: "Slack", connected: slackConnected, url: "/api/auth/slack/connect" },
            { name: "Outlook", connected: false, url: null },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <span className={`w-[6px] h-[6px] rounded-full ${p.connected ? "bg-positive" : "bg-ink-faint"}`} />
                <span className="text-[13px] text-ink-secondary">{p.name}</span>
              </div>
              {p.url && !p.connected ? (
                <a href={p.url} className="text-[12px] font-medium text-accent hover:text-accent-hover transition-colors">
                  Connect
                </a>
              ) : p.connected ? (
                <span className="text-[11px] text-positive font-medium">Connected</span>
              ) : (
                <span className="text-[10px] text-ink-faint bg-subtle px-1.5 py-0.5 rounded">Planned</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
