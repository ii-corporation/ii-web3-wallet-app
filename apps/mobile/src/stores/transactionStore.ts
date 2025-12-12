/**
 * Transaction Store
 * Manages pending transaction state for UI feedback
 */

import { create } from "zustand";

export type TransactionStatus =
  | "idle"
  | "preparing"
  | "signing"
  | "submitting"
  | "confirming"
  | "confirmed"
  | "failed";

interface PendingTransaction {
  id: string;
  type: string;
  status: TransactionStatus;
  hash?: string;
  error?: string;
  startedAt: number;
  updatedAt: number;
}

interface TransactionState {
  // Current transaction being processed
  currentTransaction: PendingTransaction | null;

  // Recent transactions for quick access
  recentTransactionIds: string[];

  // Actions
  startTransaction: (id: string, type: string) => void;
  updateStatus: (status: TransactionStatus, hash?: string) => void;
  setError: (error: string) => void;
  clearTransaction: () => void;
  addRecentTransaction: (id: string) => void;
}

const MAX_RECENT_TRANSACTIONS = 10;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  currentTransaction: null,
  recentTransactionIds: [],

  startTransaction: (id, type) =>
    set({
      currentTransaction: {
        id,
        type,
        status: "preparing",
        startedAt: Date.now(),
        updatedAt: Date.now(),
      },
    }),

  updateStatus: (status, hash) =>
    set((state) => {
      if (!state.currentTransaction) return state;
      return {
        currentTransaction: {
          ...state.currentTransaction,
          status,
          hash: hash ?? state.currentTransaction.hash,
          updatedAt: Date.now(),
        },
      };
    }),

  setError: (error) =>
    set((state) => {
      if (!state.currentTransaction) return state;
      return {
        currentTransaction: {
          ...state.currentTransaction,
          status: "failed",
          error,
          updatedAt: Date.now(),
        },
      };
    }),

  clearTransaction: () => {
    const current = get().currentTransaction;
    if (current && (current.status === "confirmed" || current.status === "failed")) {
      if (current.status === "confirmed") {
        get().addRecentTransaction(current.id);
      }
    }
    set({ currentTransaction: null });
  },

  addRecentTransaction: (id) =>
    set((state) => ({
      recentTransactionIds: [
        id,
        ...state.recentTransactionIds.filter((txId) => txId !== id),
      ].slice(0, MAX_RECENT_TRANSACTIONS),
    })),
}));

/**
 * Selectors
 */
export const selectCurrentTransaction = (state: TransactionState) =>
  state.currentTransaction;

export const selectIsTransactionPending = (state: TransactionState) => {
  const status = state.currentTransaction?.status;
  return status ? ["preparing", "signing", "submitting", "confirming"].includes(status) : false;
};

export const selectTransactionStatus = (state: TransactionState) =>
  state.currentTransaction?.status ?? "idle";
