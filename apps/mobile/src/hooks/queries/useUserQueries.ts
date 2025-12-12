/**
 * User Query Hooks
 * React Query hooks for user profile operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getApiClient } from "../../infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "../../config/api";
import { User, UserProfile, UserSettings } from "../../domain/entities/User";

interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

interface UpdateSettingsRequest {
  notifications?: {
    push?: boolean;
    email?: boolean;
    marketing?: boolean;
  };
  privacy?: {
    showBalance?: boolean;
    showActivity?: boolean;
  };
}

/**
 * Hook to get user by ID
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user.detail(userId),
    queryFn: async () => {
      const response = await getApiClient().get<User>(
        API_ENDPOINTS.USERS.BY_ID(userId)
      );
      return response;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get user profile
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: [...queryKeys.user.detail(userId), "profile"],
    queryFn: async () => {
      const response = await getApiClient().get<UserProfile>(
        API_ENDPOINTS.USERS.PROFILE(userId)
      );
      return response;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get current user's settings
 */
export function useUserSettings() {
  return useQuery({
    queryKey: [...queryKeys.user.all, "settings"],
    queryFn: async () => {
      const response = await getApiClient().get<UserSettings>(
        `${API_ENDPOINTS.USERS.BASE}/me/settings`
      );
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await getApiClient().patch<User>(
        `${API_ENDPOINTS.USERS.BASE}/me/profile`,
        data
      );
      return response;
    },
    onSuccess: (data) => {
      // Update the user cache
      queryClient.setQueryData(queryKeys.auth.me(), data);
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const response = await getApiClient().patch<UserSettings>(
        `${API_ENDPOINTS.USERS.BASE}/me/settings`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.user.all, "settings"] });
    },
  });
}

/**
 * Hook to get user's activity stats
 */
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: [...queryKeys.user.detail(userId), "stats"],
    queryFn: async () => {
      const response = await getApiClient().get<{
        totalTransactions: number;
        totalStaked: string;
        totalRewardsEarned: string;
        creatorsSupportedCount: number;
        nftsOwned: number;
        memberSince: string;
      }>(`${API_ENDPOINTS.USERS.BY_ID(userId)}/stats`);
      return response;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get leaderboard position
 */
export function useLeaderboardPosition() {
  return useQuery({
    queryKey: [...queryKeys.user.all, "leaderboard"],
    queryFn: async () => {
      const response = await getApiClient().get<{
        rank: number;
        totalUsers: number;
        percentile: number;
      }>(`${API_ENDPOINTS.USERS.BASE}/me/leaderboard`);
      return response;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to delete user account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await getApiClient().delete(`${API_ENDPOINTS.USERS.BASE}/me`);
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}
