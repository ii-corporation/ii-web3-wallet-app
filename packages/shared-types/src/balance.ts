export type DepositStatus = 'pending' | 'confirmed' | 'failed';
export type WithdrawalStatus = 'pending' | 'queued' | 'processing' | 'confirmed' | 'failed';

export interface Deposit {
  id: string;
  userId: string;
  tokenSymbol: string;
  amount: string;
  fromAddress: string;
  hederaTxId?: string;
  status: DepositStatus;
  createdAt: string;
  confirmedAt?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  tokenSymbol: string;
  amount: string;
  toAddress: string;
  hederaTxId?: string;
  status: WithdrawalStatus;
  queuePosition?: number;
  createdAt: string;
  queuedAt?: string;
  confirmedAt?: string;
  failedAt?: string;
  errorMessage?: string;
}

export interface Balance {
  userId: string;
  tokenSymbol: string;
  onChainBalance: string;
  pendingDeposits: Deposit[];
  pendingWithdrawals: Withdrawal[];
  availableBalance: string;
  lastSyncedAt?: string;
}

export interface BalanceSummary {
  zoop: {
    available: string;
    pendingIn: string;
    pendingOut: string;
    total: string;
  };
  hbar?: {
    available: string;
  };
  deposits: Deposit[];
  withdrawals: Withdrawal[];
}
