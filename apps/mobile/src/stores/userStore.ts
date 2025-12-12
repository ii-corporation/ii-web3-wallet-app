/**
 * User Store
 * Global user state management - stores authenticated user data
 * This is the source of truth for user data across the app
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

// Secure storage adapter for Zustand
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

// User wallet info
export interface UserWallet {
  address: string;
  type: "embedded" | "external";
  chainId?: number;
}

// User profile from backend
export interface UserProfile {
  id: string;
  privyUserId: string;
  privyEoaAddress: string;
  hederaAccountId: string | null;
  safeWalletAddress: string | null;
  accountStatus: "pending" | "creating" | "active" | "failed";
  createdAt?: string;
  updatedAt?: string;
}

// Linked accounts from Privy
export interface LinkedAccounts {
  email?: string;
  phone?: string;
  google?: { email: string; name?: string };
  apple?: { email: string };
  discord?: { username: string };
  twitter?: { username: string };
}

interface UserState {
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;

  // User data
  privyUserId: string | null;
  profile: UserProfile | null;
  wallet: UserWallet | null;
  linkedAccounts: LinkedAccounts | null;

  // Token (for API calls)
  accessToken: string | null;
  tokenExpiresAt: number | null;

  // Actions
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setPrivyUserId: (userId: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setWallet: (wallet: UserWallet | null) => void;
  setLinkedAccounts: (accounts: LinkedAccounts | null) => void;
  setAccessToken: (token: string | null, expiresAt?: number | null) => void;

  // Convenience actions
  login: (data: {
    privyUserId: string;
    accessToken: string;
    wallet?: UserWallet;
    linkedAccounts?: LinkedAccounts;
  }) => void;

  updateProfile: (profile: UserProfile) => void;

  logout: () => void;

  // Getters
  getDisplayName: () => string;
  getPrimaryEmail: () => string | null;
  getWalletAddress: () => string | null;
  isProfileComplete: () => boolean;
}

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  privyUserId: null,
  profile: null,
  wallet: null,
  linkedAccounts: null,
  accessToken: null,
  tokenExpiresAt: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setLoading: (loading) => set({ isLoading: loading }),
      setPrivyUserId: (userId) => set({ privyUserId: userId }),
      setProfile: (profile) => set({ profile }),
      setWallet: (wallet) => set({ wallet }),
      setLinkedAccounts: (accounts) => set({ linkedAccounts: accounts }),
      setAccessToken: (token, expiresAt = null) => set({
        accessToken: token,
        tokenExpiresAt: expiresAt,
      }),

      login: ({ privyUserId, accessToken, wallet, linkedAccounts }) => {
        set({
          isAuthenticated: true,
          isLoading: false,
          privyUserId,
          accessToken,
          wallet: wallet || null,
          linkedAccounts: linkedAccounts || null,
        });

        if (__DEV__) {
          console.log("[UserStore] User logged in:", {
            privyUserId,
            hasToken: !!accessToken,
            tokenLength: accessToken?.length,
            wallet: wallet?.address?.slice(0, 10) + "...",
          });
        }
      },

      updateProfile: (profile) => {
        set({ profile });
        if (__DEV__) {
          console.log("[UserStore] Profile updated:", profile.id);
        }
      },

      logout: () => {
        set(initialState);
        if (__DEV__) {
          console.log("[UserStore] User logged out");
        }
      },

      getDisplayName: () => {
        const state = get();

        // Try Google name first
        if (state.linkedAccounts?.google?.name) {
          return state.linkedAccounts.google.name;
        }

        // Try email (before @)
        const email = get().getPrimaryEmail();
        if (email) {
          return email.split("@")[0];
        }

        // Fall back to wallet address
        const wallet = state.wallet?.address;
        if (wallet) {
          return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
        }

        return "User";
      },

      getPrimaryEmail: () => {
        const state = get();
        return (
          state.linkedAccounts?.email ||
          state.linkedAccounts?.google?.email ||
          state.linkedAccounts?.apple?.email ||
          null
        );
      },

      getWalletAddress: () => {
        const state = get();
        // Prefer Safe wallet, fall back to EOA
        return (
          state.profile?.safeWalletAddress ||
          state.profile?.privyEoaAddress ||
          state.wallet?.address ||
          null
        );
      },

      isProfileComplete: () => {
        const state = get();
        return !!(
          state.profile &&
          state.profile.accountStatus === "active" &&
          state.profile.safeWalletAddress
        );
      },
    }),
    {
      name: "zoop-user-store",
      storage: createJSONStorage(() => secureStorage),
      // Only persist essential data, not loading states
      partialize: (state) => ({
        privyUserId: state.privyUserId,
        profile: state.profile,
        linkedAccounts: state.linkedAccounts,
        // Don't persist token - will be refreshed on app start
      }),
    }
  )
);

/**
 * Selectors for optimized re-renders
 */
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;
export const selectIsLoading = (state: UserState) => state.isLoading;
export const selectProfile = (state: UserState) => state.profile;
export const selectWallet = (state: UserState) => state.wallet;
export const selectAccessToken = (state: UserState) => state.accessToken;
export const selectPrivyUserId = (state: UserState) => state.privyUserId;
