// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Auth
export interface LoginRequest {
  token: string;
}

export interface LoginResponse {
  user: {
    id: string;
    privyEoaAddress: string;
    hederaAccountId: string | null;
    safeWalletAddress: string | null;
    accountStatus: string;
  };
  isNewUser: boolean;
}

export interface NonceResponse {
  nonce: number;
}

// WebSocket events
export type WebSocketEvent =
  | 'transaction:status_changed'
  | 'transaction:confirmed'
  | 'transaction:failed'
  | 'account:created'
  | 'balance:updated';

export interface WebSocketMessage {
  type: WebSocketEvent;
  data: Record<string, unknown>;
  timestamp: string;
}
