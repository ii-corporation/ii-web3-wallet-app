/**
 * Convert DTOs
 * Data Transfer Objects for points-to-tokens conversion
 */

import { LockPeriod } from "../entities/Stake";

// Request DTOs
export interface ConvertEstimateRequest {
  pointsAmount: string;
  creatorBoostId?: string;
  lockPeriod: LockPeriod;
}

export interface ConvertRequest {
  pointsAmount: string;
  creatorBoostId?: string;
  lockPeriod: LockPeriod;
}

// Response DTOs
export interface ConvertEstimateResponse {
  pointsAmount: string;
  tokensReceived: string;
  exchangeRate: string;
  feePercent: number;
  feeAmount: string;
  boostBonus?: string;
  estimatedAPR: number;
}

export interface ConvertResponse {
  success: boolean;
  transactionId: string;
  pointsConverted: string;
  tokensReceived: string;
}

// Alias for quote (same as estimate)
export type ConvertQuoteRequest = ConvertEstimateRequest;
export type ConvertQuoteResponse = ConvertEstimateResponse;

// History
export interface ConvertHistoryItem {
  id: string;
  pointsAmount: string;
  tokensReceived: string;
  exchangeRate: string;
  createdAt: string;
  status: "completed" | "pending" | "failed";
}

// Helpers
export interface ConversionSummary {
  pointsAmount: string;
  pointsFormatted: string;
  tokensReceived: string;
  tokensFormatted: string;
  rate: string;
  feePercent: number;
  feeFormatted: string;
  lockPeriod: LockPeriod;
  estimatedAPR: string;
  creatorBoost?: {
    id: string;
    name: string;
    bonus: string;
  };
}

export function formatConversionSummary(
  estimate: ConvertEstimateResponse,
  lockPeriod: LockPeriod,
  creatorName?: string
): ConversionSummary {
  return {
    pointsAmount: estimate.pointsAmount,
    pointsFormatted: formatNumber(estimate.pointsAmount),
    tokensReceived: estimate.tokensReceived,
    tokensFormatted: formatNumber(estimate.tokensReceived),
    rate: estimate.exchangeRate,
    feePercent: estimate.feePercent,
    feeFormatted: formatNumber(estimate.feeAmount),
    lockPeriod,
    estimatedAPR: `${(estimate.estimatedAPR / 100).toFixed(2)}%`,
    creatorBoost: estimate.boostBonus
      ? {
          id: "",
          name: creatorName || "",
          bonus: formatNumber(estimate.boostBonus),
        }
      : undefined,
  };
}

function formatNumber(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
