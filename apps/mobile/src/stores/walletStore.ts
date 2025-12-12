/**
 * Wallet Store
 * Manages client-side wallet state and connection status
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

// Expo SecureStore adapter for Zustand
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

export type WalletType = "embedded" | "external" | "safe";

interface WalletInfo {
  address: string;
  type: WalletType;
  chainId: number;
  isConnected: boolean;
}

interface WalletState {
  // State
  activeWallet: WalletInfo | null;
  isConnecting: boolean;
  connectionError: string | null;
  lastConnectedAddress: string | null;

  // Actions
  setActiveWallet: (wallet: WalletInfo | null) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  disconnect: () => void;
  reset: () => void;
}

const initialState = {
  activeWallet: null,
  isConnecting: false,
  connectionError: null,
  lastConnectedAddress: null,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveWallet: (wallet) =>
        set({
          activeWallet: wallet,
          lastConnectedAddress: wallet?.address ?? get().lastConnectedAddress,
          connectionError: null,
        }),

      setConnecting: (connecting) =>
        set({ isConnecting: connecting }),

      setConnectionError: (error) =>
        set({ connectionError: error, isConnecting: false }),

      disconnect: () =>
        set({
          activeWallet: null,
          isConnecting: false,
          connectionError: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "zoop-wallet-store",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        lastConnectedAddress: state.lastConnectedAddress,
      }),
    }
  )
);

/**
 * Selectors for optimized re-renders
 */
export const selectActiveWallet = (state: WalletState) => state.activeWallet;
export const selectIsWalletConnected = (state: WalletState) => !!state.activeWallet?.isConnected;
export const selectWalletAddress = (state: WalletState) => state.activeWallet?.address;
