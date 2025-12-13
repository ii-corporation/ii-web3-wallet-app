import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrivyClient } from '@privy-io/server-auth';
import { UserService } from '../user/user.service';
import { JwtPayload } from './guards/jwt-auth.guard';

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly privy: PrivyClient;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    const appId = process.env.PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;

    if (!appId || !appSecret) {
      this.logger.error('PRIVY_APP_ID or PRIVY_APP_SECRET not configured');
      throw new Error('Privy credentials not configured');
    }

    this.privy = new PrivyClient(appId, appSecret);
    this.logger.log('Privy client initialized');
  }

  /**
   * Verify a Privy access token and return the user claims
   */
  async verifyPrivyToken(token: string) {
    try {
      this.logger.debug('Verifying Privy token...');
      const claims = await this.privy.verifyAuthToken(token);
      this.logger.log(`Token verified for user: ${claims.userId}`);
      return claims;
    } catch (error: any) {
      this.logger.error('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired Privy token');
    }
  }

  /**
   * Generate backend JWT tokens for a user
   */
  generateTokens(userId: string, privyId: string, email?: string): AuthTokens {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      privyId,
      email,
    };

    const accessToken = this.jwtService.sign(payload);

    // Decode to get expiration time
    const decoded = this.jwtService.decode(accessToken) as JwtPayload;
    const expiresIn = decoded.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 604800; // 7 days default

    return {
      accessToken,
      expiresIn,
    };
  }

  /**
   * Login/Register user with Privy token
   * This exchanges the Privy token for our backend JWT
   *
   * Flow:
   * 1. Verify Privy token
   * 2. Get full user info from Privy
   * 3. Create/update user in our database
   * 4. Issue our own JWT
   */
  async login(privyToken: string): Promise<LoginResult> {
    // Step 1: Verify the Privy token
    const claims = await this.verifyPrivyToken(privyToken);

    // Step 2: Get full user info from Privy
    let privyUser;
    try {
      privyUser = await this.privy.getUser(claims.userId);
      this.logger.log(`Fetched Privy user: ${privyUser.id}`);
    } catch (error: any) {
      this.logger.error('Failed to fetch Privy user:', error.message);
      throw new UnauthorizedException('Failed to fetch user info from Privy');
    }

    // Extract email from Privy user
    const email =
      privyUser.email?.address ||
      privyUser.google?.email ||
      privyUser.apple?.email ||
      null;

    // Extract wallet address (created automatically by Privy if enabled)
    const walletAddress = privyUser.wallet?.address || null;

    if (!walletAddress) {
      this.logger.warn(
        `User ${claims.userId} has no wallet. Enable "Create wallet on login" in Privy Dashboard.`,
      );
    } else {
      this.logger.log(`User wallet: ${walletAddress.slice(0, 10)}...`);
    }

    // Step 3: Find or create user in our database
    const { user, isNew } = await this.userService.findOrCreateByPrivyId({
      privyId: claims.userId,
      email,
      walletAddress,
    });

    if (!user) {
      this.logger.error('Failed to create or find user in database');
      throw new UnauthorizedException('Failed to create user account');
    }

    // Step 4: Generate our backend JWT
    const tokens = this.generateTokens(
      user.id,
      user.privyId,
      user.email ?? undefined,
    );

    this.logger.log(
      `Login successful for user ${user.id} (${isNew ? 'new' : 'existing'})`,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        wallets: user.wallets.map((w) => ({
          address: w.address,
          isPrimary: w.isPrimary,
        })),
      },
      tokens,
      isNewUser: isNew,
    };
  }

  /**
   * Refresh backend JWT with Privy re-verification
   * Ensures the Privy session is still valid before issuing new tokens
   */
  async refreshWithPrivyVerification(privyToken: string): Promise<AuthTokens> {
    // Verify Privy session is still valid
    const claims = await this.verifyPrivyToken(privyToken);

    // Find user by Privy ID
    const user = await this.userService.findByPrivyId(claims.userId);

    if (!user) {
      throw new UnauthorizedException('User not found - please login again');
    }

    this.logger.log(`Token refreshed for user ${user.id} (Privy session verified)`);

    return this.generateTokens(user.id, user.privyId, user.email ?? undefined);
  }

  /**
   * Get user by ID (for authenticated requests)
   */
  async getUserById(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      return null;
    }

    return user;
  }
}
