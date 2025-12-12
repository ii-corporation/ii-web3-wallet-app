/**
 * Auth Repository Interface
 * Defines the contract for authentication operations
 * Follows Interface Segregation Principle
 */

import { AuthSyncResponse, AuthMeResponse, AuthNonceResponse, AuthVerifyResponse } from "../dto/auth.dto";

export interface IAuthRepository {
  /**
   * Sync user with backend after Privy authentication
   */
  syncUser(): Promise<AuthSyncResponse>;

  /**
   * Get current authenticated user
   */
  getMe(): Promise<AuthMeResponse>;

  /**
   * Get current nonce for transaction signing
   */
  getNonce(): Promise<AuthNonceResponse>;

  /**
   * Verify authentication token
   */
  verifyAuth(): Promise<AuthVerifyResponse>;
}
