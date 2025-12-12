/**
 * Staking Repository Interface
 * Defines the contract for staking operations
 */

import { Stake, StakingPool, StakeSummary } from "../entities/Stake";
import { StakeRequest, ClaimRewardsRequest, StakeActionResponse } from "../dto/staking.dto";

export interface IStakingRepository {
  /**
   * Get all available staking pools
   */
  getPools(): Promise<StakingPool[]>;

  /**
   * Get pool by ID
   */
  getPool(poolId: string): Promise<StakingPool>;

  /**
   * Get user's active stakes
   */
  getUserStakes(): Promise<Stake[]>;

  /**
   * Get user's stake summary
   */
  getStakeSummary(): Promise<StakeSummary>;

  /**
   * Get stake by ID
   */
  getStake(stakeId: string): Promise<Stake>;

  /**
   * Stake tokens
   */
  stake(request: StakeRequest): Promise<StakeActionResponse>;

  /**
   * Unstake tokens
   */
  unstake(stakeId: string): Promise<StakeActionResponse>;

  /**
   * Claim rewards from stakes
   */
  claimRewards(request: ClaimRewardsRequest): Promise<StakeActionResponse>;

  /**
   * Get pending rewards amount
   */
  getPendingRewards(): Promise<string>;
}
