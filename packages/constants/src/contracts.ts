import { hederaTestnet, hederaMainnet, bscTestnet, bsc } from './chains';

export interface ContractAddresses {
  zoopToken: `0x${string}`;
  zoopStaking?: `0x${string}`;
  zoopVesting?: `0x${string}`;
  zoopNft?: `0x${string}`;
  zoopSafeFactory?: `0x${string}`;
}

// Contract addresses per chain
// TODO: Replace with actual deployed addresses
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // Hedera Testnet
  [hederaTestnet.id]: {
    zoopToken: '0x0000000000000000000000000000000000000000',
    zoopStaking: '0x0000000000000000000000000000000000000000',
    zoopVesting: '0x0000000000000000000000000000000000000000',
    zoopNft: '0x0000000000000000000000000000000000000000',
    zoopSafeFactory: '0x0000000000000000000000000000000000000000',
  },
  // Hedera Mainnet
  [hederaMainnet.id]: {
    zoopToken: '0x0000000000000000000000000000000000000000',
    zoopStaking: '0x0000000000000000000000000000000000000000',
    zoopVesting: '0x0000000000000000000000000000000000000000',
    zoopNft: '0x0000000000000000000000000000000000000000',
    zoopSafeFactory: '0x0000000000000000000000000000000000000000',
  },
  // BSC Testnet
  [bscTestnet.id]: {
    zoopToken: '0x0000000000000000000000000000000000000000',
  },
  // BSC Mainnet
  [bsc.id]: {
    zoopToken: '0x0000000000000000000000000000000000000000',
  },
};

// Token decimals per chain
export const ZOOP_DECIMALS = {
  hedera: 8,
  evm: 18,
} as const;

export const getContractAddress = (
  chainId: number,
  contract: keyof ContractAddresses,
): `0x${string}` | undefined => {
  return CONTRACT_ADDRESSES[chainId]?.[contract];
};
