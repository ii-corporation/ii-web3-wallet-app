import {
  Controller,
  Get,
  Post,
  Headers,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Verify token and return basic auth status
   * Used for debugging/testing the auth flow
   */
  @Get('verify')
  async verifyAuth(@Headers('authorization') authHeader: string) {
    this.logger.log('Auth verify endpoint called');

    if (!authHeader) {
      this.logger.warn('No authorization header provided');
      return {
        authenticated: false,
        message: 'No authorization header provided',
      };
    }

    const token = this.extractToken(authHeader);
    if (!token) {
      return {
        authenticated: false,
        message: 'Invalid authorization format',
      };
    }

    try {
      const claims = await this.authService.verifyToken(token);
      return {
        authenticated: true,
        message: 'Token verified',
        userId: claims.userId,
        appId: claims.appId,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        authenticated: false,
        message: 'Token verification failed',
      };
    }
  }

  /**
   * Sync user after Privy login
   * This endpoint should be called immediately after successful Privy authentication
   * It will create the user in the database if they don't exist
   */
  @Post('sync')
  async syncUser(@Headers('authorization') authHeader: string) {
    this.logger.log('User sync endpoint called');

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const token = this.extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const result = await this.authService.syncUser(token);

    const user = result.user!;
    this.logger.log(
      `User synced: ${user.id} (${result.isNew ? 'new' : 'existing'})`,
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        wallets: user.wallets,
        createdAt: user.createdAt,
      },
      isNewUser: result.isNew,
    };
  }

  /**
   * Get current user profile
   */
  @Get('me')
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    this.logger.log('Get current user endpoint called');

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const token = this.extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const user = await this.authService.getUserFromToken(token);

    if (!user) {
      // User authenticated with Privy but not in our database
      // This can happen if they haven't called /auth/sync yet
      return {
        authenticated: true,
        user: null,
        message: 'User not found. Please call /auth/sync first.',
      };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        wallets: user.wallets,
        createdAt: user.createdAt,
      },
    };
  }

  private extractToken(authHeader: string): string | null {
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
