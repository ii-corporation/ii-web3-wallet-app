// Mock auth state for web development
const webMockAuth = {
  isReady: true,
  authenticated: false,
  user: null,
  getAccessToken: async () => null as string | null,
  loginWithEmail: async () => {
    console.log("[Web] Privy login not available on web platform");
  },
  loginWithOAuth: async () => {
    console.log("[Web] Privy OAuth not available on web platform");
  },
  loginWithUI: async () => {
    console.log("[Web] Privy UI login not available on web platform");
    return null;
  },
  logout: async () => {
    console.log("[Web] Privy logout not available on web platform");
  },
};

/**
 * Web auth hook - returns mock state (Privy Expo doesn't work on web)
 */
export function useAuth() {
  return webMockAuth;
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
