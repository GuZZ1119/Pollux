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
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm text-gray-500 mb-6">Configure your Pollux preferences.</p>
        <div className="border border-gray-200 rounded-xl p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">Sign in to get started</p>
          <p className="text-sm text-gray-400 mb-5">Connect your accounts and customize your AI reply style.</p>
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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">
        Configure your integrations and AI communication preferences.
      </p>
      <SettingsPanel accounts={accounts} user={user} />
    </div>
  );
}
