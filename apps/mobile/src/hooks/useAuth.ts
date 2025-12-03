// Platform-specific file resolution:
// - Metro will resolve to useAuth.native.ts on iOS/Android
// - Metro will resolve to useAuth.web.ts on web
// This file serves as fallback (shouldn't be used)

// Fallback export - should not be reached due to platform-specific files
export function useAuth() {
  console.warn("[useAuth] Fallback file loaded - platform-specific file not found");
  return {
    isReady: true,
    authenticated: false,
    user: null,
    getAccessToken: async (): Promise<string | null> => null,
    loginWithEmail: async () => {},
    loginWithOAuth: async () => {},
    loginWithUI: async () => null,
    logout: async () => {},
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
