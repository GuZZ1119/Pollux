/**
 * Auth0 Token Vault — Microsoft / Outlook integration
 *
 * Token retrieval uses the SDK's `getAccessTokenForConnection()`, which
 * performs a federated token exchange (RFC 8693) at Auth0's `/oauth/token`
 * endpoint under the hood. The app never touches raw Microsoft OAuth —
 * Auth0 Token Vault stores, refreshes, and returns the Microsoft token.
 *
 * Connection-status checks attempt the same SDK path (fast, session-based)
 * and fall back to the Management API `/users/{id}/connected-accounts`
 * metadata endpoint only as a secondary signal.
 */

import { auth0 } from "@/lib/auth0";

export const MS_CONNECTION_NAME =
  process.env.AUTH0_MS_CONNECTION_NAME ?? "windowslive";

/* ------------------------------------------------------------------ */
/*  Token retrieval — primary Token Vault path                        */
/* ------------------------------------------------------------------ */

/**
 * Retrieve a Microsoft access token from Auth0 Token Vault.
 *
 * Internally calls `auth0.getAccessTokenForConnection()` which exchanges
 * the user's Auth0 refresh token for a federated Microsoft access token
 * via:
 *   POST /oauth/token
 *   grant_type: urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token
 *
 * Returns null if the user has not connected a Microsoft account or the
 * exchange fails for any reason.
 */
export async function getMicrosoftAccessToken(): Promise<string | null> {
  try {
    const { token } = await auth0.getAccessTokenForConnection({
      connection: MS_CONNECTION_NAME,
    });
    return token ?? null;
  } catch (e) {
    console.error("[token-vault] getAccessTokenForConnection failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Connection-status check                                           */
/* ------------------------------------------------------------------ */

/**
 * Check whether the current user has a connected Microsoft / Outlook
 * account in Auth0 Token Vault.
 *
 * Primary path: attempt `getAccessTokenForConnection`. If it returns a
 * token the connection is live. This avoids Management API calls and
 * stays within the Token Vault domain.
 *
 * If the primary path throws (user not connected, no refresh token,
 * configuration issue), returns false.
 */
export async function hasOutlookConnection(): Promise<boolean> {
  try {
    const { token } = await auth0.getAccessTokenForConnection({
      connection: MS_CONNECTION_NAME,
    });
    return Boolean(token);
  } catch {
    return false;
  }
}
