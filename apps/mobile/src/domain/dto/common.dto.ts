/**
 * Common DTOs
 * Shared data transfer object types
 */

// Pagination
export interface PaginationRequest {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Sorting
export type SortOrder = "asc" | "desc";

export interface SortRequest {
  sortBy?: string;
  sortOrder?: SortOrder;
}

// Filters
export interface DateRangeFilter {
  from?: string;
  to?: string;
}

// Generic list params
export interface ListParams extends PaginationRequest, SortRequest {
  search?: string;
}

// Helper type for query params
export type QueryParams = Record<string, string | number | boolean | string[] | undefined | null>;

// Helper to build query string from params
export function buildQueryString(params: QueryParams): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`).join("&");
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    });

  return entries.length > 0 ? `?${entries.join("&")}` : "";
}
