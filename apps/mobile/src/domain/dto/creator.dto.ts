/**
 * Creator DTOs
 * Data Transfer Objects for creator endpoints
 */

import { Creator, CreatorCategory, CreatorCardData } from "../entities/Creator";

// Request DTOs
export interface GetCreatorsRequest {
  category?: CreatorCategory;
  search?: string;
  limit?: number;
  offset?: number;
}

// Response DTOs
export interface CreatorResponse {
  id: string;
  name: string;
  category: CreatorCategory;
  avatarUrl: string;
  coverUrl?: string;
  bio: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    threads?: string;
    youtube?: string;
    tiktok?: string;
  };
  poolId: string | null;
  totalStaked: string;
  stakersCount: number;
  minAPR: number;
  maxAPR: number;
  stakingBenefits: string[];
  contractAddress?: string;
  isVerified: boolean;
}

export interface CreatorsListResponse {
  data: CreatorResponse[];
  total: number;
  hasMore: boolean;
}

export interface CreatorCategoriesResponse {
  categories: Array<{
    id: CreatorCategory;
    label: string;
    count: number;
  }>;
}

// Mappers
export function mapCreatorResponse(response: CreatorResponse): Creator {
  return {
    id: response.id,
    name: response.name,
    category: response.category,
    avatarUrl: response.avatarUrl,
    coverUrl: response.coverUrl,
    bio: response.bio,
    socialLinks: response.socialLinks,
    poolId: response.poolId,
    totalStaked: response.totalStaked,
    stakersCount: response.stakersCount,
    minAPR: response.minAPR,
    maxAPR: response.maxAPR,
    stakingBenefits: response.stakingBenefits,
    contractAddress: response.contractAddress,
    isVerified: response.isVerified,
  };
}

export function mapCreatorToCardData(creator: Creator): CreatorCardData {
  const minAPR = (creator.minAPR / 100).toFixed(2);
  const maxAPR = (creator.maxAPR / 100).toFixed(2);

  return {
    id: creator.id,
    name: creator.name,
    category: creator.category,
    avatarUrl: creator.avatarUrl,
    totalStaked: creator.totalStaked,
    stakersCount: creator.stakersCount,
    aprRange: `${minAPR}% - ${maxAPR}%`,
  };
}
