/**
 * Auth Service
 * Business logic for authentication operations
 */

import { getAuthRepository } from "../infrastructure/repositories/AuthRepository";
import { initializeApiClient } from "../infrastructure/http/ApiClient";
import { getQueryClient, queryKeys } from "../providers/QueryProvider";
import { AuthSyncResponse, AuthMeResponse, AuthVerifyResponse, AuthNonceResponse } from "../domain/dto/auth.dto";

export interface AuthTokenProvider {
  getAccessToken: () => Promise<string | null>;
}

/**
 * Initialize the authentication system with a token provider
 */
export function initializeAuth(tokenProvider: AuthTokenProvider): void {
  // Wrap the getAccessToken function in a TokenProvider-compatible object
  initializeApiClient({ getAccessToken: tokenProvider.getAccessToken });
}

/**
 * Sync user with backend after Privy authentication
 * This creates or updates the user record in the backend
 */
export async function syncUserWithBackend(): Promise<AuthSyncResponse> {
  try {
    const result = await getAuthRepository().syncUser();

    // Invalidate related queries after sync
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });

    return result;
  } catch (error) {
    console.error("[AuthService] Failed to sync user:", error);
    throw error;
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthMeResponse | null> {
  try {
    return await getAuthRepository().getMe();
  } catch (error) {
    console.error("[AuthService] Failed to get current user:", error);
    return null;
  }
}

/**
 * Verify if current session is valid
 */
export async function verifySession(): Promise<AuthVerifyResponse> {
  try {
    return await getAuthRepository().verifyAuth();
  } catch (error) {
    console.error("[AuthService] Session verification failed:", error);
    return { authenticated: false, message: "Session verification failed" };
  }
}

/**
 * Clear authentication state (logout cleanup)
 */
export function clearAuthState(): void {
  const queryClient = getQueryClient();

  // Clear all cached data
  queryClient.clear();
}

/**
 * Get nonce for wallet signing
 */
export async function getSigningNonce(): Promise<AuthNonceResponse> {
  return await getAuthRepository().getNonce();
}
