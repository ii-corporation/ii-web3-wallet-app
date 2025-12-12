/**
 * Stake Entity
 * Staking domain models
 */

export interface StakingPool {
  id: string;
  name: string;
  creatorId: string | null;
  lockDuration: number; // in seconds
  lockPeriodDays: number; // convenience: lockDuration in days
  bonusMultiplier: number; // basis points (e.g., 100 = 1%)
  totalStaked: string;
  stakersCount: number;
  baseAPR: number; // basis points
  effectiveAPR: number; // basis points
  apy: number; // formatted APY as percentage
  isActive: boolean;
  minStake: string;
  maxStake: string | null;
  minStakeFormatted: string;
  maxStakeFormatted: string | null;
}

export interface Stake {
  id: string;
  userId: string;
  poolId: string;
  amount: string;
  amountFormatted: string;
  startTime: string;
  lockEndTime: string;
  lockEndDate: string; // alias for lockEndTime
  autoCompound: boolean;
  lastClaimTime: string;
  pendingRewards: string;
  apy: number;
  nextRewardDate: string | null;
  pool?: StakingPool;
}

export interface StakeSummary {
  totalStaked: string;
  totalStakedFormatted: string;
  totalEarned: string;
  totalEarnedFormatted: string;
  averageAPR: number;
  activeStakes: number;
  pendingRewards: string;
  pendingRewardsFormatted: string;
}

export type LockPeriod = 30 | 90 | 180 | 360;

export const LOCK_PERIODS: LockPeriod[] = [30, 90, 180, 360];

/**
 * Check if stake is still locked
 */
export function isStakeLocked(stake: Stake): boolean {
  const lockEnd = new Date(stake.lockEndTime);
  return new Date() < lockEnd;
}

/**
 * Get remaining lock time in days
 */
export function getRemainingLockDays(stake: Stake): number {
  const lockEnd = new Date(stake.lockEndTime);
  const now = new Date();
  const diffMs = lockEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Format APR for display
 */
export function formatAPR(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

/**
 * Get lock period label
 */
export function getLockPeriodLabel(days: LockPeriod): string {
  return `${days} days`;
}

/**
 * Calculate estimated rewards
 */
export function calculateEstimatedRewards(
  amount: string,
  aprBasisPoints: number,
  daysLocked: number
): string {
  const amountBigInt = BigInt(amount);
  const yearlyReward = (amountBigInt * BigInt(aprBasisPoints)) / 10000n;
  const dailyReward = yearlyReward / 365n;
  const totalReward = dailyReward * BigInt(daysLocked);
  return totalReward.toString();
}
