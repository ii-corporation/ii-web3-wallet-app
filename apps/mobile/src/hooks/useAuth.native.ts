import { usePrivy, useLoginWithEmail, useLoginWithOAuth } from "@privy-io/expo";
import { useLogin } from "@privy-io/expo/ui";
import { useCallback, useMemo } from "react";

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";

// Mock auth state for dev mode (no Privy App ID)
const devMockAuth = {
  isReady: true,
  authenticated: false,
  user: null,
  getAccessToken: async () => null as string | null,
  loginWithEmail: async () => {
    console.log("[Dev Mode] Privy login not available - no App ID configured");
  },
  loginWithOAuth: async () => {
    console.log("[Dev Mode] Privy OAuth not available - no App ID configured");
  },
  loginWithUI: async () => {
    console.log("[Dev Mode] Privy UI login not available - no App ID configured");
    return null;
  },
  logout: async () => {
    console.log("[Dev Mode] Privy logout not available");
  },
};

/**
 * Native auth hook - uses real Privy SDK when configured
 * Returns:
 * - isReady: boolean - whether Privy is ready
 * - authenticated: boolean - whether user is authenticated (derived from user !== null)
 * - user: Privy user object
 * - getAccessToken: () => Promise<string | null> - get JWT for API calls
 * - loginWithUI: (config) => Promise - trigger Privy login modal
 * - logout: () => Promise - logout user
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

  // Derive authenticated from user state (user !== null means authenticated)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const authenticated = useMemo(() => {
    const isAuth = privyState.isReady && privyState.user !== null;
    console.log("[useAuth] Auth state:", { isReady: privyState.isReady, hasUser: !!privyState.user, authenticated: isAuth });
    return isAuth;
  }, [privyState.isReady, privyState.user]);

  // Wrap getAccessToken to ensure it always returns a promise
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!privyState.getAccessToken) {
      return null;
    }
    try {
      return await privyState.getAccessToken();
    } catch (error) {
      console.error("[useAuth] Failed to get access token:", error);
      return null;
    }
  }, [privyState.getAccessToken]);

  return {
    isReady: privyState.isReady,
    authenticated,
    user: privyState.user,
    getAccessToken,
    loginWithEmail: loginWithCode,
    loginWithOAuth: oauthLogin,
    loginWithUI: uiLogin,
    logout: privyState.logout,
  };
}

/**
 * Helper to create authenticated fetch headers
 * @param token - The Privy access token
 * @returns Headers object with Authorization
 */
export function createAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Make an authenticated API request
 * @param url - API endpoint URL
 * @param getToken - Function to get the access token (from useAuth)
 * @param options - Fetch options
 * @returns Response from the API
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
