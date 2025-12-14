/**
 * JWT payload structure for backend tokens
 */
export interface JwtPayload {
  sub: string; // User ID (internal)
  privyId: string; // Privy user ID
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Backend JWT tokens returned after authentication
 */
export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

/**
 * Result of login/registration flow
 */
export interface LoginResult {
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
    wallets: Array<{ address: string; isPrimary: boolean }>;
  };
  tokens: AuthTokens;
  isNewUser: boolean;
}

/**
 * Current user data attached to request by JwtAuthGuard
 */
export interface CurrentUserData {
  id: string;
  privyId: string;
  email?: string;
}
