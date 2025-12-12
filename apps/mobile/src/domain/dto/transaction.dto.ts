/**
 * Transaction DTOs
 * Data Transfer Objects for transaction endpoints
 */

import { TransactionType, TransactionStatus, Transaction } from "../entities/Transaction";

// Request DTOs
export interface SubmitTransactionRequest {
  type: TransactionType;
  params: Record<string, unknown>;
  nonce: number;
  deadline: number;
  signature: string;
}

export interface GetTransactionsRequest {
  status?: TransactionStatus[];
  type?: TransactionType[];
  limit?: number;
  offset?: number;
}

// Response DTOs
export interface SubmitTransactionResponse {
  transactionId: string;
  status: "queued";
  queuePosition: number;
  estimatedWaitSeconds: number;
}

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  params: Record<string, unknown>;
  queuePosition?: number;
  hederaTxId?: string;
  createdAt: string;
  confirmedAt?: string;
  errorMessage?: string;
}

export interface TransactionsListResponse {
  data: TransactionResponse[];
  total: number;
}

// Mappers
export function mapTransactionResponse(response: TransactionResponse): Transaction {
  return {
    id: response.id,
    userId: "", // Not returned from API
    type: response.type,
    status: response.status,
    params: response.params,
    priority: 3, // Default
    queuePosition: response.queuePosition ?? null,
    hederaTxId: response.hederaTxId ?? null,
    createdAt: response.createdAt,
    confirmedAt: response.confirmedAt ?? null,
    errorMessage: response.errorMessage ?? null,
  };
}
