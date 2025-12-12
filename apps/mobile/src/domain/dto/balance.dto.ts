/**
 * Balance DTOs
 * Data Transfer Objects for balance endpoints
 */

import { Balance, TokenBalance, UserBalances } from "../entities/Balance";

// Response DTOs
export interface BalanceResponse {
  tokenSymbol: string;
  onChainBalance: string;
  pendingDeposits: string;
  pendingWithdrawals: string;
  lastSyncedAt: string | null;
}

export interface UserBalancesResponse {
  balances: BalanceResponse[];
  points: string;
  totalValue: string;
}

export interface NetworkBalanceResponse {
  network: string;
  tokenSymbol: string;
  balance: string;
  balanceFormatted: string;
}

// Mappers
export function mapBalanceResponse(response: BalanceResponse, userId: string): Balance {
  return {
    userId,
    tokenSymbol: response.tokenSymbol,
    onChainBalance: response.onChainBalance,
    pendingDeposits: response.pendingDeposits,
    pendingWithdrawals: response.pendingWithdrawals,
    lastSyncedAt: response.lastSyncedAt,
  };
}

export function mapToTokenBalance(
  response: BalanceResponse,
  network: string,
  decimals: number = 8
): TokenBalance {
  const onChain = BigInt(response.onChainBalance || "0");
  const pendingIn = BigInt(response.pendingDeposits || "0");
  const pendingOut = BigInt(response.pendingWithdrawals || "0");
  const available = onChain + pendingIn - pendingOut;
  const pending = pendingIn - pendingOut;

  const formatAmount = (value: bigint): string => {
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    if (fraction === 0n) return whole.toLocaleString();
    return `${whole.toLocaleString()}.${fraction.toString().padStart(decimals, "0").slice(0, 2)}`;
  };

  return {
    symbol: response.tokenSymbol,
    balance: onChain.toString(),
    balanceFormatted: formatAmount(onChain),
    pending: pending.toString(),
    available: available.toString(),
    availableFormatted: formatAmount(available),
    network,
  };
}
