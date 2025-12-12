/**
 * Creator Query Hooks
 * React Query hooks for creator operations
 */

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getCreatorRepository } from "../../infrastructure/repositories/CreatorRepository";
import { GetCreatorsRequest } from "../../domain/dto/creator.dto";
import { CreatorCategory } from "../../domain/entities/Creator";

/**
 * Hook to get creators with filters
 */
export function useCreators(params?: GetCreatorsRequest) {
  return useQuery({
    queryKey: queryKeys.creators.list(params as Record<string, unknown>),
    queryFn: () => getCreatorRepository().getCreators(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get creators with infinite scroll
 */
export function useInfiniteCreators(
  category?: CreatorCategory,
  search?: string,
  pageSize = 20
) {
  return useInfiniteQuery({
    queryKey: queryKeys.creators.list({ category, search }),
    queryFn: ({ pageParam = 0 }) =>
      getCreatorRepository().getCreators({
        category,
        search,
        limit: pageSize,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * pageSize;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get creator by ID
 */
export function useCreator(creatorId: string) {
  return useQuery({
    queryKey: queryKeys.creators.detail(creatorId),
    queryFn: () => getCreatorRepository().getCreator(creatorId),
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to search creators
 */
export function useSearchCreators(query: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.creators.search(query),
    queryFn: () => getCreatorRepository().searchCreators(query, limit),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get creator categories
 */
export function useCreatorCategories() {
  return useQuery({
    queryKey: queryKeys.creators.categories(),
    queryFn: () => getCreatorRepository().getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour (categories rarely change)
  });
}

/**
 * Hook to get creator cards for display
 */
export function useCreatorCards(params?: GetCreatorsRequest) {
  return useQuery({
    queryKey: [...queryKeys.creators.list(params as Record<string, unknown>), "cards"],
    queryFn: () => getCreatorRepository().getCreatorCards(params),
    staleTime: 1000 * 60 * 5,
  });
}
