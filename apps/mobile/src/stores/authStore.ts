/**
 * Auth Store - Manages authentication state and backend JWT tokens
 *
 * This store handles:
 * - Auth flow state (sync, navigation)
 * - Backend JWT storage and retrieval
 * - Token expiration checking
 */

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "zoop_access_token",
  TOKEN_EXPIRY: "zoop_token_expiry",
  USER_ID: "zoop_user_id",
} as const;

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface BackendUser {
  id: string;
  email: string | null;
  displayName: string | null;
  wallets: Array<{ address: string; isPrimary: boolean }>;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  // Flow state
  hasSyncedUser: boolean;
  isNavigating: boolean;
  lastAuthState: boolean | null;
  isLoggingOut: boolean; // Prevents race conditions during logout

  // Backend JWT state
  backendToken: string | null;
  tokenExpiry: number | null;
  backendUser: BackendUser | null;
  isInitialized: boolean;

  // Flow actions
  setHasSyncedUser: (value: boolean) => void;
  setIsNavigating: (value: boolean) => void;
  setLastAuthState: (value: boolean | null) => void;
  setIsLoggingOut: (value: boolean) => void;
  resetAuthFlow: () => void;

  // Token actions
  setTokens: (tokens: AuthTokens, user: BackendUser) => Promise<void>;
  clearTokens: () => Promise<void>;
  getBackendToken: () => string | null;
  isTokenValid: () => boolean;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Flow state defaults
  hasSyncedUser: false,
  isNavigating: false,
  lastAuthState: null,
  isLoggingOut: false,

  // Token state defaults
  backendToken: null,
  tokenExpiry: null,
  backendUser: null,
  isInitialized: false,

  // Flow actions
  setHasSyncedUser: (value) => set({ hasSyncedUser: value }),
  setIsNavigating: (value) => set({ isNavigating: value }),
  setLastAuthState: (value) => set({ lastAuthState: value }),
  setIsLoggingOut: (value) => set({ isLoggingOut: value }),
  resetAuthFlow: () =>
    set({
      hasSyncedUser: false,
      isNavigating: false,
      lastAuthState: null,
      isLoggingOut: false,
    }),

  // Token actions
  setTokens: async (tokens: AuthTokens, user: BackendUser) => {
    const expiry = Date.now() + tokens.expiresIn * 1000;

    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, user.id);

      set({
        backendToken: tokens.accessToken,
        tokenExpiry: expiry,
        backendUser: user,
        hasSyncedUser: true,
      });

      console.log("[AuthStore] Backend tokens stored successfully");
    } catch (error) {
      console.error("[AuthStore] Failed to store tokens:", error);
      throw error;
    }
  },

  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);

      set({
        backendToken: null,
        tokenExpiry: null,
        backendUser: null,
        hasSyncedUser: false,
        isNavigating: false,
        lastAuthState: null,
        isLoggingOut: false,
      });

      console.log("[AuthStore] Tokens cleared");
    } catch (error) {
      console.error("[AuthStore] Failed to clear tokens:", error);
    }
  },

  getBackendToken: () => {
    const state = get();
    if (!state.isTokenValid()) {
      return null;
    }
    return state.backendToken;
  },

  isTokenValid: () => {
    const state = get();
    if (!state.backendToken || !state.tokenExpiry) {
      return false;
    }
    // Add 60 second buffer for token expiry
    return Date.now() < state.tokenExpiry - 60000;
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
      const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);

      if (token && expiryStr) {
        const expiry = parseInt(expiryStr, 10);

        // Check if token is still valid
        if (Date.now() < expiry - 60000) {
          set({
            backendToken: token,
            tokenExpiry: expiry,
            backendUser: userId
              ? { id: userId, email: null, displayName: null, wallets: [] }
              : null,
            isInitialized: true,
            hasSyncedUser: true,
          });
          console.log("[AuthStore] Restored backend tokens from storage");
          return;
        } else {
          // Token expired, clear it
          console.log("[AuthStore] Stored token expired, clearing");
          await get().clearTokens();
        }
      }

      set({ isInitialized: true });
    } catch (error) {
      console.error("[AuthStore] Failed to initialize:", error);
      set({ isInitialized: true });
    }
  },
}));

// Legacy export for backward compatibility
export const useAuthFlowStore = useAuthStore;
