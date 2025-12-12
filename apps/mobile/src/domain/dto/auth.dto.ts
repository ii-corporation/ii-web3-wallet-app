/**
 * Auth DTOs
 * Data Transfer Objects for authentication endpoints
 */

import { User, AccountStatus } from "../entities/User";

// Request DTOs
export interface LoginRequest {
  token: string;
}

// Response DTOs
export interface AuthSyncResponse {
  user: {
    id: string;
    privyEoaAddress: string;
    safeWalletAddress: string | null;
    accountStatus: AccountStatus;
  };
  isNewUser: boolean;
}

export interface AuthMeResponse {
  id: string;
  privyEoaAddress: string;
  hederaAccountId: string | null;
  safeWalletAddress: string | null;
  accountStatus: AccountStatus;
}

export interface AuthNonceResponse {
  nonce: number;
}

export interface AuthVerifyResponse {
  authenticated: boolean;
  message: string;
  userId?: string;
  appId?: string;
  timestamp?: string;
}

// Mappers
export function mapAuthMeToUser(response: AuthMeResponse, privyUserId: string): Partial<User> {
  return {
    id: response.id,
    privyUserId,
    privyEoaAddress: response.privyEoaAddress,
    hederaAccountId: response.hederaAccountId,
    safeWalletAddress: response.safeWalletAddress,
    accountStatus: response.accountStatus,
  };
}
