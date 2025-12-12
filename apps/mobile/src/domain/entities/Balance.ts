/**
 * Balance Entity
 * Token balance domain model
 */

export interface Balance {
  userId: string;
  tokenSymbol: string;
  onChainBalance: string;
  pendingDeposits: string;
  pendingWithdrawals: string;
  lastSyncedAt: string | null;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  balanceFormatted: string;
  pending: string;
  available: string;
  availableFormatted: string;
  network: string;
}

export interface UserBalances {
  total: TokenBalance;
  byNetwork: Record<string, TokenBalance>;
  points: string;
  pointsFormatted: string;
}

/**
 * Calculate available balance (on-chain + pending in - pending out)
 */
export function calculateAvailableBalance(balance: Balance): bigint {
  const onChain = BigInt(balance.onChainBalance || "0");
  const pendingIn = BigInt(balance.pendingDeposits || "0");
  const pendingOut = BigInt(balance.pendingWithdrawals || "0");
  return onChain + pendingIn - pendingOut;
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(
  amount: string | bigint,
  decimals: number = 8,
  maxDecimals: number = 2
): string {
  const value = typeof amount === "string" ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;

  if (fraction === 0n) {
    return whole.toLocaleString();
  }

  const fractionStr = fraction.toString().padStart(decimals, "0");
  const trimmed = fractionStr.slice(0, maxDecimals).replace(/0+$/, "");

  if (trimmed === "") {
    return whole.toLocaleString();
  }

  return `${whole.toLocaleString()}.${trimmed}`;
}
