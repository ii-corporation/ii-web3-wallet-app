/**
 * User Entity
 * Core user domain model
 */

export type AccountStatus = "pending" | "creating" | "active" | "failed";

export interface User {
  id: string;
  privyUserId: string;
  privyEoaAddress: string;
  hederaAccountId: string | null;
  safeWalletAddress: string | null;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  email: string | null;
  displayName: string | null;
}

export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    marketing: boolean;
  };
  privacy: {
    showBalance: boolean;
    showActivity: boolean;
  };
}

/**
 * Check if user has an active wallet
 */
export function hasActiveWallet(user: User): boolean {
  return user.accountStatus === "active" && user.safeWalletAddress !== null;
}

/**
 * Check if user account is being set up
 */
export function isAccountPending(user: User): boolean {
  return user.accountStatus === "pending" || user.accountStatus === "creating";
}

/**
 * Get the user's primary wallet address
 * Returns Safe wallet if deployed, otherwise Privy EOA
 */
export function getPrimaryWalletAddress(user: User): string {
  return user.safeWalletAddress ?? user.privyEoaAddress;
}
