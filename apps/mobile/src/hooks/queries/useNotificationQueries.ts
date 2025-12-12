/**
 * Notification Query Hooks
 * React Query hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getApiClient } from "../../infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "../../config/api";
import { AppNotification, NotificationType } from "../../domain/entities/Notification";
import { PaginatedResponse } from "../../domain/dto/common.dto";

interface GetNotificationsParams {
  type?: NotificationType;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Hook to get notifications
 */
export function useNotifications(params?: GetNotificationsParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await getApiClient().get<PaginatedResponse<AppNotification>>(
        API_ENDPOINTS.NOTIFICATIONS.BASE
      );
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Hook to get notifications with infinite scroll
 */
export function useInfiniteNotifications(type?: NotificationType, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list({ type } as Record<string, unknown>),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getApiClient().get<PaginatedResponse<AppNotification>>(
        API_ENDPOINTS.NOTIFICATIONS.BASE
      );
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await getApiClient().get<{ count: number }>(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
      );
      return response.count;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // Check every minute
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await getApiClient().patch(
        API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await getApiClient().patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await getApiClient().delete(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Record<NotificationType, boolean>) => {
      const response = await getApiClient().patch<Record<NotificationType, boolean>>(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}/preferences`,
        { preferences }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.user.all, "settings"] });
    },
  });
}

/**
 * Hook to get notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, "preferences"],
    queryFn: async () => {
      const response = await getApiClient().get<Record<NotificationType, boolean>>(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}/preferences`
      );
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Convenience hook for notification badge
 */
export function useNotificationBadge() {
  const { data: count, isLoading } = useUnreadCount();

  return {
    count: count || 0,
    hasUnread: (count || 0) > 0,
    isLoading,
  };
}
