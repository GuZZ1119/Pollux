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
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 mb-4">Sign in to manage your settings and integrations.</p>
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

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Configure your Pollux communication preferences and integrations.
      </p>
      <SettingsPanel accounts={accounts} user={user} />
    </div>
  );
}
