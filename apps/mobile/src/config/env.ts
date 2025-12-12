/**
 * Environment configuration
 * Centralized access to all environment variables with type safety
 */

export const ENV = {
  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api",
  API_VERSION: "v1",

  // Privy Configuration
  PRIVY_APP_ID: process.env.EXPO_PUBLIC_PRIVY_APP_ID || "",
  PRIVY_CLIENT_ID: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "",

  // Feature Flags
  IS_DEV: __DEV__,
  ENABLE_LOGGING: __DEV__,

  // Network Configuration
  DEFAULT_NETWORK: "hedera" as const,
  SUPPORTED_NETWORKS: ["hedera", "ethereum", "bsc"] as const,
} as const;

export type SupportedNetwork = (typeof ENV.SUPPORTED_NETWORKS)[number];
