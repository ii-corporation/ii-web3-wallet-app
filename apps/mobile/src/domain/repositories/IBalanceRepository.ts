/**
 * Balance Repository Interface
 * Defines the contract for balance operations
 */

import { UserBalances, TokenBalance } from "../entities/Balance";

export interface IBalanceRepository {
  /**
   * Get all balances for current user
   */
  getBalances(): Promise<UserBalances>;

  /**
   * Get balance for specific token
   */
  getTokenBalance(tokenSymbol: string): Promise<TokenBalance>;

  /**
   * Get balance by network
   */
  getNetworkBalance(network: string): Promise<TokenBalance>;

  /**
   * Refresh balances from chain
   */
  refreshBalances(): Promise<UserBalances>;
}
