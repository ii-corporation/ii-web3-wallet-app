/**
 * Query Provider
 * Configures and provides the TanStack Query client
 */

import React from "react";
import { QueryClient, QueryClientProvider as TanStackQueryProvider } from "@tanstack/react-query";
import { ENV } from "../config/env";

/**
 * Query client configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 1 minute
      staleTime: 1000 * 60,
      // Cache data for 5 minutes
      gcTime: 1000 * 60 * 5,
      // Retry failed requests twice
      retry: 2,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus in dev (can be noisy)
      refetchOnWindowFocus: !ENV.IS_DEV,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Log errors in development
      onError: ENV.IS_DEV
        ? (error) => {
            console.error("[Mutation Error]", error);
          }
        : undefined,
    },
  },
});

/**
 * Get the query client instance
 * Useful for imperative cache operations
 */
export function getQueryClient(): QueryClient {
  return queryClient;
}

/**
 * Query keys factory
 * Centralized key management for cache invalidation
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
    nonce: () => [...queryKeys.auth.all, "nonce"] as const,
  },

  // User
  user: {
    all: ["user"] as const,
    detail: (id: string) => [...queryKeys.user.all, id] as const,
    status: (id: string) => [...queryKeys.user.all, id, "status"] as const,
  },

  // Balances
  balances: {
    all: ["balances"] as const,
    total: () => [...queryKeys.balances.all, "total"] as const,
    byNetwork: (network: string) => [...queryKeys.balances.all, "network", network] as const,
    byToken: (token: string) => [...queryKeys.balances.all, "token", token] as const,
  },

  // Transactions
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all, id] as const,
    pending: () => [...queryKeys.transactions.all, "pending"] as const,
    history: () => [...queryKeys.transactions.all, "history"] as const,
  },

  // Staking
  staking: {
    all: ["staking"] as const,
    pools: () => [...queryKeys.staking.all, "pools"] as const,
    pool: (id: string) => [...queryKeys.staking.all, "pool", id] as const,
    userStakes: () => [...queryKeys.staking.all, "user-stakes"] as const,
    summary: () => [...queryKeys.staking.all, "summary"] as const,
    pendingRewards: () => [...queryKeys.staking.all, "pending-rewards"] as const,
  },

  // Creators
  creators: {
    all: ["creators"] as const,
    lists: () => [...queryKeys.creators.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.creators.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.creators.all, id] as const,
    search: (query: string) => [...queryKeys.creators.all, "search", query] as const,
    categories: () => [...queryKeys.creators.all, "categories"] as const,
  },

  // NFTs
  nfts: {
    all: ["nfts"] as const,
    lists: () => [...queryKeys.nfts.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.nfts.lists(), filters] as const,
    userNFTs: (filters?: Record<string, unknown>) =>
      [...queryKeys.nfts.all, "user", filters] as const,
    detail: (id: string) => [...queryKeys.nfts.all, id] as const,
    collections: () => [...queryKeys.nfts.all, "collections"] as const,
  },

  // Rewards
  rewards: {
    all: ["rewards"] as const,
    lists: () => [...queryKeys.rewards.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.rewards.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.rewards.all, id] as const,
    shop: () => [...queryKeys.rewards.all, "shop"] as const,
    giftCards: () => [...queryKeys.rewards.all, "gift-cards"] as const,
    redemptions: () => [...queryKeys.rewards.all, "redemptions"] as const,
  },

  // Convert
  convert: {
    all: ["convert"] as const,
    rate: () => [...queryKeys.convert.all, "rate"] as const,
    quote: (amount: number) => [...queryKeys.convert.all, "quote", amount] as const,
    history: () => [...queryKeys.convert.all, "history"] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.notifications.lists(), filters] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unread-count"] as const,
  },
} as const;

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <TanStackQueryProvider client={queryClient}>
      {children}
    </TanStackQueryProvider>
  );
}
