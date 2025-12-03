import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrivyClient } from '@privy-io/server-auth';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly privy: PrivyClient;

  constructor(private readonly userService: UserService) {
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
  async verifyToken(token: string) {
    try {
      this.logger.debug('Verifying Privy token...');
      const claims = await this.privy.verifyAuthToken(token);
      this.logger.log(`Token verified for user: ${claims.userId}`);
      return claims;
    } catch (error: any) {
      this.logger.error('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Authenticate user and sync with database
   * This should be called after successful Privy login on the mobile app
   */
  async syncUser(token: string) {
    // Verify the token first
    const claims = await this.verifyToken(token);

    // Get full user info from Privy
    let privyUser;
    try {
      privyUser = await this.privy.getUser(claims.userId);
      this.logger.log(`Fetched Privy user: ${privyUser.id}`);
    } catch (error: any) {
      this.logger.error('Failed to fetch Privy user:', error.message);
      throw new UnauthorizedException('Failed to fetch user info');
    }

    // Extract email from Privy user
    const email =
      privyUser.email?.address ||
      privyUser.google?.email ||
      privyUser.apple?.email ||
      null;

    // Extract wallet address if available
    const walletAddress = privyUser.wallet?.address || null;

    // Find or create user in our database
    const { user, isNew } = await this.userService.findOrCreateByPrivyId({
      privyId: claims.userId,
      email,
      walletAddress,
    });

    return {
      user,
      isNew,
      privyUser: {
        id: privyUser.id,
        email,
        hasWallet: !!privyUser.wallet,
      },
    };
  }

  /**
   * Get user by Privy token
   */
  async getUserFromToken(token: string) {
    const claims = await this.verifyToken(token);
    const user = await this.userService.findByPrivyId(claims.userId);

    if (!user) {
      this.logger.warn(`User not found for Privy ID: ${claims.userId}`);
      return null;
    }

    return user;
  }
}
