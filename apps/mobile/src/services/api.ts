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
  wallets: ApiWallet[];
  createdAt: string;
}

export interface SyncUserResponse {
  success: boolean;
  user: ApiUser;
  isNewUser: boolean;
}

export interface VerifyAuthResponse {
  authenticated: boolean;
  message: string;
  userId?: string;
  appId?: string;
  timestamp?: string;
}

/**
 * Sync user with backend after Privy authentication
 * This creates the user in the database if they don't exist
 */
export async function syncUser(
  getAccessToken: () => Promise<string | null>
): Promise<SyncUserResponse | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error("[API] No access token available for sync");
      return null;
    }

    console.log("[API] Syncing user with backend...");
    const response = await fetch(`${API_URL}/auth/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[API] Sync failed:", response.status, error);
      return null;
    }

    const data = await response.json();
    console.log("[API] User synced:", data.user?.id, data.isNewUser ? "(new)" : "(existing)");
    return data;
  } catch (error: any) {
    console.error("[API] Sync error:", error.message);
    return null;
  }
}

/**
 * Verify authentication token with backend
 */
export async function verifyAuth(
  getAccessToken: () => Promise<string | null>
): Promise<VerifyAuthResponse | null> {
  try {
    const token = await getAccessToken();
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

    const data = await response.json();
    console.log("[API] Verify response:", data);
    return data;
  } catch (error: any) {
    console.error("[API] Verify error:", error.message);
    return null;
  }
}

/**
 * Get current user from backend
 */
export async function getCurrentUser(
  getAccessToken: () => Promise<string | null>
): Promise<ApiUser | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error("[API] No access token available");
      return null;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[API] Get user failed:", response.status);
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error: any) {
    console.error("[API] Get user error:", error.message);
    return null;
  }
}
