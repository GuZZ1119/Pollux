import type { ConnectedAccount } from "@/lib/types";
import { mockAccounts } from "@/lib/mocks/accounts";

// TODO: Read account status from database + Auth0 Token Vault
export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  return mockAccounts;
}
