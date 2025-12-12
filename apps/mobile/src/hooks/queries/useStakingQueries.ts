/**
 * Staking Query Hooks
 * React Query hooks for staking operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getStakingRepository } from "../../infrastructure/repositories/StakingRepository";
import { StakeRequest, ClaimRewardsRequest } from "../../domain/dto/staking.dto";

/**
 * Hook to get all staking pools
 */
export function useStakingPools() {
  return useQuery({
    queryKey: queryKeys.staking.pools(),
    queryFn: () => getStakingRepository().getPools(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a specific pool
 */
export function useStakingPool(poolId: string) {
  return useQuery({
    queryKey: queryKeys.staking.pool(poolId),
    queryFn: () => getStakingRepository().getPool(poolId),
    enabled: !!poolId,
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to get user's stakes
 */
export function useUserStakes() {
  return useQuery({
    queryKey: queryKeys.staking.userStakes(),
    queryFn: () => getStakingRepository().getUserStakes(),
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get stake summary
 */
export function useStakeSummary() {
  return useQuery({
    queryKey: queryKeys.staking.summary(),
    queryFn: () => getStakingRepository().getStakeSummary(),
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get pending rewards
 */
export function usePendingRewards() {
  return useQuery({
    queryKey: queryKeys.staking.pendingRewards(),
    queryFn: () => getStakingRepository().getPendingRewards(),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

/**
 * Hook to stake tokens
 */
export function useStake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StakeRequest) => getStakingRepository().stake(request),
    onSuccess: () => {
      // Invalidate staking queries
      queryClient.invalidateQueries({ queryKey: queryKeys.staking.all });
      // Invalidate balances
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
      // Invalidate transactions
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

/**
 * Hook to unstake tokens
 */
export function useUnstake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stakeId: string) => getStakingRepository().unstake(stakeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

/**
 * Hook to claim rewards
 */
export function useClaimRewards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ClaimRewardsRequest) => getStakingRepository().claimRewards(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staking.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

/**
 * Convenience hook for staking dashboard data
 */
export function useStakingDashboard() {
  const { data: stakes, isLoading: stakesLoading } = useUserStakes();
  const { data: summary, isLoading: summaryLoading } = useStakeSummary();
  const { data: pendingRewards, isLoading: rewardsLoading } = usePendingRewards();

  return {
    stakes: stakes || [],
    summary,
    pendingRewards: pendingRewards || "0",
    isLoading: stakesLoading || summaryLoading || rewardsLoading,
  };
}
