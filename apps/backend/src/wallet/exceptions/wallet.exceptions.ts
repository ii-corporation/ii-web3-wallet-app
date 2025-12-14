import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception for wallet-related errors
 */
export class WalletException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, status);
  }
}

/**
 * Thrown when a wallet is not found
 */
export class WalletNotFoundException extends HttpException {
  constructor(walletId: string) {
    super(`Wallet with ID ${walletId} not found`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Thrown when Safe creation fails
 */
export class SafeCreationException extends HttpException {
  constructor(message: string) {
    super(`Safe creation failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Thrown when a Safe already exists for an owner
 */
export class SafeAlreadyExistsException extends HttpException {
  constructor(safeAddress: string) {
    super(`Safe already exists at address ${safeAddress}`, HttpStatus.CONFLICT);
  }
}

/**
 * Thrown when Safe creation is already in progress
 */
export class SafeCreationInProgressException extends HttpException {
  constructor(walletId: string) {
    super(
      `Safe creation already in progress for wallet ${walletId}`,
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when relayer has insufficient balance
 */
export class RelayerInsufficientBalanceException extends HttpException {
  constructor(balance: string) {
    super(
      `Relayer balance too low: ${balance} HBAR. Cannot process Safe creation.`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * Thrown when Safe factory service is not configured
 */
export class SafeFactoryNotConfiguredException extends HttpException {
  constructor() {
    super(
      'Safe factory service is not properly configured',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
