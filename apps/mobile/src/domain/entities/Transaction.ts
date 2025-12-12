/**
 * Transaction Entity
 * Transaction domain model
 */

export type TransactionStatus =
  | "pending"
  | "queued"
  | "processing"
  | "submitted"
  | "confirmed"
  | "failed";

export type TransactionType =
  | "account_creation"
  | "safe_deployment"
  | "transfer"
  | "withdrawal"
  | "stake"
  | "unstake"
  | "claim"
  | "batch_transfer"
  | "conversion";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  params: Record<string, unknown>;
  priority: number;
  queuePosition: number | null;
  hederaTxId: string | null;
  createdAt: string;
  confirmedAt: string | null;
  errorMessage: string | null;
}

export interface TransactionSummary {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string | null;
  recipient: string | null;
  createdAt: string;
  hederaTxId: string | null;
}

/**
 * Check if transaction is pending/in-progress
 */
export function isTransactionPending(tx: Transaction): boolean {
  return ["pending", "queued", "processing", "submitted"].includes(tx.status);
}

/**
 * Check if transaction is complete (success or failure)
 */
export function isTransactionComplete(tx: Transaction): boolean {
  return tx.status === "confirmed" || tx.status === "failed";
}

/**
 * Get human-readable transaction type label
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    account_creation: "Account Creation",
    safe_deployment: "Wallet Setup",
    transfer: "Transfer",
    withdrawal: "Withdrawal",
    stake: "Stake",
    unstake: "Unstake",
    claim: "Claim Rewards",
    batch_transfer: "Batch Transfer",
    conversion: "Convert Points",
  };
  return labels[type] || type;
}

/**
 * Get transaction status color
 */
export function getTransactionStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    pending: "#f5b35b", // warning
    queued: "#f5b35b",
    processing: "#7c3aed", // primary
    submitted: "#7c3aed",
    confirmed: "#009d69", // success
    failed: "#ee5261", // error
  };
  return colors[status];
}
