/**
 * Convert Query Hooks
 * React Query hooks for points-to-tokens conversion operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getApiClient } from "../../infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "../../config/api";
import {
  ConvertQuoteRequest,
  ConvertQuoteResponse,
  ConvertRequest,
  ConvertResponse,
  ConvertHistoryItem,
} from "../../domain/dto/convert.dto";
import { PaginatedResponse } from "../../domain/dto/common.dto";

/**
 * Hook to get conversion rate
 */
export function useConversionRate() {
  return useQuery({
    queryKey: queryKeys.convert.rate(),
    queryFn: async () => {
      const response = await getApiClient().get<{ rate: number; minPoints: number; maxPoints: number }>(
        API_ENDPOINTS.CONVERT.RATE
      );
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refresh every 10 minutes
  });
}

/**
 * Hook to get conversion quote
 */
export function useConversionQuote(pointsAmount: number, lockPeriod: number = 30) {
  return useQuery({
    queryKey: queryKeys.convert.quote(pointsAmount),
    queryFn: async () => {
      const response = await getApiClient().post<ConvertQuoteResponse>(
        API_ENDPOINTS.CONVERT.QUOTE,
        { pointsAmount: String(pointsAmount), lockPeriod } as unknown as ConvertQuoteRequest
      );
      return response;
    },
    enabled: pointsAmount > 0,
    staleTime: 1000 * 30, // 30 seconds (quotes expire)
  });
}

/**
 * Hook to get conversion history
 */
export function useConversionHistory() {
  return useQuery({
    queryKey: queryKeys.convert.history(),
    queryFn: async () => {
      const response = await getApiClient().get<PaginatedResponse<ConvertHistoryItem>>(
        API_ENDPOINTS.CONVERT.HISTORY
      );
      return response.data;
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to convert points to tokens
 */
export function useConvertPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ConvertRequest) => {
      const response = await getApiClient().post<ConvertResponse>(
        API_ENDPOINTS.CONVERT.CONVERT,
        request
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate balances (points decreased, tokens increased)
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
      // Invalidate convert history
      queryClient.invalidateQueries({ queryKey: queryKeys.convert.history() });
      // Invalidate transactions
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

/**
 * Hook to check if conversion is available
 */
export function useConversionAvailability() {
  return useQuery({
    queryKey: [...queryKeys.convert.all, "availability"],
    queryFn: async () => {
      const response = await getApiClient().get<{
        available: boolean;
        reason?: string;
        nextAvailable?: string;
      }>(`${API_ENDPOINTS.CONVERT.BASE}/availability`);
      return response;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Convenience hook for conversion page data
 */
export function useConversionData() {
  const { data: rate, isLoading: rateLoading, error: rateError } = useConversionRate();
  const { data: history, isLoading: historyLoading } = useConversionHistory();
  const { data: availability, isLoading: availabilityLoading } = useConversionAvailability();

  return {
    rate: rate?.rate ?? 0,
    minPoints: rate?.minPoints ?? 0,
    maxPoints: rate?.maxPoints ?? Infinity,
    history: history || [],
    isAvailable: availability?.available ?? false,
    unavailableReason: availability?.reason,
    isLoading: rateLoading || historyLoading || availabilityLoading,
    error: rateError,
  };
}
