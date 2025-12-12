/**
 * Auth Query Hooks
 * React Query hooks for authentication operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getAuthRepository } from "../../infrastructure/repositories/AuthRepository";

/**
 * Hook to get current user data
 */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => getAuthRepository().getMe(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get current nonce for signing
 */
export function useNonce() {
  return useQuery({
    queryKey: queryKeys.auth.nonce(),
    queryFn: () => getAuthRepository().getNonce(),
    staleTime: 0, // Always fetch fresh
    gcTime: 0, // Don't cache
  });
}

/**
 * Hook to sync user with backend
 */
export function useSyncUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getAuthRepository().syncUser(),
    onSuccess: (data) => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      // Also invalidate user queries if we have the user ID
      if (data.user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(data.user.id) });
      }
    },
  });
}

/**
 * Hook to verify authentication
 */
export function useVerifyAuth() {
  return useQuery({
    queryKey: [...queryKeys.auth.all, "verify"],
    queryFn: () => getAuthRepository().verifyAuth(),
    staleTime: 1000 * 60, // 1 minute
    retry: false,
  });
}
