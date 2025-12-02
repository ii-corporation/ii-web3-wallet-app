export type TransactionStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'submitted'
  | 'confirmed'
  | 'failed';

export type TransactionType =
  | 'account_creation'
  | 'safe_deployment'
  | 'transfer'
  | 'withdrawal'
  | 'stake'
  | 'unstake'
  | 'claim'
  | 'batch_transfer';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  params: Record<string, unknown>;
  priority: number;
  queuePosition?: number;
  hederaTxId?: string;
  createdAt: string;
  queuedAt?: string;
  submittedAt?: string;
  confirmedAt?: string;
  failedAt?: string;
  errorMessage?: string;
}

export interface TransactionSubmit {
  type: TransactionType;
  params: Record<string, unknown>;
  nonce: number;
  deadline: number;
  signature: string;
}

export interface TransactionStatusResponse {
  transactionId: string;
  status: TransactionStatus;
  queuePosition?: number;
  estimatedWaitSeconds?: number;
  hederaTxId?: string;
}
