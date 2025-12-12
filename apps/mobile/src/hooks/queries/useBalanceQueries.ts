/**
 * Balance Query Hooks
 * React Query hooks for balance operations
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getBalanceRepository } from "../../infrastructure/repositories/BalanceRepository";

/**
 * Hook to get all user balances
 */
export function useBalances() {
  return useQuery({
    queryKey: queryKeys.balances.all,
    queryFn: () => getBalanceRepository().getBalances(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Hook to get balance for specific token
 */
export function useTokenBalance(tokenSymbol: string) {
  return useQuery({
    queryKey: queryKeys.balances.byToken(tokenSymbol),
    queryFn: () => getBalanceRepository().getTokenBalance(tokenSymbol),
    enabled: !!tokenSymbol,
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get balance for specific network
 */
export function useNetworkBalance(network: string) {
  return useQuery({
    queryKey: queryKeys.balances.byNetwork(network),
    queryFn: () => getBalanceRepository().getNetworkBalance(network),
    enabled: !!network,
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get refreshBalances function
 */
export function useRefreshBalances() {
  const queryClient = useQueryClient();

  return {
    refreshBalances: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
    },
  };
}

/**
 * Hook to get total balance (ZOOP + Points)
 */
export function useTotalBalance() {
  const { data: balances, isLoading, error } = useBalances();

  return {
    totalTokens: balances?.total.availableFormatted ?? "0",
    totalPoints: balances?.pointsFormatted ?? "0",
    isLoading,
    error,
  };
}
