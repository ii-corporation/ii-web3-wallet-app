/**
 * Transaction Query Hooks
 * React Query hooks for transaction operations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getTransactionRepository } from "../../infrastructure/repositories/TransactionRepository";
import { SubmitTransactionRequest, GetTransactionsRequest } from "../../domain/dto/transaction.dto";

/**
 * Hook to get transaction by ID
 */
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionId),
    queryFn: () => getTransactionRepository().getTransaction(transactionId),
    enabled: !!transactionId,
    // Poll for pending transactions
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && ["pending", "queued", "processing", "submitted"].includes(status)) {
        return 5000; // Poll every 5 seconds
      }
      return false;
    },
  });
}

/**
 * Hook to get transactions with filters
 */
export function useTransactions(params?: GetTransactionsRequest) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params as Record<string, unknown>),
    queryFn: () => getTransactionRepository().getTransactions(params),
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get pending transactions
 */
export function usePendingTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.pending(),
    queryFn: () => getTransactionRepository().getPendingTransactions(),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

/**
 * Hook to get transaction history with infinite scroll
 */
export function useTransactionHistory(pageSize = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.history(),
    queryFn: ({ pageParam = 0 }) =>
      getTransactionRepository().getTransactionHistory(pageSize, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to submit a transaction
 */
export function useSubmitTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmitTransactionRequest) =>
      getTransactionRepository().submitTransaction(request),
    onSuccess: () => {
      // Invalidate transaction queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      // Invalidate balances (optimistic update might be stale)
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
    },
  });
}

/**
 * Hook to track a specific transaction's status
 */
export function useTrackTransaction(transactionId: string | null) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionId || ""),
    queryFn: () => getTransactionRepository().getTransaction(transactionId!),
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "confirmed" || status === "failed") {
        return false; // Stop polling
      }
      return 3000; // Poll every 3 seconds
    },
  });
}
