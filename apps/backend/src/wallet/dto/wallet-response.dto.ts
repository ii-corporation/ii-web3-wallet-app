/**
 * Response DTOs for wallet endpoints
 */

export class RelayerHealthDto {
  address: string | null;
  balanceHbar: string;
  isLow: boolean;
  isCritical: boolean;
  canProcessJobs: boolean;
}

export class QueueStatusDto {
  pending: number;
  failed: number;
}

export class WalletHealthResponseDto {
  configured: boolean;
  relayer: RelayerHealthDto | null;
  queue: QueueStatusDto;
}

export class SafeStatusResponseDto {
  status: string | null;
  safeAddress: string | null;
  error: string | null;
}

export class RetryResponseDto {
  success: boolean;
  message: string;
}

export class RetryAllResponseDto {
  queued: number;
  failed: number;
}

export class FailedSafeCreationDto {
  id: string;
  address: string;
  error: string | null;
  userId: string;
}
