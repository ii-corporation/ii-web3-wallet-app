export type AccountStatus = 'pending' | 'creating' | 'active' | 'failed';

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

export interface UserPublic {
  id: string;
  privyEoaAddress: string;
  hederaAccountId: string | null;
  safeWalletAddress: string | null;
  accountStatus: AccountStatus;
}
