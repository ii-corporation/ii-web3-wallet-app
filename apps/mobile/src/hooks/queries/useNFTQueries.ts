/**
 * NFT Query Hooks
 * React Query hooks for NFT operations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../../providers/QueryProvider";
import { getApiClient } from "../../infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "../../config/api";
import { NFT, NFTCollection } from "../../domain/entities/NFT";
import { PaginatedResponse } from "../../domain/dto/common.dto";

interface GetNFTsParams {
  collection?: string;
  limit?: number;
  offset?: number;
}

/**
 * Hook to get user's NFTs
 */
export function useUserNFTs(params?: GetNFTsParams) {
  return useQuery({
    queryKey: queryKeys.nfts.userNFTs(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await getApiClient().get<PaginatedResponse<NFT>>(
        API_ENDPOINTS.NFTS.USER_NFTS
      );
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get user's NFTs with infinite scroll
 */
export function useInfiniteUserNFTs(collection?: string, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.nfts.userNFTs({ collection } as Record<string, unknown>),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getApiClient().get<PaginatedResponse<NFT>>(
        API_ENDPOINTS.NFTS.USER_NFTS
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
 * Hook to get NFT by ID
 */
export function useNFT(nftId: string) {
  return useQuery({
    queryKey: queryKeys.nfts.detail(nftId),
    queryFn: async () => {
      const response = await getApiClient().get<NFT>(
        API_ENDPOINTS.NFTS.BY_ID(nftId)
      );
      return response;
    },
    enabled: !!nftId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get NFT collections
 */
export function useNFTCollections() {
  return useQuery({
    queryKey: queryKeys.nfts.collections(),
    queryFn: async () => {
      const response = await getApiClient().get<NFTCollection[]>(
        API_ENDPOINTS.NFTS.COLLECTIONS
      );
      return response;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get specific collection details
 */
export function useNFTCollection(collectionId: string) {
  return useQuery({
    queryKey: [...queryKeys.nfts.collections(), collectionId],
    queryFn: async () => {
      const response = await getApiClient().get<NFTCollection>(
        `${API_ENDPOINTS.NFTS.COLLECTIONS}/${collectionId}`
      );
      return response;
    },
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to transfer NFT
 */
export function useTransferNFT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nftId, toAddress }: { nftId: string; toAddress: string }) => {
      const response = await getApiClient().post<{ transactionId: string }>(
        API_ENDPOINTS.NFTS.TRANSFER,
        { nftId, toAddress }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

/**
 * Convenience hook for NFT gallery data
 */
export function useNFTGallery() {
  const { data: nfts, isLoading: nftsLoading } = useUserNFTs();
  const { data: collections, isLoading: collectionsLoading } = useNFTCollections();

  return {
    nfts: nfts?.data || [],
    collections: collections || [],
    totalNFTs: nfts?.total || 0,
    isLoading: nftsLoading || collectionsLoading,
  };
}
