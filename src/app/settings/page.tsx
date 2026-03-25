import { getConnectedAccounts } from "@/lib/services/account-service";
import { SettingsPanel } from "@/components/settings/settings-panel";

export default async function SettingsPage() {
  const accounts = await getConnectedAccounts();

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Configure your Pollux communication preferences and integrations.
      </p>
      <SettingsPanel accounts={accounts} />
    </div>
  );
}
