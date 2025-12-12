/**
 * Embedded Wallet Hook
 * Handles creation and management of Privy embedded wallets
 */

import { useEmbeddedEthereumWallet } from "@privy-io/expo";
import { useCallback, useMemo } from "react";

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";

// Mock for dev mode
const devMockWallet = {
  wallets: [],
  isReady: true,
  create: async () => {
    console.log("[Dev Mode] Wallet creation not available");
    return null;
  },
  primaryWallet: null,
  primaryAddress: null,
};

/**
 * Hook for managing embedded Ethereum wallets
 *
 * Usage:
 *   const { wallets, create, primaryWallet, primaryAddress, isReady } = useEmbeddedWallet();
 *
 *   // Create wallet if user doesn't have one
 *   if (isReady && !primaryWallet) {
 *     await create();
 *   }
 */
export function useEmbeddedWallet() {
  // Dev mode fallback
  if (!PRIVY_APP_ID) {
    return devMockWallet;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { wallets, create: privyCreate } = useEmbeddedEthereumWallet();

  // Get the first (primary) wallet
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const primaryWallet = useMemo(() => {
    return wallets?.[0] || null;
  }, [wallets]);

  // Get primary wallet address
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const primaryAddress = useMemo(() => {
    return primaryWallet?.address || null;
  }, [primaryWallet]);

  // Wrapper for create with automatic recovery
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const create = useCallback(async () => {
    if (!privyCreate) {
      console.error("[useEmbeddedWallet] Create function not available");
      return null;
    }

    try {
      console.log("[useEmbeddedWallet] Creating embedded wallet...");

      // Use Privy-managed recovery (simplest option)
      const wallet = await privyCreate({ recoveryMethod: "privy" });

      console.log("[useEmbeddedWallet] Wallet created:", wallet?.address?.slice(0, 10) + "...");
      return wallet;
    } catch (error: any) {
      // Check if wallet already exists
      if (error?.message?.includes("already has") || error?.code === "wallet_already_exists") {
        console.log("[useEmbeddedWallet] Wallet already exists");
        return primaryWallet;
      }

      console.error("[useEmbeddedWallet] Failed to create wallet:", error);
      throw error;
    }
  }, [privyCreate, primaryWallet]);

  return {
    wallets,
    create,
    primaryWallet,
    primaryAddress,
    isReady: wallets !== undefined,
  };
}
