export const ERROR_CODES = {
  // Auth errors (1xxx)
  UNAUTHORIZED: 1001,
  INVALID_TOKEN: 1002,
  TOKEN_EXPIRED: 1003,
  USER_NOT_FOUND: 1004,

  // Transaction errors (2xxx)
  INVALID_SIGNATURE: 2001,
  INVALID_NONCE: 2002,
  DEADLINE_EXPIRED: 2003,
  INSUFFICIENT_BALANCE: 2004,
  TRANSACTION_FAILED: 2005,
  TRANSACTION_NOT_FOUND: 2006,

  // Account errors (3xxx)
  ACCOUNT_PENDING: 3001,
  ACCOUNT_CREATION_FAILED: 3002,
  ACCOUNT_NOT_ACTIVE: 3003,

  // Staking errors (4xxx)
  POOL_NOT_FOUND: 4001,
  POOL_NOT_ACTIVE: 4002,
  STAKE_NOT_FOUND: 4003,
  STAKE_LOCKED: 4004,
  INVALID_AMOUNT: 4005,

  // Rate limiting (5xxx)
  RATE_LIMITED: 5001,
  QUEUE_FULL: 5002,

  // Internal errors (9xxx)
  INTERNAL_ERROR: 9001,
  SERVICE_UNAVAILABLE: 9002,
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid authentication token',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.INVALID_SIGNATURE]: 'Invalid signature',
  [ERROR_CODES.INVALID_NONCE]: 'Invalid nonce',
  [ERROR_CODES.DEADLINE_EXPIRED]: 'Transaction deadline has expired',
  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Insufficient balance',
  [ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed',
  [ERROR_CODES.TRANSACTION_NOT_FOUND]: 'Transaction not found',
  [ERROR_CODES.ACCOUNT_PENDING]: 'Account is still being created',
  [ERROR_CODES.ACCOUNT_CREATION_FAILED]: 'Account creation failed',
  [ERROR_CODES.ACCOUNT_NOT_ACTIVE]: 'Account is not active',
  [ERROR_CODES.POOL_NOT_FOUND]: 'Staking pool not found',
  [ERROR_CODES.POOL_NOT_ACTIVE]: 'Staking pool is not active',
  [ERROR_CODES.STAKE_NOT_FOUND]: 'Stake not found',
  [ERROR_CODES.STAKE_LOCKED]: 'Stake is still locked',
  [ERROR_CODES.INVALID_AMOUNT]: 'Invalid amount',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests, please try again later',
  [ERROR_CODES.QUEUE_FULL]: 'System is busy, please try again later',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
};
