import { defineChain } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';

// Hedera chains (not built into viem, so we define them)
export const hederaTestnet = defineChain({
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18, // viem uses 18 for EVM compatibility
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/testnet',
    },
  },
  testnet: true,
});

export const hederaMainnet = defineChain({
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/mainnet',
    },
  },
  testnet: false,
});

// Re-export viem chains
export { bsc, bscTestnet };

// LayerZero Endpoint IDs
export const LAYERZERO_EIDS = {
  hederaTestnet: 40285,
  hederaMainnet: 40285,
  bscTestnet: 40102,
  bscMainnet: 102,
} as const;

// Supported chains grouped by network
export const SUPPORTED_CHAINS = {
  testnet: [hederaTestnet, bscTestnet] as const,
  mainnet: [hederaMainnet, bsc] as const,
};

// Default chain per environment
export const DEFAULT_CHAIN = {
  testnet: hederaTestnet,
  mainnet: hederaMainnet,
};
