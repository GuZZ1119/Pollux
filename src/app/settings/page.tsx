import { auth0 } from "@/lib/auth0";
import { getConnectedAccounts } from "@/lib/services/account-service";
import { SettingsPanel } from "@/components/settings/settings-panel";
import type { SessionUser } from "@/lib/types";

export default async function SettingsPage() {
  const session = await auth0.getSession();

  const user: SessionUser | null = session
    ? { sub: session.user.sub, name: session.user.name, email: session.user.email, picture: session.user.picture }
    : null;

  const accounts = await getConnectedAccounts(user?.sub);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-8 py-10">
        <h1 className="text-xl font-semibold text-ink mb-1">Settings</h1>
        <p className="text-[13px] text-ink-tertiary mb-8">Configure your Pollux preferences.</p>
        <div className="border border-border rounded-xl bg-surface p-10 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-subtle flex items-center justify-center">
            <svg className="w-5 h-5 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-ink mb-1">Sign in to get started</p>
          <p className="text-[13px] text-ink-tertiary mb-6">Connect accounts and personalize your AI reply style.</p>
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

  return (
    <div className="max-w-xl mx-auto px-8 py-10">
      <h1 className="text-xl font-semibold text-ink tracking-tight mb-1">Settings</h1>
      <p className="text-[13px] text-ink-tertiary mb-8">
        Integrations, preferences, and writing style.
      </p>
      <SettingsPanel accounts={accounts} user={user} />
    </div>
  );
}
