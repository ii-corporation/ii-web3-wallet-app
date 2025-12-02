// ZoopStaking ABI - Staking contract
// Extract from: zoop-contracts/out/ZoopStaking.sol/ZoopStaking.json

export const ZoopStakingAbi = [
  // Read functions
  {
    type: 'function',
    name: 'poolCount',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPool',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'lockDuration', type: 'uint256' },
          { name: 'bonusMultiplier', type: 'uint256' },
          { name: 'totalStaked', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'baseAPR',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEffectiveAPR',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserStakes',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStake',
    inputs: [{ name: 'stakeId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'poolId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'lockEndTime', type: 'uint256' },
          { name: 'autoCompound', type: 'bool' },
          { name: 'lastClaimTime', type: 'uint256' },
        ],
      },
      { name: 'owner', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingRewards',
    inputs: [{ name: 'stakeId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'stake',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'autoCompound', type: 'bool' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unstake',
    inputs: [{ name: 'stakeId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimRewards',
    inputs: [{ name: 'stakeId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimMultiple',
    inputs: [{ name: 'stakeIds', type: 'uint256[]' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'Staked',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'stakeId', type: 'uint256', indexed: true },
      { name: 'poolId', type: 'uint256', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Unstaked',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'stakeId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'RewardsClaimed',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'stakeId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;
