// ZoopSafeFactory ABI - Safe wallet factory
// Extract from: zoop-contracts/out/ZoopSafeFactory.sol/ZoopSafeFactory.json

export const ZoopSafeFactoryAbi = [
  // Read functions
  {
    type: 'function',
    name: 'computeWalletAddress',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'saltNonce', type: 'uint256' },
    ],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isWalletDeployed',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWallet',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'createWallet',
    inputs: [
      { name: 'owner', type: 'address' },
      {
        name: 'recoveryConfig',
        type: 'tuple',
        components: [
          { name: 'guardians', type: 'address[]' },
          { name: 'threshold', type: 'uint256' },
          { name: 'recoveryDelay', type: 'uint256' },
        ],
      },
      { name: 'saltNonce', type: 'uint256' },
    ],
    outputs: [{ type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createWalletWithSignature',
    inputs: [
      { name: 'owner', type: 'address' },
      {
        name: 'recoveryConfig',
        type: 'tuple',
        components: [
          { name: 'guardians', type: 'address[]' },
          { name: 'threshold', type: 'uint256' },
          { name: 'recoveryDelay', type: 'uint256' },
        ],
      },
      { name: 'saltNonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ type: 'address' }],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'WalletCreated',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'wallet', type: 'address', indexed: true },
      { name: 'saltNonce', type: 'uint256', indexed: false },
    ],
  },
] as const;
