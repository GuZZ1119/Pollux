import { auth0 } from "@/lib/auth0";
import { MS_CONNECTION_NAME } from "@/lib/outlook/token-vault";

/**
 * Initiates the Connected Accounts flow for Microsoft / Outlook.
 *
 * Uses the SDK's `connectAccount()` which:
 * 1. Gets a My Account API token (create:me:connected_accounts scope)
 * 2. Calls POST /me/v1/connected-accounts/connect
 * 3. Returns a redirect to Auth0's connect_uri → Microsoft login
 * 4. After authorization, SDK's /auth/connect callback completes the flow
 * 5. Auth0 stores Microsoft tokens in Token Vault
 */
export async function GET() {
  return auth0.connectAccount({
    connection: MS_CONNECTION_NAME,
    returnTo: "/settings?outlook_connected=true",
  });
}
