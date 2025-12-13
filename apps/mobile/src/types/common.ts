import { ImageSourcePropType, StyleProp, ViewStyle, TextStyle } from "react-native";
import { ReactNode } from "react";

// ============================================
// Common Component Props
// ============================================

/**
 * Base props that most components should support
 */
export interface BaseComponentProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Props for components that can be pressed
 */
export interface PressableComponentProps extends BaseComponentProps {
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * Props for components with children
 */
export interface ContainerComponentProps extends BaseComponentProps {
  children: ReactNode;
}

// ============================================
// Entity Types
// ============================================

/**
 * Base entity with ID
 */
export interface BaseEntity {
  id: string;
}

/**
 * Entity with image
 */
export interface WithImage {
  image: ImageSourcePropType;
}

/**
 * Entity with name
 */
export interface WithName {
  name: string;
}

/**
 * Creator/Influencer entity
 */
export interface Creator extends BaseEntity, WithImage, WithName {
  verified?: boolean;
  category?: string;
  description?: string;
  socials?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
}

/**
 * Stake entity
 */
export interface Stake extends BaseEntity, WithImage, WithName {
  stakedAmount: string;
  lockPeriod: string;
  startDate?: string;
  endDate?: string;
  estimatedZPY?: string;
  state: "locked" | "claimable";
  daysLeft?: number;
  stakeReward?: string;
  hash?: string;
}

/**
 * Gift card entity
 */
export interface GiftCard extends BaseEntity, WithImage, WithName {
  fromPrice: string;
  itemsLeft?: number;
  description?: string;
  priceOptions?: PriceOption[];
}

/**
 * Price option for gift cards
 */
export interface PriceOption {
  id: string;
  tokenAmount: string;
  dollarValue: string;
}

/**
 * Shop offer entity
 */
export interface ShopOffer extends BaseEntity, WithImage {
  logo?: ImageSourcePropType;
  brandName: string;
  discount: string;
  price: string;
  dollarValue?: string;
  itemsLeft?: number;
  description?: string;
  validUntil?: string;
  terms?: string[];
}

/**
 * Transaction entity
 */
export interface Transaction extends BaseEntity {
  type: "send" | "receive" | "stake" | "unstake" | "convert" | "reward";
  amount: string;
  token: string;
  timestamp: Date | string;
  status: "pending" | "completed" | "failed";
  from?: string;
  to?: string;
  hash?: string;
}

// ============================================
// UI State Types
// ============================================

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Tab definition
 */
export interface TabDefinition<T extends string = string> {
  key: T;
  label: string;
  badge?: number | string;
}

// ============================================
// Utility Types
// ============================================

/**
 * Make specific keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract props type from a component
 */
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;
