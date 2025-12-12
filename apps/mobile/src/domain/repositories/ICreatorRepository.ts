/**
 * Creator Repository Interface
 * Defines the contract for creator operations
 */

import { Creator, CreatorCategory, CreatorCardData } from "../entities/Creator";
import { GetCreatorsRequest } from "../dto/creator.dto";
import { PaginatedResponse } from "../dto/common.dto";

export interface CreatorCategoryInfo {
  id: CreatorCategory;
  label: string;
  count: number;
}

export interface ICreatorRepository {
  /**
   * Get creators with filters
   */
  getCreators(params?: GetCreatorsRequest): Promise<PaginatedResponse<Creator>>;

  /**
   * Get creator by ID
   */
  getCreator(creatorId: string): Promise<Creator>;

  /**
   * Search creators by name
   */
  searchCreators(query: string, limit?: number): Promise<Creator[]>;

  /**
   * Get available categories with counts
   */
  getCategories(): Promise<CreatorCategoryInfo[]>;

  /**
   * Get creator card data (optimized for list display)
   */
  getCreatorCards(params?: GetCreatorsRequest): Promise<PaginatedResponse<CreatorCardData>>;
}
