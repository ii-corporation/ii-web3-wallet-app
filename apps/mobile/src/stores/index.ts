/**
 * Stores Barrel Export
 * Re-exports all Zustand stores for easy importing
 */

// Auth flow store (navigation state)
export { useAuthFlowStore } from "./authStore";

// User store (global user state)
export {
  useUserStore,
  selectIsAuthenticated,
  selectIsLoading,
  selectProfile,
  selectWallet,
  selectAccessToken,
  selectPrivyUserId,
} from "./userStore";
export type { UserProfile, UserWallet, LinkedAccounts } from "./userStore";

// Wallet connection store
export {
  useWalletStore,
  selectActiveWallet,
  selectIsWalletConnected,
  selectWalletAddress,
} from "./walletStore";
export type { WalletType } from "./walletStore";

// UI store (toasts, modals, loading)
export {
  useUIStore,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from "./uiStore";
export type { ToastType } from "./uiStore";

// Settings store (user preferences)
export {
  useSettingsStore,
  selectTheme,
  selectCurrency,
  selectNotificationSettings,
  selectPrivacySettings,
  selectSecuritySettings,
} from "./settingsStore";
export type { Theme, Currency, Language } from "./settingsStore";

// Transaction store (pending tx state)
export {
  useTransactionStore,
  selectCurrentTransaction,
  selectIsTransactionPending,
  selectTransactionStatus,
} from "./transactionStore";
export type { TransactionStatus } from "./transactionStore";
