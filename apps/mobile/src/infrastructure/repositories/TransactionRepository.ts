/**
 * Transaction Repository Implementation
 */

import { API_ENDPOINTS } from "../../config/api";
import { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { Transaction } from "../../domain/entities/Transaction";
import {
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  GetTransactionsRequest,
  TransactionsListResponse,
  mapTransactionResponse,
} from "../../domain/dto/transaction.dto";
import { PaginatedResponse, buildQueryString, QueryParams } from "../../domain/dto/common.dto";
import { getApiClient } from "../http/ApiClient";

export class TransactionRepository implements ITransactionRepository {
  async submitTransaction(request: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    return getApiClient().post<SubmitTransactionResponse>(
      API_ENDPOINTS.TRANSACTIONS.SUBMIT,
      request
    );
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await getApiClient().get<any>(
      API_ENDPOINTS.TRANSACTIONS.BY_ID(transactionId)
    );
    return mapTransactionResponse(response);
  }

  async getTransactions(params?: GetTransactionsRequest): Promise<PaginatedResponse<Transaction>> {
    const queryString = buildQueryString((params || {}) as QueryParams);
    const response = await getApiClient().get<TransactionsListResponse>(
      `${API_ENDPOINTS.TRANSACTIONS.BASE}${queryString}`
    );

    return {
      data: response.data.map(mapTransactionResponse),
      total: response.total,
      limit: params?.limit || 20,
      offset: params?.offset || 0,
      hasMore: (params?.offset || 0) + response.data.length < response.total,
    };
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    const response = await this.getTransactions({
      status: ["pending", "queued", "processing", "submitted"],
    });
    return response.data;
  }

  async getTransactionHistory(limit = 20, offset = 0): Promise<PaginatedResponse<Transaction>> {
    return this.getTransactions({
      status: ["confirmed", "failed"],
      limit,
      offset,
    });
  }
}

// Singleton instance
let transactionRepositoryInstance: TransactionRepository | null = null;

export function getTransactionRepository(): ITransactionRepository {
  if (!transactionRepositoryInstance) {
    transactionRepositoryInstance = new TransactionRepository();
  }
  return transactionRepositoryInstance;
}
