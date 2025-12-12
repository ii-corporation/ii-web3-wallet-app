/**
 * Convert Repository Interface
 * Defines the contract for points-to-tokens conversion
 */

import { ConvertRequest, ConvertEstimateRequest, ConvertEstimateResponse, ConvertResponse } from "../dto/convert.dto";

export interface IConvertRepository {
  /**
   * Get conversion estimate
   */
  getEstimate(request: ConvertEstimateRequest): Promise<ConvertEstimateResponse>;

  /**
   * Convert points to tokens
   */
  convert(request: ConvertRequest): Promise<ConvertResponse>;

  /**
   * Get current exchange rate
   */
  getExchangeRate(): Promise<string>;

  /**
   * Get conversion fee percentage
   */
  getFeePercent(): Promise<number>;
}
