/**
 * Staking DTOs
 * Data Transfer Objects for staking endpoints
 */

import { Stake, StakingPool, LockPeriod } from "../entities/Stake";

// Request DTOs
export interface StakeRequest {
  poolId: string;
  amount: string;
  lockPeriod: LockPeriod;
  autoCompound?: boolean;
}

export interface UnstakeRequest {
  stakeId: string;
}

export interface ClaimRewardsRequest {
  stakeIds: string[];
}

// Response DTOs
export interface StakingPoolResponse {
  id: string;
  name: string;
  creatorId: string | null;
  lockDuration: number;
  bonusMultiplier: number;
  totalStaked: string;
  stakersCount: number;
  baseAPR: number;
  effectiveAPR: number;
  isActive: boolean;
  minStake?: string;
  maxStake?: string | null;
}

export interface StakeResponse {
  id: string;
  poolId: string;
  amount: string;
  startTime: string;
  lockEndTime: string;
  autoCompound: boolean;
  lastClaimTime: string;
  pendingRewards: string;
  pool?: StakingPoolResponse;
}

export interface UserStakesResponse {
  stakes: StakeResponse[];
  summary: {
    totalStaked: string;
    totalEarned: string;
    averageAPR: number;
    pendingRewards: string;
  };
}

export interface StakeActionResponse {
  success: boolean;
  transactionId: string;
  stakeId?: string;
  claimedAmount?: string;
}

// Helpers
function formatTokenAmount(amount: string, decimals = 8): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const remainder = value % divisor;
  const decimal = remainder.toString().padStart(decimals, "0").slice(0, 2);
  return `${whole}.${decimal}`;
}

function secondsToDays(seconds: number): number {
  return Math.floor(seconds / (60 * 60 * 24));
}

// Mappers
export function mapStakingPoolResponse(response: StakingPoolResponse): StakingPool {
  const lockPeriodDays = secondsToDays(response.lockDuration);
  const apy = response.effectiveAPR / 100; // Convert basis points to percentage

  return {
    id: response.id,
    name: response.name,
    creatorId: response.creatorId,
    lockDuration: response.lockDuration,
    lockPeriodDays,
    bonusMultiplier: response.bonusMultiplier,
    totalStaked: response.totalStaked,
    stakersCount: response.stakersCount,
    baseAPR: response.baseAPR,
    effectiveAPR: response.effectiveAPR,
    apy,
    isActive: response.isActive,
    minStake: response.minStake || "0",
    maxStake: response.maxStake || null,
    minStakeFormatted: formatTokenAmount(response.minStake || "0"),
    maxStakeFormatted: response.maxStake ? formatTokenAmount(response.maxStake) : null,
  };
}

export function mapStakeResponse(response: StakeResponse, userId: string): Stake {
  const pool = response.pool ? mapStakingPoolResponse(response.pool) : undefined;

  return {
    id: response.id,
    userId,
    poolId: response.poolId,
    amount: response.amount,
    amountFormatted: formatTokenAmount(response.amount),
    startTime: response.startTime,
    lockEndTime: response.lockEndTime,
    lockEndDate: response.lockEndTime, // Alias
    autoCompound: response.autoCompound,
    lastClaimTime: response.lastClaimTime,
    pendingRewards: response.pendingRewards,
    apy: pool?.apy || 0,
    nextRewardDate: null, // Would come from backend or be calculated
    pool,
  };
}
