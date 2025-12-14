import {
  Controller,
  Get,
  Post,
  Headers,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { CurrentUserData } from './interfaces';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Login with Privy token
   * Exchanges Privy JWT for our backend JWT
   *
   * @param authHeader - Bearer token from Privy
   * @returns User info and backend JWT tokens
   */
  @Post('login')
  async login(@Headers('authorization') authHeader: string) {
    this.logger.log('Login endpoint called');

    const privyToken = this.extractToken(authHeader);
    if (!privyToken) {
      throw new UnauthorizedException('No Privy token provided');
    }

    const result = await this.authService.login(privyToken);

    return {
      success: true,
      user: result.user,
      tokens: result.tokens,
      isNewUser: result.isNewUser,
    };
  }

  /**
   * Refresh backend JWT
   * Requires valid Privy token to ensure session is still active
   * This prevents users from staying logged in after Privy session expires
   */
  @Post('refresh')
  async refreshToken(@Headers('authorization') authHeader: string) {
    this.logger.log('Refresh token endpoint called');

    const privyToken = this.extractToken(authHeader);
    if (!privyToken) {
      throw new UnauthorizedException('No Privy token provided');
    }

    // Re-verify Privy session is still valid before refreshing
    const tokens = await this.authService.refreshWithPrivyVerification(privyToken);

    return {
      success: true,
      tokens,
    };
  }

  /**
   * Get current user profile
   * Protected by backend JWT
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: CurrentUserData) {
    this.logger.log(`Get current user: ${user.id}`);

    const fullUser = await this.authService.getUserById(user.id);

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        displayName: fullUser.displayName,
        avatarUrl: fullUser.avatarUrl,
        wallets: fullUser.wallets.map((w) => ({
          address: w.address,
          isPrimary: w.isPrimary,
        })),
        createdAt: fullUser.createdAt,
      },
    };
  }

  /**
   * Verify Privy token status (debugging endpoint)
   */
  @Get('verify')
  async verifyAuth(@Headers('authorization') authHeader: string) {
    this.logger.log('Auth verify endpoint called');

    if (!authHeader) {
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
      const claims = await this.authService.verifyPrivyToken(token);
      return {
        authenticated: true,
        message: 'Privy token verified',
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

  private extractToken(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
