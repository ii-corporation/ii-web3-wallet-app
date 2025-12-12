/**
 * Balance Repository Implementation
 */

import { API_ENDPOINTS } from "../../config/api";
import { IBalanceRepository } from "../../domain/repositories/IBalanceRepository";
import { UserBalances, TokenBalance, formatTokenAmount } from "../../domain/entities/Balance";
import { UserBalancesResponse, mapToTokenBalance } from "../../domain/dto/balance.dto";
import { getApiClient } from "../http/ApiClient";

export class BalanceRepository implements IBalanceRepository {
  async getBalances(): Promise<UserBalances> {
    const response = await getApiClient().get<UserBalancesResponse>(API_ENDPOINTS.BALANCES.BASE);

    // Map response to UserBalances
    const byNetwork: Record<string, TokenBalance> = {};
    let totalBalance = 0n;

    for (const balance of response.balances) {
      // Assuming network info is embedded or can be derived
      const network = "hedera"; // Default for now
      const tokenBalance = mapToTokenBalance(balance, network);
      byNetwork[network] = tokenBalance;
      totalBalance += BigInt(tokenBalance.available);
    }

    const total: TokenBalance = {
      symbol: "ZOOP",
      balance: totalBalance.toString(),
      balanceFormatted: formatTokenAmount(totalBalance.toString()),
      pending: "0",
      available: totalBalance.toString(),
      availableFormatted: formatTokenAmount(totalBalance.toString()),
      network: "all",
    };

    return {
      total,
      byNetwork,
      points: response.points,
      pointsFormatted: formatTokenAmount(response.points, 0, 0),
    };
  }

  async getTokenBalance(tokenSymbol: string): Promise<TokenBalance> {
    const response = await getApiClient().get<UserBalancesResponse>(
      API_ENDPOINTS.BALANCES.BY_TOKEN(tokenSymbol)
    );

    const balance = response.balances[0];
    if (!balance) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    return mapToTokenBalance(balance, "hedera");
  }

  async getNetworkBalance(network: string): Promise<TokenBalance> {
    const balances = await this.getBalances();
    const networkBalance = balances.byNetwork[network];

    if (!networkBalance) {
      throw new Error(`Network ${network} not found`);
    }

    return networkBalance;
  }

  async refreshBalances(): Promise<UserBalances> {
    // Force refresh by adding a cache-busting param or header
    // For now, just re-fetch
    return this.getBalances();
  }
}

// Singleton instance
let balanceRepositoryInstance: BalanceRepository | null = null;

export function getBalanceRepository(): IBalanceRepository {
  if (!balanceRepositoryInstance) {
    balanceRepositoryInstance = new BalanceRepository();
  }
  return balanceRepositoryInstance;
}
