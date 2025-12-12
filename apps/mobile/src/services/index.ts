/**
 * Services Barrel Export
 * Re-exports all service modules
 */

// Auth service
export {
  initializeAuth,
  syncUserWithBackend,
  getCurrentUser,
  verifySession,
  clearAuthState,
  getSigningNonce,
} from "./AuthService";
export type { AuthTokenProvider } from "./AuthService";

// Transaction service
export {
  submitTransaction,
  getPendingTransactions,
  cancelTransaction,
  estimateTransactionFee,
} from "./TransactionService";
export type { TransactionCallbacks } from "./TransactionService";

// Staking service
export {
  validateStakeRequest,
  calculateExpectedRewards,
  canUnstake,
  getUnstakeTimeRemaining,
  getBestStakingPool,
  getEnhancedStakingSummary,
} from "./StakingService";
export type { StakeValidation } from "./StakingService";

// Convert service
export {
  validateConversion,
  calculateTokensFromPoints,
  calculatePointsForTokens,
  getConversionQuote,
  executeConversion,
  checkConversionAvailability,
  formatConversionSummary,
} from "./ConvertService";
export type { ConversionValidation, ConversionRate } from "./ConvertService";

// Wallet service
export {
  connectWallet,
  disconnectWallet,
  formatWalletAddress,
  isValidAddress,
  getExplorerUrl,
  getTransactionExplorerUrl,
  copyAddressToClipboard,
  supportsFeature,
} from "./WalletService";
export type { WalletConnection } from "./WalletService";

// Re-export legacy API service (for backwards compatibility)
export * from "./api";
