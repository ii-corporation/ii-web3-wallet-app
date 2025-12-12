/**
 * Staking Service
 * Business logic for staking operations
 */

import { getStakingRepository } from "../infrastructure/repositories/StakingRepository";
import { getQueryClient, queryKeys } from "../providers/QueryProvider";
import { StakingPool, Stake, StakeSummary } from "../domain/entities/Stake";
import { StakeRequest, ClaimRewardsRequest } from "../domain/dto/staking.dto";

export interface StakeValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Validate stake request before submission
 */
export function validateStakeRequest(
  request: StakeRequest,
  pool: StakingPool,
  availableBalance: string
): StakeValidation {
  const amount = BigInt(request.amount);
  const balance = BigInt(availableBalance);
  const minStake = BigInt(pool.minStake);
  const maxStake = pool.maxStake ? BigInt(pool.maxStake) : null;

  if (amount <= 0n) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  if (amount > balance) {
    return { isValid: false, error: "Insufficient balance" };
  }

  if (amount < minStake) {
    return {
      isValid: false,
      error: `Minimum stake is ${pool.minStakeFormatted}`,
    };
  }

  if (maxStake && amount > maxStake) {
    return {
      isValid: false,
      error: `Maximum stake is ${pool.maxStakeFormatted}`,
    };
  }

  if (!pool.isActive) {
    return { isValid: false, error: "This pool is not currently active" };
  }

  return { isValid: true };
}

/**
 * Calculate expected rewards for a stake
 */
export function calculateExpectedRewards(
  amount: string,
  apy: number,
  daysStaked: number
): { daily: string; weekly: string; monthly: string; yearly: string } {
  const amountNum = parseFloat(amount);
  const dailyRate = apy / 100 / 365;

  const daily = amountNum * dailyRate;
  const weekly = daily * 7;
  const monthly = daily * 30;
  const yearly = amountNum * (apy / 100);

  return {
    daily: daily.toFixed(6),
    weekly: weekly.toFixed(6),
    monthly: monthly.toFixed(6),
    yearly: yearly.toFixed(6),
  };
}

/**
 * Check if a stake can be unstaked (lock period passed)
 */
export function canUnstake(stake: Stake): boolean {
  if (!stake.lockEndDate) return true;
  return new Date() >= new Date(stake.lockEndDate);
}

/**
 * Get time remaining until stake can be unstaked
 */
export function getUnstakeTimeRemaining(stake: Stake): {
  canUnstake: boolean;
  remainingMs: number;
  remainingFormatted: string;
} {
  if (!stake.lockEndDate) {
    return { canUnstake: true, remainingMs: 0, remainingFormatted: "" };
  }

  const lockEnd = new Date(stake.lockEndDate).getTime();
  const now = Date.now();
  const remaining = lockEnd - now;

  if (remaining <= 0) {
    return { canUnstake: true, remainingMs: 0, remainingFormatted: "" };
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let formatted = "";
  if (days > 0) {
    formatted = `${days}d ${hours}h`;
  } else {
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    formatted = `${hours}h ${minutes}m`;
  }

  return {
    canUnstake: false,
    remainingMs: remaining,
    remainingFormatted: formatted,
  };
}

/**
 * Get best pool for staking based on criteria
 */
export async function getBestStakingPool(
  criteria: "highest_apy" | "lowest_lock" | "highest_liquidity" = "highest_apy"
): Promise<StakingPool | null> {
  const pools = await getStakingRepository().getPools();

  if (pools.length === 0) return null;

  const activePools = pools.filter((p) => p.isActive);
  if (activePools.length === 0) return null;

  switch (criteria) {
    case "highest_apy":
      return activePools.reduce((best, pool) =>
        pool.apy > best.apy ? pool : best
      );
    case "lowest_lock":
      return activePools.reduce((best, pool) =>
        pool.lockPeriodDays < best.lockPeriodDays ? pool : best
      );
    case "highest_liquidity":
      return activePools.reduce((best, pool) =>
        BigInt(pool.totalStaked) > BigInt(best.totalStaked) ? pool : best
      );
    default:
      return activePools[0];
  }
}

/**
 * Get staking summary with additional computed metrics
 */
export async function getEnhancedStakingSummary(): Promise<
  StakeSummary & {
    avgApy: number;
    nextRewardDate: string | null;
    totalPoolsStaked: number;
  }
> {
  const [summary, stakes] = await Promise.all([
    getStakingRepository().getStakeSummary(),
    getStakingRepository().getUserStakes(),
  ]);

  // Calculate average APY across stakes
  let totalWeightedApy = 0;
  let totalStakedNum = 0;

  stakes.forEach((stake) => {
    const amount = parseFloat(stake.amountFormatted);
    totalWeightedApy += amount * stake.apy;
    totalStakedNum += amount;
  });

  const avgApy = totalStakedNum > 0 ? totalWeightedApy / totalStakedNum : 0;

  // Find next reward date (soonest)
  const rewardDates = stakes
    .map((s) => s.nextRewardDate)
    .filter(Boolean)
    .sort();
  const nextRewardDate = rewardDates[0] || null;

  // Count unique pools
  const uniquePools = new Set(stakes.map((s) => s.poolId));

  return {
    ...summary,
    avgApy,
    nextRewardDate,
    totalPoolsStaked: uniquePools.size,
  };
}
