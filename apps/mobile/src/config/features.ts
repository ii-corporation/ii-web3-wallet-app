/**
 * Feature Flags Configuration
 * Enable/disable features for testing and gradual rollout
 *
 * Usage:
 *   import { Features, isFeatureEnabled } from "@/config/features";
 *
 *   if (isFeatureEnabled("STAKING")) {
 *     // Show staking UI
 *   }
 */

export type FeatureFlag =
  | "DEBUG_MODE"           // Show debug screens and extra logging
  | "STAKING"              // Staking functionality
  | "REWARDS_SHOP"         // Rewards/gift cards shop
  | "NFT_GALLERY"          // NFT viewing and transfers
  | "CONVERT_POINTS"       // Points to tokens conversion
  | "CREATOR_PROFILES"     // Creator profiles and following
  | "PUSH_NOTIFICATIONS"   // Push notification support
  | "BIOMETRIC_AUTH"       // Biometric login
  | "ANALYTICS"            // Analytics tracking
  | "SOCIAL_LOGIN"         // Google/Apple/Discord login
  | "WALLET_CONNECT"       // External wallet connections
  | "DEV_TOOLS";           // Developer tools in production

/**
 * Feature flag configuration
 * Set to true to enable, false to disable
 */
const featureConfig: Record<FeatureFlag, boolean> = {
  // Core features
  DEBUG_MODE: __DEV__,              // Only in dev by default
  DEV_TOOLS: __DEV__,               // Only in dev by default

  // Auth features
  SOCIAL_LOGIN: true,               // Google, Apple, etc
  BIOMETRIC_AUTH: false,            // Not yet implemented
  WALLET_CONNECT: false,            // External wallets - coming soon

  // Main features
  STAKING: true,                    // Enable staking
  REWARDS_SHOP: true,               // Enable rewards shop
  NFT_GALLERY: true,                // Enable NFT gallery
  CONVERT_POINTS: true,             // Enable point conversion
  CREATOR_PROFILES: true,           // Enable creator profiles

  // System features
  PUSH_NOTIFICATIONS: false,        // Not yet implemented
  ANALYTICS: !__DEV__,              // Only in production
};

/**
 * Override flags from environment variables
 * Format: EXPO_PUBLIC_FEATURE_FLAG_NAME=true|false
 */
function getEnvOverride(flag: FeatureFlag): boolean | null {
  const envKey = `EXPO_PUBLIC_FEATURE_${flag}`;
  const envValue = process.env[envKey];

  if (envValue === "true") return true;
  if (envValue === "false") return false;
  return null;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // Check environment override first
  const envOverride = getEnvOverride(flag);
  if (envOverride !== null) {
    return envOverride;
  }

  // Fall back to config
  return featureConfig[flag] ?? false;
}

/**
 * Get all enabled features (useful for debugging)
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(featureConfig) as FeatureFlag[]).filter(isFeatureEnabled);
}

/**
 * Get all feature flags with their status
 */
export function getAllFeatures(): Record<FeatureFlag, boolean> {
  const result: Partial<Record<FeatureFlag, boolean>> = {};

  for (const flag of Object.keys(featureConfig) as FeatureFlag[]) {
    result[flag] = isFeatureEnabled(flag);
  }

  return result as Record<FeatureFlag, boolean>;
}

/**
 * Feature flags object for direct access
 */
export const Features = {
  isEnabled: isFeatureEnabled,
  getEnabled: getEnabledFeatures,
  getAll: getAllFeatures,

  // Quick access to common flags
  get DEBUG() { return isFeatureEnabled("DEBUG_MODE"); },
  get STAKING() { return isFeatureEnabled("STAKING"); },
  get REWARDS() { return isFeatureEnabled("REWARDS_SHOP"); },
  get NFT() { return isFeatureEnabled("NFT_GALLERY"); },
  get CONVERT() { return isFeatureEnabled("CONVERT_POINTS"); },
  get CREATORS() { return isFeatureEnabled("CREATOR_PROFILES"); },
};

export default Features;
