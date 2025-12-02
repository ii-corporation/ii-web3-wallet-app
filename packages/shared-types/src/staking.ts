export interface StakingPool {
  id: number;
  name: string;
  lockDuration: number;
  bonusMultiplier: number;
  totalStaked: string;
  active: boolean;
}

export interface Stake {
  id: number;
  poolId: number;
  owner: string;
  amount: string;
  startTime: string;
  lockEndTime: string;
  autoCompound: boolean;
  lastClaimTime: string;
}

export interface StakeWithRewards extends Stake {
  pendingRewards: string;
  isLocked: boolean;
  lockRemainingSeconds: number;
}

export interface UserStakingSummary {
  totalStaked: string;
  totalRewards: string;
  stakes: StakeWithRewards[];
}
