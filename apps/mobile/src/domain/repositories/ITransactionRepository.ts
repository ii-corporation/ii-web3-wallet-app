/**
 * Transaction Repository Interface
 * Defines the contract for transaction operations
 */

import { Transaction, TransactionType, TransactionStatus } from "../entities/Transaction";
import { SubmitTransactionRequest, SubmitTransactionResponse, GetTransactionsRequest } from "../dto/transaction.dto";
import { PaginatedResponse } from "../dto/common.dto";

export interface ITransactionRepository {
  /**
   * Submit a new transaction
   */
  submitTransaction(request: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId: string): Promise<Transaction>;

  /**
   * Get user's transactions
   */
  getTransactions(params?: GetTransactionsRequest): Promise<PaginatedResponse<Transaction>>;

  /**
   * Get pending transactions
   */
  getPendingTransactions(): Promise<Transaction[]>;

  /**
   * Get transaction history (confirmed/failed)
   */
  getTransactionHistory(limit?: number, offset?: number): Promise<PaginatedResponse<Transaction>>;
}
