/**
 * API Configuration
 * Defines all API endpoints and configuration constants
 */

import { ENV } from "./env";

const BASE_URL = ENV.API_URL;

/**
 * API Endpoints organized by domain
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SYNC: `${BASE_URL}/auth/sync`,
    VERIFY: `${BASE_URL}/auth/verify`,
    ME: `${BASE_URL}/auth/me`,
    NONCE: `${BASE_URL}/auth/nonce`,
  },

  // User endpoints
  USERS: {
    BASE: `${BASE_URL}/users`,
    BY_ID: (id: string) => `${BASE_URL}/users/${id}`,
    STATUS: (id: string) => `${BASE_URL}/users/${id}/status`,
    PROFILE: (id: string) => `${BASE_URL}/users/${id}/profile`,
  },

  // Balance endpoints
  BALANCES: {
    BASE: `${BASE_URL}/balances`,
    BY_TOKEN: (token: string) => `${BASE_URL}/balances/${token}`,
  },

  // Transaction endpoints
  TRANSACTIONS: {
    BASE: `${BASE_URL}/transactions`,
    BY_ID: (id: string) => `${BASE_URL}/transactions/${id}`,
    SUBMIT: `${BASE_URL}/transactions`,
  },

  // Staking endpoints
  STAKING: {
    POOLS: `${BASE_URL}/staking/pools`,
    POOL_BY_ID: (id: string) => `${BASE_URL}/staking/pools/${id}`,
    USER_STAKES: `${BASE_URL}/staking/stakes`,
    STAKE: `${BASE_URL}/staking/stake`,
    UNSTAKE: (stakeId: string) => `${BASE_URL}/staking/unstake/${stakeId}`,
    CLAIM: `${BASE_URL}/staking/claim`,
  },

  // Creator endpoints
  CREATORS: {
    BASE: `${BASE_URL}/creators`,
    BY_ID: (id: string) => `${BASE_URL}/creators/${id}`,
    SEARCH: `${BASE_URL}/creators/search`,
    CATEGORIES: `${BASE_URL}/creators/categories`,
  },

  // Conversion endpoints
  CONVERT: {
    BASE: `${BASE_URL}/convert`,
    RATE: `${BASE_URL}/convert/rate`,
    QUOTE: `${BASE_URL}/convert/quote`,
    CONVERT: `${BASE_URL}/convert`,
    HISTORY: `${BASE_URL}/convert/history`,
  },

  // Rewards endpoints
  REWARDS: {
    BASE: `${BASE_URL}/rewards`,
    BY_ID: (id: string) => `${BASE_URL}/rewards/${id}`,
    SHOP: `${BASE_URL}/rewards/shop`,
    GIFT_CARDS: `${BASE_URL}/rewards/gift-cards`,
    MY_REDEMPTIONS: `${BASE_URL}/rewards/redemptions`,
    REDEEM: `${BASE_URL}/rewards/redeem`,
  },

  // NFT endpoints
  NFTS: {
    BASE: `${BASE_URL}/nfts`,
    BY_ID: (id: string) => `${BASE_URL}/nfts/${id}`,
    USER_NFTS: `${BASE_URL}/nfts/my`,
    COLLECTIONS: `${BASE_URL}/nfts/collections`,
    TRANSFER: `${BASE_URL}/nfts/transfer`,
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    BASE: `${BASE_URL}/notifications`,
    MARK_READ: (id: string) => `${BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE_URL}/notifications/read-all`,
    UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`,
    PUSH_TOKEN: `${BASE_URL}/notifications/push-token`,
  },

  // Health check
  HEALTH: `${BASE_URL}/health`,
} as const;

/**
 * API Request Configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
