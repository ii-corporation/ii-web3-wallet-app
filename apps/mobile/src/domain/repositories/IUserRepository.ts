/**
 * User Repository Interface
 * Defines the contract for user operations
 */

import { User, AccountStatus } from "../entities/User";

export interface UserStatusResponse {
  accountStatus: AccountStatus;
  hederaAccountId: string | null;
  safeWalletAddress: string | null;
}

export interface IUserRepository {
  /**
   * Get user by ID
   */
  getUser(userId: string): Promise<User>;

  /**
   * Get user account status
   */
  getUserStatus(userId: string): Promise<UserStatusResponse>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: Partial<User>): Promise<User>;
}
