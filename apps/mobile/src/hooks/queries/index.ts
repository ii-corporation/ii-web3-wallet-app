/**
 * Query Hooks Barrel Export
 * Re-exports all React Query hooks for easy importing
 */

// Auth hooks
export {
  useMe,
  useNonce,
  useSyncUser,
  useVerifyAuth,
} from "./useAuthQueries";

// Balance hooks
export {
  useBalances,
  useTokenBalance,
  useNetworkBalance,
  useRefreshBalances,
  useTotalBalance,
} from "./useBalanceQueries";

// Transaction hooks
export {
  useTransaction,
  useTransactions,
  usePendingTransactions,
  useTransactionHistory,
  useSubmitTransaction,
  useTrackTransaction,
} from "./useTransactionQueries";

// Staking hooks
export {
  useStakingPools,
  useStakingPool,
  useUserStakes,
  useStakeSummary,
  usePendingRewards,
  useStake,
  useUnstake,
  useClaimRewards,
  useStakingDashboard,
} from "./useStakingQueries";

// Creator hooks
export {
  useCreators,
  useInfiniteCreators,
  useCreator,
  useSearchCreators,
  useCreatorCategories,
  useCreatorCards,
} from "./useCreatorQueries";

// NFT hooks
export {
  useUserNFTs,
  useInfiniteUserNFTs,
  useNFT,
  useNFTCollections,
  useNFTCollection,
  useTransferNFT,
  useNFTGallery,
} from "./useNFTQueries";

// Reward hooks
export {
  useRewards,
  useInfiniteRewards,
  useReward,
  useFeaturedRewards,
  useMyRedemptions,
  useRedemption,
  useRedeemReward,
  useRewardCategories,
  useRewardsShop,
} from "./useRewardQueries";

// Convert hooks
export {
  useConversionRate,
  useConversionQuote,
  useConversionHistory,
  useConvertPoints,
  useConversionAvailability,
  useConversionData,
} from "./useConvertQueries";

// User hooks
export {
  useUser,
  useUserProfile,
  useUserSettings,
  useUpdateProfile,
  useUpdateSettings,
  useUserStats,
  useLeaderboardPosition,
  useDeleteAccount,
} from "./useUserQueries";

// Notification hooks
export {
  useNotifications,
  useInfiniteNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useUpdateNotificationPreferences,
  useNotificationPreferences,
  useNotificationBadge,
} from "./useNotificationQueries";
