import { Controller, Get, Post, Param, UseGuards, Logger } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { SafeFactoryService } from './services/safe-factory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  WalletHealthResponseDto,
  SafeStatusResponseDto,
  RetryResponseDto,
  RetryAllResponseDto,
  FailedSafeCreationDto,
} from './dto';

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly safeFactoryService: SafeFactoryService,
  ) {}

  /**
   * Health check endpoint for wallet/Safe infrastructure
   */
  @Get('health')
  async getHealth(): Promise<WalletHealthResponseDto> {
    const configured = this.safeFactoryService.isConfigured();

    let relayer: WalletHealthResponseDto['relayer'] = null;
    if (configured) {
      try {
        const health = await this.safeFactoryService.getRelayerHealth();
        relayer = {
          address: health.address,
          balanceHbar: health.balanceHbar,
          isLow: health.isLow,
          isCritical: health.isCritical,
          canProcessJobs: health.canProcessJobs,
        };
      } catch (error) {
        this.logger.error(`Failed to get relayer health: ${error}`);
      }
    }

    const pending = await this.walletService.getPendingSafeCreations();
    const failed = (await this.walletService.getFailedSafeCreations()).length;

    return {
      configured,
      relayer,
      queue: { pending, failed },
    };
  }

  /**
   * Get Safe creation status for a specific wallet
   */
  @Get('safe/status/:walletId')
  @UseGuards(JwtAuthGuard)
  async getSafeStatus(@Param('walletId') walletId: string): Promise<SafeStatusResponseDto> {
    const status = await this.walletService.getSafeStatus(walletId);
    return {
      status: status.status,
      safeAddress: status.safeAddress,
      error: status.error,
    };
  }

  /**
   * Retry Safe creation for a failed wallet
   */
  @Post('safe/retry/:walletId')
  @UseGuards(JwtAuthGuard)
  async retrySafeCreation(@Param('walletId') walletId: string): Promise<RetryResponseDto> {
    const result = await this.walletService.retrySafeCreation(walletId);
    return {
      success: result.queued,
      message: result.queued ? 'Safe creation job queued for retry' : result.error || 'Failed',
    };
  }

  /**
   * Retry all failed Safe creations
   */
  @Post('safe/retry-all')
  @UseGuards(JwtAuthGuard)
  async retryAllFailedSafeCreations(): Promise<RetryAllResponseDto> {
    return this.walletService.retryAllFailedSafeCreations();
  }

  /**
   * Get list of failed Safe creations
   */
  @Get('safe/failed')
  @UseGuards(JwtAuthGuard)
  async getFailedSafeCreations(): Promise<FailedSafeCreationDto[]> {
    return this.walletService.getFailedSafeCreations();
  }
}
