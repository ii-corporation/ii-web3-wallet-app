/**
 * Convert Service
 * Business logic for points-to-tokens conversion
 */

import { getApiClient } from "../infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "../config/api";
import { getQueryClient, queryKeys } from "../providers/QueryProvider";
import {
  ConvertQuoteRequest,
  ConvertQuoteResponse,
  ConvertRequest,
  ConvertResponse,
} from "../domain/dto/convert.dto";

export interface ConversionValidation {
  isValid: boolean;
  error?: string;
}

export interface ConversionRate {
  rate: number; // Points per token
  minPoints: number;
  maxPoints: number;
  lastUpdated: string;
}

/**
 * Validate conversion request
 */
export function validateConversion(
  pointsAmount: number,
  availablePoints: number,
  rate: ConversionRate
): ConversionValidation {
  if (pointsAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  if (pointsAmount > availablePoints) {
    return { isValid: false, error: "Insufficient points balance" };
  }

  if (pointsAmount < rate.minPoints) {
    return {
      isValid: false,
      error: `Minimum conversion is ${rate.minPoints.toLocaleString()} points`,
    };
  }

  if (pointsAmount > rate.maxPoints) {
    return {
      isValid: false,
      error: `Maximum conversion is ${rate.maxPoints.toLocaleString()} points`,
    };
  }

  return { isValid: true };
}

/**
 * Calculate tokens received for given points
 */
export function calculateTokensFromPoints(
  pointsAmount: number,
  rate: number
): { tokens: number; tokensFormatted: string } {
  const tokens = pointsAmount / rate;
  return {
    tokens,
    tokensFormatted: tokens.toFixed(2),
  };
}

/**
 * Calculate points needed for given tokens
 */
export function calculatePointsForTokens(
  tokensAmount: number,
  rate: number
): { points: number; pointsFormatted: string } {
  const points = Math.ceil(tokensAmount * rate);
  return {
    points,
    pointsFormatted: points.toLocaleString(),
  };
}

/**
 * Get conversion quote from backend
 */
export async function getConversionQuote(
  pointsAmount: number,
  lockPeriod: number = 30
): Promise<ConvertQuoteResponse> {
  const response = await getApiClient().post<ConvertQuoteResponse>(
    API_ENDPOINTS.CONVERT.QUOTE,
    { pointsAmount: String(pointsAmount), lockPeriod } as unknown as ConvertQuoteRequest
  );
  return response;
}

/**
 * Execute conversion
 */
export async function executeConversion(
  request: ConvertRequest
): Promise<ConvertResponse> {
  const response = await getApiClient().post<ConvertResponse>(
    API_ENDPOINTS.CONVERT.CONVERT,
    request
  );

  // Invalidate related queries
  const queryClient = getQueryClient();
  queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.convert.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });

  return response;
}

/**
 * Check if conversion is currently available
 */
export async function checkConversionAvailability(): Promise<{
  available: boolean;
  reason?: string;
  nextAvailable?: Date;
}> {
  try {
    const response = await getApiClient().get<{
      available: boolean;
      reason?: string;
      nextAvailable?: string;
    }>(`${API_ENDPOINTS.CONVERT.BASE}/availability`);

    return {
      available: response.available,
      reason: response.reason,
      nextAvailable: response.nextAvailable
        ? new Date(response.nextAvailable)
        : undefined,
    };
  } catch (error) {
    return { available: false, reason: "Unable to check availability" };
  }
}

/**
 * Format conversion for display
 */
export function formatConversionSummary(
  pointsAmount: number,
  tokensReceived: number,
  rate: number
): string {
  return `${pointsAmount.toLocaleString()} points → ${tokensReceived.toFixed(2)} ZOOP (rate: ${rate}:1)`;
}
