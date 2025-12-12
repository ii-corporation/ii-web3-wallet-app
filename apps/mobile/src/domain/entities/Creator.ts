/**
 * Creator Entity
 * Creator/Influencer domain model for staking
 */

export type CreatorCategory =
  | "entertainment"
  | "tech_gaming"
  | "music"
  | "social_figure"
  | "fashion"
  | "sport"
  | "health_fitness"
  | "travel"
  | "beauty"
  | "business";

export const CREATOR_CATEGORIES: CreatorCategory[] = [
  "entertainment",
  "tech_gaming",
  "music",
  "social_figure",
  "fashion",
  "sport",
  "health_fitness",
  "travel",
  "beauty",
  "business",
];

export interface CreatorSocialLinks {
  instagram?: string;
  twitter?: string;
  threads?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Creator {
  id: string;
  name: string;
  category: CreatorCategory;
  avatarUrl: string;
  coverUrl?: string;
  bio: string;
  socialLinks: CreatorSocialLinks;
  poolId: string | null;
  totalStaked: string;
  stakersCount: number;
  minAPR: number; // basis points
  maxAPR: number; // basis points
  stakingBenefits: string[];
  contractAddress?: string;
  isVerified: boolean;
}

export interface CreatorCardData {
  id: string;
  name: string;
  category: CreatorCategory;
  avatarUrl: string;
  totalStaked: string;
  stakersCount: number;
  aprRange: string;
}

/**
 * Get category display label
 */
export function getCategoryLabel(category: CreatorCategory): string {
  const labels: Record<CreatorCategory, string> = {
    entertainment: "Entertainment",
    tech_gaming: "Tech & Gaming",
    music: "Music",
    social_figure: "Social Figure",
    fashion: "Fashion",
    sport: "Sport",
    health_fitness: "Health & Fitness",
    travel: "Travel",
    beauty: "Beauty",
    business: "Business",
  };
  return labels[category];
}

/**
 * Format APR range for display
 */
export function formatAPRRange(minBasisPoints: number, maxBasisPoints: number): string {
  const min = (minBasisPoints / 100).toFixed(2);
  const max = (maxBasisPoints / 100).toFixed(2);
  return `${min}% - ${max}%`;
}

/**
 * Format stakers count for display
 */
export function formatStakersCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString();
}
