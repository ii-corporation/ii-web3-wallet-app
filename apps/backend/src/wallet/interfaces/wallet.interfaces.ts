import { Address, Hash } from 'viem';
import { SafeCreationStatus } from '../../generated/prisma/client';

/**
 * Result of Safe wallet deployment
 */
export interface SafeDeploymentResult {
  success: boolean;
  safeAddress?: Address;
  txHash?: Hash;
  error?: string;
}

/**
 * Relayer health status
 */
export interface RelayerHealth {
  address: Address;
  balance: bigint;
  balanceHbar: string;
  isLow: boolean;
  isCritical: boolean;
  canProcessJobs: boolean;
}

/**
 * Job data for Safe creation queue
 */
export interface SafeCreationJobData {
  userWalletId: string;
  ownerAddress: string;
  saltNonce: bigint;
  userId: string;
  attempt?: number;
}

/**
 * Result of Safe creation job
 */
export interface SafeCreationResult {
  success: boolean;
  safeAddress?: string;
  txHash?: string;
  error?: string;
}

/**
 * Safe creation queue result
 */
export interface QueueSafeCreationResult {
  queued: boolean;
  predictedAddress?: string;
  error?: string;
}

/**
 * Safe status response
 */
export interface SafeStatus {
  status: SafeCreationStatus | null;
  safeAddress: string | null;
  error: string | null;
}

/**
 * Event emitted when a wallet is created
 */
export interface WalletCreatedEvent {
  walletId: string;
  walletAddress: string;
  userId: string;
}
