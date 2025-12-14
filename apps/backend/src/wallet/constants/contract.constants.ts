/**
 * Smart contract constants for ZoopSafeFactory
 */

// EIP-712 domain for ZoopSafeFactory
export const EIP712_DOMAIN = {
  name: 'ZoopSafeFactory',
  version: '1',
} as const;

// EIP-712 types for CreateWallet
export const CREATE_WALLET_TYPES = {
  CreateWallet: [
    { name: 'owner', type: 'address' },
    { name: 'saltNonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

// Balance thresholds in HBAR (as wei - 1 HBAR = 10^18 tinybar on EVM)
export const LOW_BALANCE_THRESHOLD = 10n * 10n ** 18n; // 10 HBAR
export const CRITICAL_BALANCE_THRESHOLD = 2n * 10n ** 18n; // 2 HBAR
export const MIN_BALANCE_FOR_TX = 1n * 10n ** 18n; // 1 HBAR minimum to process

// ZoopSafeFactory ABI (minimal for what we need)
export const ZOOP_SAFE_FACTORY_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'saltNonce', type: 'uint256' },
    ],
    name: 'computeWalletAddress',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'saltNonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'createWalletWithSignature',
    outputs: [{ name: 'safe', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'saltNonce', type: 'uint256' },
    ],
    name: 'createWallet',
    outputs: [{ name: 'safe', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'hasWallet',
    outputs: [
      { name: 'hasWallet', type: 'bool' },
      { name: 'walletAddress', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getWalletInfo',
    outputs: [
      {
        components: [
          { name: 'owner', type: 'address' },
          { name: 'safe', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
        ],
        name: 'info',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalWalletsCreated',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'safe', type: 'address' },
      { indexed: false, name: 'saltNonce', type: 'uint256' },
    ],
    name: 'WalletCreated',
    type: 'event',
  },
] as const;
