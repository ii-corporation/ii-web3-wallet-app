/**
 * Creator Repository Implementation
 */

import { API_ENDPOINTS } from "../../config/api";
import { ICreatorRepository, CreatorCategoryInfo } from "../../domain/repositories/ICreatorRepository";
import { Creator, CreatorCardData } from "../../domain/entities/Creator";
import {
  GetCreatorsRequest,
  CreatorsListResponse,
  CreatorResponse,
  CreatorCategoriesResponse,
  mapCreatorResponse,
  mapCreatorToCardData,
} from "../../domain/dto/creator.dto";
import { PaginatedResponse, buildQueryString, QueryParams } from "../../domain/dto/common.dto";
import { getApiClient } from "../http/ApiClient";

export class CreatorRepository implements ICreatorRepository {
  async getCreators(params?: GetCreatorsRequest): Promise<PaginatedResponse<Creator>> {
    const queryString = buildQueryString((params || {}) as QueryParams);
    const response = await getApiClient().get<CreatorsListResponse>(
      `${API_ENDPOINTS.CREATORS.BASE}${queryString}`
    );

    return {
      data: response.data.map(mapCreatorResponse),
      total: response.total,
      limit: params?.limit || 20,
      offset: params?.offset || 0,
      hasMore: response.hasMore,
    };
  }

  async getCreator(creatorId: string): Promise<Creator> {
    const response = await getApiClient().get<CreatorResponse>(
      API_ENDPOINTS.CREATORS.BY_ID(creatorId)
    );
    return mapCreatorResponse(response);
  }

  async searchCreators(query: string, limit = 10): Promise<Creator[]> {
    const queryString = buildQueryString({ search: query, limit } as QueryParams);
    const response = await getApiClient().get<CreatorsListResponse>(
      `${API_ENDPOINTS.CREATORS.SEARCH}${queryString}`
    );
    return response.data.map(mapCreatorResponse);
  }

  async getCategories(): Promise<CreatorCategoryInfo[]> {
    const response = await getApiClient().get<CreatorCategoriesResponse>(
      API_ENDPOINTS.CREATORS.CATEGORIES
    );
    return response.categories;
  }

  async getCreatorCards(params?: GetCreatorsRequest): Promise<PaginatedResponse<CreatorCardData>> {
    const creators = await this.getCreators(params);
    return {
      ...creators,
      data: creators.data.map(mapCreatorToCardData),
    };
  }
}

// Singleton instance
let creatorRepositoryInstance: CreatorRepository | null = null;

export function getCreatorRepository(): ICreatorRepository {
  if (!creatorRepositoryInstance) {
    creatorRepositoryInstance = new CreatorRepository();
  }
  return creatorRepositoryInstance;
}
