/**
 * API Service - Handles communication with the backend
 */

import { useAuthStore, AuthTokens, BackendUser } from "../stores/authStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

export interface ApiWallet {
  id: string;
  address: string;
  isPrimary: boolean;
}

export interface ApiUser {
  id: string;
  privyId?: string;
  email: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  wallets: ApiWallet[];
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  user: BackendUser;
  tokens: AuthTokens;
  isNewUser: boolean;
}

export interface RefreshResponse {
  success: boolean;
  tokens: AuthTokens;
}

export interface GetMeResponse {
  success: boolean;
  user: ApiUser;
}

export interface VerifyAuthResponse {
  authenticated: boolean;
  message: string;
  tokenType?: string;
  userId?: string;
  appId?: string;
  timestamp?: string;
}

/**
 * Login to backend with Privy token
 * Exchanges Privy JWT for backend JWT
 */
export async function loginToBackend(
  getPrivyAccessToken: () => Promise<string | null>
): Promise<LoginResponse | null> {
  try {
    const privyToken = await getPrivyAccessToken();
    if (!privyToken) {
      console.error("[API] No Privy access token available");
      return null;
    }

    console.log("[API] Logging in to backend...");
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${privyToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[API] Login failed:", response.status, error);
      return null;
    }

    const data: LoginResponse = await response.json();
    console.log(
      "[API] Login successful:",
      data.user?.id,
      data.isNewUser ? "(new user)" : "(existing user)"
    );

    // Store tokens in auth store
    await useAuthStore.getState().setTokens(data.tokens, data.user);

    return data;
  } catch (error: any) {
    console.error("[API] Login error:", error.message);
    return null;
  }
}

/**
 * Refresh backend JWT
 * Requires a valid Privy token to verify the session is still active
 * If Privy session expired, returns null and clears tokens (user must re-login)
 */
export async function refreshBackendToken(
  getPrivyAccessToken: () => Promise<string | null>
): Promise<RefreshResponse | null> {
  try {
    // Get fresh Privy token to verify session is still valid
    const privyToken = await getPrivyAccessToken();
    if (!privyToken) {
      console.error("[API] No Privy token available - session may have expired");
      // Clear backend tokens since Privy session is invalid
      await useAuthStore.getState().clearTokens();
      return null;
    }

    console.log("[API] Refreshing backend token (with Privy verification)...");
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${privyToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[API] Token refresh failed:", response.status, error);

      // If refresh failed due to auth issues, clear tokens
      if (response.status === 401) {
        console.log("[API] Privy session invalid, clearing tokens...");
        await useAuthStore.getState().clearTokens();
      }
      return null;
    }

    const data: RefreshResponse = await response.json();
    console.log("[API] Token refreshed successfully");

    // Update tokens in store
    const currentUser = useAuthStore.getState().backendUser;
    if (currentUser) {
      await useAuthStore.getState().setTokens(data.tokens, currentUser);
    }

    return data;
  } catch (error: any) {
    console.error("[API] Token refresh error:", error.message);
    return null;
  }
}

/**
 * Get current user from backend (using backend JWT)
 */
export async function getCurrentUser(): Promise<ApiUser | null> {
  try {
    const backendToken = useAuthStore.getState().getBackendToken();
    if (!backendToken) {
      console.error("[API] No backend token available");
      return null;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[API] Get user failed:", response.status);
      return null;
    }

    const data: GetMeResponse = await response.json();
    return data.user;
  } catch (error: any) {
    console.error("[API] Get user error:", error.message);
    return null;
  }
}

/**
 * Verify authentication token with backend
 */
export async function verifyAuth(
  getPrivyAccessToken: () => Promise<string | null>
): Promise<VerifyAuthResponse | null> {
  try {
    const token = await getPrivyAccessToken();
    if (!token) {
      console.error("[API] No access token available for verify");
      return null;
    }

    console.log("[API] Verifying auth with backend...");
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data: VerifyAuthResponse = await response.json();
    console.log("[API] Verify response:", data);
    return data;
  } catch (error: any) {
    console.error("[API] Verify error:", error.message);
    return null;
  }
}

/**
 * Make an authenticated API request using backend JWT
 * Automatically handles token refresh if needed (requires Privy token getter)
 *
 * @param url - API endpoint URL
 * @param getPrivyToken - Function to get fresh Privy token (for refresh)
 * @param options - Fetch options
 */
export async function authenticatedFetch(
  url: string,
  getPrivyToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<Response> {
  let backendToken = useAuthStore.getState().getBackendToken();

  // If token is expired or about to expire, try to refresh
  if (!backendToken) {
    console.log("[API] Backend token expired, attempting refresh...");
    const refreshResult = await refreshBackendToken(getPrivyToken);
    if (!refreshResult) {
      throw new Error("Not authenticated - session expired, please login again");
    }
    backendToken = useAuthStore.getState().getBackendToken();
  }

  if (!backendToken) {
    throw new Error("Not authenticated - no backend token");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${backendToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // If we get 401, try to refresh once and retry
  if (response.status === 401) {
    console.log("[API] Got 401, attempting token refresh...");
    const refreshResult = await refreshBackendToken(getPrivyToken);
    if (!refreshResult) {
      throw new Error("Session expired - please login again");
    }

    backendToken = useAuthStore.getState().getBackendToken();
    if (!backendToken) {
      throw new Error("Session expired - please login again");
    }

    // Retry the request with new token
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  return response;
}

