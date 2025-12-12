/**
 * Reward Entity
 * Rewards shop domain models
 */

export type RewardType = "gift_card" | "shop_discount" | "exclusive_access";
export type RewardCategory = "gift_cards" | "shop_deals" | "experiences" | "exclusive";

export interface Reward {
  id: string;
  type: RewardType;
  brandName: string;
  brandLogo: string;
  title: string;
  description: string;
  tokenPrice: string;
  originalValue?: string; // USD value for gift cards
  discountPercent?: number; // For shop discounts
  availability: number; // Remaining quantity
  imageUrl: string;
  expiresAt?: string;
  isFlashDeal: boolean;
}

export interface GiftCard extends Reward {
  type: "gift_card";
  denominations: GiftCardDenomination[];
}

export interface GiftCardDenomination {
  value: string; // USD value
  tokenPrice: string; // ZOOP token price
}

export interface ShopDeal extends Reward {
  type: "shop_discount";
  discountPercent: number;
  couponCode?: string;
  validUntil?: string;
}

export interface CollectedReward {
  id: string;
  rewardId: string;
  reward: Reward;
  purchasedAt: string;
  code?: string; // Gift card code or coupon code
  isRedeemed: boolean;
  redeemedAt?: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  reward: Reward;
  quantity: number;
  pointsSpent: number;
  status: "pending" | "completed" | "failed";
  code?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Format availability for display
 */
export function formatAvailability(count: number): string {
  if (count === 0) return "Sold out";
  if (count <= 10) return `${count} LEFT`;
  return `${count} available`;
}

/**
 * Check if reward is low stock
 */
export function isLowStock(reward: Reward): boolean {
  return reward.availability > 0 && reward.availability <= 10;
}

/**
 * Format discount for display
 */
export function formatDiscount(percent: number): string {
  return `${percent}% OFF`;
}
