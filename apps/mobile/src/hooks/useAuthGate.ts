import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useAuthFlowStore, useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { loginToBackend } from "../services/api";

// Privy user type for linked accounts extraction
interface PrivyUserLinkedAccounts {
  email?: { address?: string };
  google?: { email?: string; name?: string };
  apple?: { email?: string };
  discord?: { username?: string };
  twitter?: { username?: string };
  id?: string;
}

export interface AuthGateState {
  /** Whether auth is ready and user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Whether token exchange is in progress */
  isSyncing: boolean;
  /** Error message if sync failed */
  syncError: string | null;
  /** Clear the sync error */
  clearSyncError: () => void;
}

/**
 * Hook that handles authentication gate logic:
 * - Token exchange between Privy and backend
 * - Provides auth state for Stack.Protected guards
 * - Sync state management
 */
export function useAuthGate(): AuthGateState {
  const {
    isReady,
    authenticated,
    privyAuthenticated,
    needsBackendSync,
    getAccessToken,
    user,
    logout,
  } = useAuth();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Zustand stores
  const { hasSyncedUser, setHasSyncedUser, resetAuthFlow } = useAuthFlowStore();
  const { login: storeLogin, updateProfile, logout: storeLogout } = useUserStore();
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  const clearSyncError = useCallback(() => setSyncError(null), []);

  // Token exchange: Privy → Backend
  useEffect(() => {
    if (!isReady || !needsBackendSync || isSyncing || isLoggingOut) {
      return;
    }

    const doTokenExchange = async () => {
      if (!getAccessToken) return;

      setIsSyncing(true);
      setSyncError(null);

      try {
        const result = await loginToBackend(getAccessToken);

        if (!result?.user) {
          throw new Error("Unable to connect to server. Please try again later.");
        }

        // Extract linked accounts from Privy user
        const privyUser = user as PrivyUserLinkedAccounts | null;
        const linkedAccounts = {
          email: privyUser?.email?.address,
          google: privyUser?.google?.email
            ? { email: privyUser.google.email, name: privyUser.google.name }
            : undefined,
          apple: privyUser?.apple?.email
            ? { email: privyUser.apple.email }
            : undefined,
          discord: privyUser?.discord?.username
            ? { username: privyUser.discord.username }
            : undefined,
          twitter: privyUser?.twitter?.username
            ? { username: privyUser.twitter.username }
            : undefined,
        };

        // Get primary wallet from backend response
        const backendWallet =
          result.user.wallets?.find((w) => w.isPrimary) || result.user.wallets?.[0];
        const walletForStore = backendWallet
          ? { address: backendWallet.address, type: "embedded" as const }
          : undefined;

        // Get token and populate user store
        const token = await getAccessToken();

        storeLogin({
          privyUserId: privyUser?.id || "",
          accessToken: token || "",
          wallet: walletForStore,
          linkedAccounts,
        });

        updateProfile({
          id: result.user.id,
          privyUserId: privyUser?.id || "",
          privyEoaAddress: walletForStore?.address || "",
          hederaAccountId: null,
          safeWalletAddress: null,
          accountStatus: "active",
          createdAt: result.user.createdAt,
          updatedAt: result.user.createdAt,
        });

        setHasSyncedUser(true);
      } catch (error: any) {
        console.error("[useAuthGate] Token exchange error:", error.message);
        setSyncError(error.message || "Connection failed. Please try again.");

        // Logout from Privy - cannot proceed without backend token
        try {
          await logout();
        } catch (logoutError) {
          console.error("[useAuthGate] Logout error:", logoutError);
        }
        resetAuthFlow();
        storeLogout();
      } finally {
        setIsSyncing(false);
      }
    };

    doTokenExchange();
  }, [
    isReady,
    needsBackendSync,
    isSyncing,
    isLoggingOut,
    getAccessToken,
    user,
    storeLogin,
    updateProfile,
    logout,
    resetAuthFlow,
    storeLogout,
    setHasSyncedUser,
  ]);

  // Reset auth flow on Privy logout
  useEffect(() => {
    if (isReady && !privyAuthenticated && hasSyncedUser) {
      resetAuthFlow();
      storeLogout();
    }
  }, [isReady, privyAuthenticated, hasSyncedUser, resetAuthFlow, storeLogout]);

  // Auto-clear sync error after 5 seconds
  useEffect(() => {
    if (syncError) {
      const timer = setTimeout(() => setSyncError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [syncError]);

  return {
    isAuthenticated: authenticated,
    isLoading: !isReady || isSyncing,
    isSyncing,
    syncError,
    clearSyncError,
  };
}
