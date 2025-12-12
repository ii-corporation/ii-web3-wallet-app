/**
 * Reward Query Hooks
 * React Query hooks for rewards shop operations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getApiClient } from "../../infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "../../config/api";
import { Reward, RewardCategory, RewardRedemption } from "../../domain/entities/Reward";
import { PaginatedResponse } from "../../domain/dto/common.dto";

interface GetRewardsParams {
  category?: RewardCategory;
  minPoints?: number;
  maxPoints?: number;
  available?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Hook to get available rewards
 */
export function useRewards(params?: GetRewardsParams) {
  return useQuery({
    queryKey: queryKeys.rewards.list(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await getApiClient().get<PaginatedResponse<Reward>>(
        API_ENDPOINTS.REWARDS.BASE
      );
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get rewards with infinite scroll
 */
export function useInfiniteRewards(category?: RewardCategory, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.rewards.list({ category } as Record<string, unknown>),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getApiClient().get<PaginatedResponse<Reward>>(
        API_ENDPOINTS.REWARDS.BASE
      );
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get reward by ID
 */
export function useReward(rewardId: string) {
  return useQuery({
    queryKey: queryKeys.rewards.detail(rewardId),
    queryFn: async () => {
      const response = await getApiClient().get<Reward>(
        API_ENDPOINTS.REWARDS.BY_ID(rewardId)
      );
      return response;
    },
    enabled: !!rewardId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get featured rewards
 */
export function useFeaturedRewards() {
  return useQuery({
    queryKey: [...queryKeys.rewards.all, "featured"],
    queryFn: async () => {
      const response = await getApiClient().get<Reward[]>(
        `${API_ENDPOINTS.REWARDS.BASE}/featured`
      );
      return response;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to get user's reward redemptions
 */
export function useMyRedemptions() {
  return useQuery({
    queryKey: queryKeys.rewards.redemptions(),
    queryFn: async () => {
      const response = await getApiClient().get<RewardRedemption[]>(
        API_ENDPOINTS.REWARDS.MY_REDEMPTIONS
      );
      return response;
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to get redemption by ID
 */
export function useRedemption(redemptionId: string) {
  return useQuery({
    queryKey: [...queryKeys.rewards.redemptions(), redemptionId],
    queryFn: async () => {
      const response = await getApiClient().get<RewardRedemption>(
        `${API_ENDPOINTS.REWARDS.MY_REDEMPTIONS}/${redemptionId}`
      );
      return response;
    },
    enabled: !!redemptionId,
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to redeem a reward
 */
export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, quantity = 1 }: { rewardId: string; quantity?: number }) => {
      const response = await getApiClient().post<RewardRedemption>(
        API_ENDPOINTS.REWARDS.REDEEM,
        { rewardId, quantity }
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate rewards (availability might change)
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.all });
      // Invalidate balances (points deducted)
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
    },
  });
}

/**
 * Hook to get reward categories
 */
export function useRewardCategories() {
  return useQuery({
    queryKey: [...queryKeys.rewards.all, "categories"],
    queryFn: async () => {
      const response = await getApiClient().get<{ category: RewardCategory; count: number }[]>(
        `${API_ENDPOINTS.REWARDS.BASE}/categories`
      );
      return response;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Convenience hook for rewards shop data
 */
export function useRewardsShop(category?: RewardCategory) {
  const { data: rewards, isLoading: rewardsLoading } = useRewards({ category, available: true });
  const { data: featured, isLoading: featuredLoading } = useFeaturedRewards();
  const { data: categories, isLoading: categoriesLoading } = useRewardCategories();

  return {
    rewards: rewards?.data || [],
    featured: featured || [],
    categories: categories || [],
    totalRewards: rewards?.total || 0,
    isLoading: rewardsLoading || featuredLoading || categoriesLoading,
  };
}
