/**
 * Staking Repository Implementation
 */

import { API_ENDPOINTS } from "../../config/api";
import { IStakingRepository } from "../../domain/repositories/IStakingRepository";
import { Stake, StakingPool, StakeSummary, formatTokenAmount } from "../../domain/entities";
import {
  StakeRequest,
  ClaimRewardsRequest,
  StakeActionResponse,
  StakingPoolResponse,
  UserStakesResponse,
  mapStakingPoolResponse,
  mapStakeResponse,
} from "../../domain/dto/staking.dto";
import { getApiClient } from "../http/ApiClient";

export class StakingRepository implements IStakingRepository {
  async getPools(): Promise<StakingPool[]> {
    const response = await getApiClient().get<StakingPoolResponse[]>(
      API_ENDPOINTS.STAKING.POOLS
    );
    return response.map(mapStakingPoolResponse);
  }

  async getPool(poolId: string): Promise<StakingPool> {
    const response = await getApiClient().get<StakingPoolResponse>(
      API_ENDPOINTS.STAKING.POOL_BY_ID(poolId)
    );
    return mapStakingPoolResponse(response);
  }

  async getUserStakes(): Promise<Stake[]> {
    const response = await getApiClient().get<UserStakesResponse>(
      API_ENDPOINTS.STAKING.USER_STAKES
    );
    // User ID will be filled by the backend from the token
    return response.stakes.map((stake) => mapStakeResponse(stake, ""));
  }

  async getStakeSummary(): Promise<StakeSummary> {
    const response = await getApiClient().get<UserStakesResponse>(
      API_ENDPOINTS.STAKING.USER_STAKES
    );

    return {
      totalStaked: response.summary.totalStaked,
      totalStakedFormatted: formatTokenAmount(response.summary.totalStaked),
      totalEarned: response.summary.totalEarned,
      totalEarnedFormatted: formatTokenAmount(response.summary.totalEarned),
      averageAPR: response.summary.averageAPR,
      activeStakes: response.stakes.length,
      pendingRewards: response.summary.pendingRewards,
      pendingRewardsFormatted: formatTokenAmount(response.summary.pendingRewards),
    };
  }

  async getStake(stakeId: string): Promise<Stake> {
    const stakes = await this.getUserStakes();
    const stake = stakes.find((s) => s.id === stakeId);
    if (!stake) {
      throw new Error(`Stake ${stakeId} not found`);
    }
    return stake;
  }

  async stake(request: StakeRequest): Promise<StakeActionResponse> {
    return getApiClient().post<StakeActionResponse>(API_ENDPOINTS.STAKING.STAKE, request);
  }

  async unstake(stakeId: string): Promise<StakeActionResponse> {
    return getApiClient().post<StakeActionResponse>(API_ENDPOINTS.STAKING.UNSTAKE(stakeId));
  }

  async claimRewards(request: ClaimRewardsRequest): Promise<StakeActionResponse> {
    return getApiClient().post<StakeActionResponse>(API_ENDPOINTS.STAKING.CLAIM, request);
  }

  async getPendingRewards(): Promise<string> {
    const summary = await this.getStakeSummary();
    return summary.pendingRewards;
  }
}

// Singleton instance
let stakingRepositoryInstance: StakingRepository | null = null;

export function getStakingRepository(): IStakingRepository {
  if (!stakingRepositoryInstance) {
    stakingRepositoryInstance = new StakingRepository();
  }
  return stakingRepositoryInstance;
}
