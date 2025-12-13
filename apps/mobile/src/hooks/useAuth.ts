import { usePrivy, useLoginWithEmail, useLoginWithOAuth } from "@privy-io/expo";
import { useLogin, LoginUIConfig } from "@privy-io/expo/ui";
import { useCallback, useMemo, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { loginToBackend } from "../services/api";

// Default login methods for the app
const DEFAULT_LOGIN_METHODS: LoginUIConfig["loginMethods"] = ["email", "google", "apple"];

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";

// Login config type for our wrapper
export interface LoginOptions {
  loginMethods?: LoginUIConfig["loginMethods"];
}

// Mock auth state for dev mode (no Privy App ID)
const devMockAuth = {
  isReady: true,
  authenticated: false,
  privyAuthenticated: false,
  needsBackendSync: false,
  user: null,
  backendUser: null,
  getAccessToken: async () => null as string | null,
  getBackendToken: () => null as string | null,
  loginWithEmail: async () => {
    console.log("[Dev Mode] Privy login not available - no App ID configured");
  },
  loginWithOAuth: async () => {
    console.log("[Dev Mode] Privy OAuth not available - no App ID configured");
  },
  loginWithUI: async (_options?: LoginOptions) => {
    console.log("[Dev Mode] Privy UI login not available - no App ID configured");
    return null;
  },
  logout: async () => {
    console.log("[Dev Mode] Privy logout not available");
  },
};

/**
 * Auth hook - uses real Privy SDK when configured
 *
 * Authentication flow:
 * 1. User authenticates with Privy (loginWithUI)
 * 2. After Privy auth succeeds, we exchange Privy token for backend JWT
 * 3. Backend JWT is stored securely and used for all API calls
 * 4. Privy connection is maintained for wallet operations (signing)
 *
 * Returns:
 * - isReady: boolean - whether Privy is ready
 * - authenticated: boolean - whether user has valid backend JWT
 * - user: Privy user object (for wallet operations)
 * - backendUser: Backend user object
 * - getAccessToken: () => Promise<string | null> - get Privy JWT (for wallet ops)
 * - getBackendToken: () => string | null - get backend JWT (for API calls)
 * - loginWithUI: (config) => Promise - trigger Privy login modal
 * - logout: () => Promise - logout user (clears both Privy and backend tokens)
 */
export function useAuth() {
  // If no Privy App ID, return mock state for development
  if (!PRIVY_APP_ID) {
    console.log("[useAuth] No Privy App ID - using dev mock");
    return devMockAuth;
  }

  // Use real Privy hooks
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const privyState = usePrivy();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { loginWithCode } = useLoginWithEmail();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { login: oauthLogin } = useLoginWithOAuth();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { login: uiLogin } = useLogin();

  // Auth store for backend tokens
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const authStore = useAuthStore();

  // Initialize auth store on mount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!authStore.isInitialized) {
      authStore.initialize();
    }
  }, [authStore.isInitialized]);

  // Track Privy authentication state (user logged in to Privy)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const privyAuthenticated = useMemo(() => {
    return privyState.isReady && privyState.user !== null;
  }, [privyState.isReady, privyState.user]);

  // Track full authentication (Privy + backend token)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const authenticated = useMemo(() => {
    const hasValidBackendToken = authStore.isTokenValid();

    console.log("[useAuth] Auth state:", {
      privyReady: privyState.isReady,
      hasPrivyUser: !!privyState.user,
      privyAuthenticated,
      hasValidBackendToken,
      storeInitialized: authStore.isInitialized,
    });

    // User is fully authenticated if they have both Privy auth AND valid backend token
    return privyAuthenticated && hasValidBackendToken;
  }, [
    privyState.isReady,
    privyState.user,
    privyAuthenticated,
    authStore.backendToken,
    authStore.tokenExpiry,
    authStore.isInitialized,
  ]);

  // Check if we need to sync (Privy logged in but no backend token)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const needsBackendSync = useMemo(() => {
    return privyAuthenticated && !authStore.isTokenValid();
  }, [privyAuthenticated, authStore.backendToken, authStore.tokenExpiry]);

  // Wrap getAccessToken for Privy token (used for wallet operations)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!privyState.getAccessToken) {
      return null;
    }
    try {
      return await privyState.getAccessToken();
    } catch (error) {
      console.error("[useAuth] Failed to get Privy access token:", error);
      return null;
    }
  }, [privyState.getAccessToken]);

  // Get backend token (used for API calls)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getBackendToken = useCallback((): string | null => {
    return authStore.getBackendToken();
  }, [authStore.getBackendToken]);

  // Login with UI - handles both Privy auth AND backend token exchange
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loginWithUI = useCallback(
    async (options?: LoginOptions) => {
      try {
        // Step 1: Authenticate with Privy
        const privyResult = await uiLogin({
          loginMethods: options?.loginMethods ?? DEFAULT_LOGIN_METHODS,
        });

        // Step 2: If Privy auth succeeded, exchange for backend JWT
        if (privyResult && privyState.getAccessToken) {
          console.log("[useAuth] Privy auth successful, exchanging for backend token...");

          const loginResult = await loginToBackend(privyState.getAccessToken);

          if (!loginResult) {
            console.error("[useAuth] Backend login failed after Privy auth");
            // Don't logout from Privy - user can retry backend auth
          } else {
            console.log("[useAuth] Backend login successful");
          }
        }

        return privyResult;
      } catch (error) {
        console.error("[useAuth] Login error:", error);
        throw error;
      }
    },
    [uiLogin, privyState.getAccessToken]
  );

  // Logout - clears both Privy and backend tokens
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const logout = useCallback(async () => {
    try {
      // Set flag to prevent race conditions (token exchange triggering during logout)
      authStore.setIsLoggingOut(true);
      console.log("[useAuth] Starting logout...");

      // Logout from Privy FIRST to prevent needsBackendSync from triggering
      await privyState.logout();

      // Then clear backend tokens
      await authStore.clearTokens();

      console.log("[useAuth] Logged out successfully");
    } catch (error) {
      console.error("[useAuth] Logout error:", error);
      // Still try to clear tokens even if Privy logout fails
      await authStore.clearTokens();
    }
  }, [privyState.logout, authStore.clearTokens, authStore.setIsLoggingOut]);

  return {
    // Ready state
    isReady: privyState.isReady && authStore.isInitialized,
    authenticated, // Fully authenticated (Privy + backend token)
    privyAuthenticated, // Just Privy authenticated
    needsBackendSync, // Privy logged in but no backend token

    // User objects
    user: privyState.user, // Privy user (for wallet operations)
    backendUser: authStore.backendUser, // Backend user

    // Token getters
    getAccessToken, // Privy JWT (for wallet/signing operations)
    getBackendToken, // Backend JWT (for API calls)

    // Auth methods
    loginWithEmail: loginWithCode,
    loginWithOAuth: oauthLogin,
    loginWithUI,
    logout,
  };
}

/**
 * Helper to create authenticated fetch headers using backend JWT
 * @param token - The backend access token
 * @returns Headers object with Authorization
 */
export function createAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Make an authenticated API request using backend JWT
 * Prefer using authenticatedFetch from services/api.ts instead
 *
 * @deprecated Use authenticatedFetch from services/api.ts
 */
export async function authenticatedFetch(
  url: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  if (!token) {
    throw new Error("Not authenticated - no access token");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...createAuthHeaders(token),
      ...options.headers,
    },
  });
}
