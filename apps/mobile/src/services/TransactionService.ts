/**
 * Transaction Service
 * Business logic for transaction operations
 */

import { getTransactionRepository } from "../infrastructure/repositories/TransactionRepository";
import { getQueryClient, queryKeys } from "../providers/QueryProvider";
import { useTransactionStore, TransactionStatus as UITransactionStatus } from "../stores/transactionStore";
import { Transaction, TransactionType } from "../domain/entities/Transaction";
import { SubmitTransactionRequest, SubmitTransactionResponse } from "../domain/dto/transaction.dto";

export interface TransactionCallbacks {
  onStatusChange?: (status: UITransactionStatus) => void;
  onConfirmed?: (transaction: Transaction) => void;
  onFailed?: (error: Error) => void;
}

/**
 * Submit a transaction and track its status
 */
export async function submitTransaction(
  request: SubmitTransactionRequest,
  callbacks?: TransactionCallbacks
): Promise<Transaction> {
  const store = useTransactionStore.getState();
  const txId = `tx-${Date.now()}`;

  try {
    // Start tracking
    store.startTransaction(txId, request.type);
    callbacks?.onStatusChange?.("preparing");

    // Update to signing status
    store.updateStatus("signing");
    callbacks?.onStatusChange?.("signing");

    // Submit to backend
    store.updateStatus("submitting");
    callbacks?.onStatusChange?.("submitting");

    const submitResponse = await getTransactionRepository().submitTransaction(request);

    // Update with hash and start confirming
    store.updateStatus("confirming", submitResponse.transactionId);
    callbacks?.onStatusChange?.("confirming");

    // Poll for confirmation
    const confirmedTx = await pollTransactionStatus(submitResponse.transactionId);

    if (confirmedTx.status === "confirmed") {
      store.updateStatus("confirmed");
      callbacks?.onStatusChange?.("confirmed");
      callbacks?.onConfirmed?.(confirmedTx);

      // Invalidate relevant queries
      invalidateTransactionRelatedQueries(request.type);
    } else if (confirmedTx.status === "failed") {
      const error = new Error(confirmedTx.errorMessage || "Transaction failed");
      store.setError(error.message);
      callbacks?.onFailed?.(error);
      throw error;
    }

    return confirmedTx;
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Transaction failed");
    store.setError(err.message);
    callbacks?.onFailed?.(err);
    throw error;
  }
}

/**
 * Poll transaction status until confirmed or failed
 */
async function pollTransactionStatus(
  transactionId: string,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<Transaction> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const tx = await getTransactionRepository().getTransaction(transactionId);

    if (tx.status === "confirmed" || tx.status === "failed") {
      return tx;
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Transaction confirmation timeout");
}

/**
 * Invalidate queries based on transaction type
 */
function invalidateTransactionRelatedQueries(type: TransactionType): void {
  const queryClient = getQueryClient();

  // Always invalidate transactions
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });

  // Type-specific invalidations
  switch (type) {
    case "stake":
    case "unstake":
    case "claim":
      queryClient.invalidateQueries({ queryKey: queryKeys.staking.all });
      break;
    case "conversion":
      queryClient.invalidateQueries({ queryKey: queryKeys.convert.all });
      break;
    case "transfer":
    case "batch_transfer":
      // NFTs might be affected by transfers
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all });
      break;
  }
}

/**
 * Get pending transactions for the current user
 */
export async function getPendingTransactions(): Promise<Transaction[]> {
  return getTransactionRepository().getPendingTransactions();
}

/**
 * Cancel a pending transaction (if supported)
 */
export async function cancelTransaction(transactionId: string): Promise<boolean> {
  // Note: Implementation depends on backend support
  // For now, this is a placeholder
  console.warn("[TransactionService] Cancel not implemented");
  return false;
}

/**
 * Estimate gas/fees for a transaction
 */
export async function estimateTransactionFee(
  type: TransactionType,
  amount: string
): Promise<{ fee: string; feeFormatted: string }> {
  // This would call a backend endpoint to estimate fees
  // Placeholder implementation
  return {
    fee: "0",
    feeFormatted: "0 HBAR",
  };
}
