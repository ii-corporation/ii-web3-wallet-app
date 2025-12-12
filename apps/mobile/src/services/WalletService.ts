/**
 * Wallet Service
 * Business logic for wallet operations
 */

import { useWalletStore, WalletType } from "../stores/walletStore";
import { getBalanceRepository } from "../infrastructure/repositories/BalanceRepository";
import { getQueryClient, queryKeys } from "../providers/QueryProvider";

export interface WalletConnection {
  address: string;
  type: WalletType;
  chainId: number;
}

/**
 * Connect wallet and update store
 */
export async function connectWallet(connection: WalletConnection): Promise<void> {
  const store = useWalletStore.getState();

  try {
    store.setConnecting(true);

    // Verify the wallet connection is valid by fetching balances
    await getBalanceRepository().getBalances();

    store.setActiveWallet({
      ...connection,
      isConnected: true,
    });

    // Refresh balance queries
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect wallet";
    store.setConnectionError(message);
    throw error;
  }
}

/**
 * Disconnect wallet and clear state
 */
export function disconnectWallet(): void {
  const store = useWalletStore.getState();
  store.disconnect();

  // Clear balance cache
  const queryClient = getQueryClient();
  queryClient.removeQueries({ queryKey: queryKeys.balances.all });
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(
  address: string,
  options?: { startChars?: number; endChars?: number }
): string {
  const { startChars = 6, endChars = 4 } = options || {};

  if (address.length <= startChars + endChars) {
    return address;
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Validate wallet address format
 */
export function isValidAddress(address: string): boolean {
  // EVM address validation (starts with 0x, 40 hex characters)
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return true;
  }

  // Hedera account ID validation (0.0.xxxxx format)
  if (/^0\.0\.\d+$/.test(address)) {
    return true;
  }

  return false;
}

/**
 * Get wallet explorer URL
 */
export function getExplorerUrl(
  address: string,
  network: "mainnet" | "testnet" = "mainnet"
): string {
  // Hedera HashScan explorer
  const baseUrl =
    network === "mainnet"
      ? "https://hashscan.io/mainnet"
      : "https://hashscan.io/testnet";

  // Detect address type
  if (address.startsWith("0x")) {
    return `${baseUrl}/account/${address}`;
  }

  if (address.startsWith("0.0.")) {
    return `${baseUrl}/account/${address}`;
  }

  return baseUrl;
}

/**
 * Get transaction explorer URL
 */
export function getTransactionExplorerUrl(
  txId: string,
  network: "mainnet" | "testnet" = "mainnet"
): string {
  const baseUrl =
    network === "mainnet"
      ? "https://hashscan.io/mainnet"
      : "https://hashscan.io/testnet";

  return `${baseUrl}/transaction/${txId}`;
}

/**
 * Copy address to clipboard
 */
export async function copyAddressToClipboard(address: string): Promise<boolean> {
  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(address);
    return true;
  } catch (error) {
    console.error("[WalletService] Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Check if wallet supports a specific feature
 */
export function supportsFeature(
  walletType: WalletType,
  feature: "signing" | "transactions" | "nfts" | "staking"
): boolean {
  const features: Record<WalletType, string[]> = {
    embedded: ["signing", "transactions", "nfts", "staking"],
    external: ["signing", "transactions", "nfts", "staking"],
    safe: ["transactions", "nfts", "staking"], // Safe uses multisig
  };

  return features[walletType]?.includes(feature) ?? false;
}
