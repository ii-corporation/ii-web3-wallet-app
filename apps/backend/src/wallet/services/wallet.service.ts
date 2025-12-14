import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SafeFactoryService } from './safe-factory.service';
import { SafeCreationJobData, QueueSafeCreationResult, SafeStatus } from '../interfaces';
import { SAFE_CREATION_QUEUE, SAFE_CREATION_JOB } from '../constants';
import { SafeCreationStatus } from '../../generated/prisma/client';
import { Address } from 'viem';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly maxRetries: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly safeFactoryService: SafeFactoryService,
    private readonly configService: ConfigService,
    @InjectQueue(SAFE_CREATION_QUEUE) private readonly safeCreationQueue: Queue,
  ) {
    this.maxRetries = this.configService.get<number>('SAFE_CREATION_MAX_RETRIES', 3);
  }

  /**
   * Queue Safe wallet creation for a user wallet
   */
  async queueSafeCreation(
    userWalletId: string,
    ownerAddress: string,
    userId: string,
  ): Promise<QueueSafeCreationResult> {
    this.logger.log(`Queueing Safe creation for wallet: ${userWalletId}`);

    try {
      if (!this.safeFactoryService.isConfigured()) {
        this.logger.warn('Safe factory not configured, skipping Safe creation');
        return { queued: false, error: 'Safe factory not configured' };
      }

      const wallet = await this.prisma.userWallet.findUnique({
        where: { id: userWalletId },
      });

      if (!wallet) {
        return { queued: false, error: 'Wallet not found' };
      }

      if (wallet.safeAddress) {
        this.logger.log(`  Wallet already has Safe: ${wallet.safeAddress}`);
        return { queued: false, error: 'Wallet already has a Safe' };
      }

      if (
        wallet.safeCreationStatus === SafeCreationStatus.PENDING ||
        wallet.safeCreationStatus === SafeCreationStatus.PROCESSING
      ) {
        this.logger.log(`  Safe creation already in progress`);
        return { queued: false, error: 'Safe creation already in progress' };
      }

      // Check if on-chain wallet already exists
      const { hasWallet, walletAddress } = await this.safeFactoryService.hasWallet(
        ownerAddress as Address,
      );

      if (hasWallet) {
        await this.prisma.userWallet.update({
          where: { id: userWalletId },
          data: {
            safeAddress: walletAddress,
            safeCreationStatus: SafeCreationStatus.COMPLETED,
            safeCreatedAt: new Date(),
          },
        });

        this.logger.log(`  On-chain Safe already exists: ${walletAddress}`);
        return { queued: false, predictedAddress: walletAddress };
      }

      // Generate salt nonce and compute predicted address
      const saltNonce = this.safeFactoryService.generateSaltNonce(ownerAddress as Address);
      const predictedAddress = await this.safeFactoryService.computeWalletAddress(
        ownerAddress as Address,
        saltNonce,
      );

      this.logger.log(`  Predicted Safe Address: ${predictedAddress}`);

      // Update wallet status to PENDING
      await this.prisma.userWallet.update({
        where: { id: userWalletId },
        data: {
          safeCreationStatus: SafeCreationStatus.PENDING,
          safeCreationError: null,
        },
      });

      // Add job to queue
      const jobData: SafeCreationJobData = {
        userWalletId,
        ownerAddress,
        saltNonce,
        userId,
      };

      await this.safeCreationQueue.add(SAFE_CREATION_JOB, jobData, {
        attempts: this.maxRetries,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      });

      this.logger.log(`  Job queued successfully`);
      return { queued: true, predictedAddress };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`  Failed to queue Safe creation: ${errorMessage}`);

      await this.prisma.userWallet.update({
        where: { id: userWalletId },
        data: {
          safeCreationStatus: SafeCreationStatus.FAILED,
          safeCreationError: errorMessage,
        },
      });

      return { queued: false, error: errorMessage };
    }
  }

  /**
   * Retry Safe creation for a failed wallet
   */
  async retrySafeCreation(userWalletId: string): Promise<{ queued: boolean; error?: string }> {
    const wallet = await this.prisma.userWallet.findUnique({
      where: { id: userWalletId },
      include: { user: true },
    });

    if (!wallet) {
      return { queued: false, error: 'Wallet not found' };
    }

    if (wallet.safeCreationStatus !== SafeCreationStatus.FAILED) {
      return { queued: false, error: 'Wallet is not in failed state' };
    }

    return this.queueSafeCreation(userWalletId, wallet.address, wallet.userId);
  }

  /**
   * Get Safe creation status for a wallet
   */
  async getSafeStatus(userWalletId: string): Promise<SafeStatus> {
    const wallet = await this.prisma.userWallet.findUnique({
      where: { id: userWalletId },
      select: {
        safeCreationStatus: true,
        safeAddress: true,
        safeCreationError: true,
      },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return {
      status: wallet.safeCreationStatus,
      safeAddress: wallet.safeAddress,
      error: wallet.safeCreationError,
    };
  }

  /**
   * Get pending Safe creations count
   */
  async getPendingSafeCreations(): Promise<number> {
    return this.prisma.userWallet.count({
      where: {
        safeCreationStatus: {
          in: [SafeCreationStatus.PENDING, SafeCreationStatus.PROCESSING],
        },
      },
    });
  }

  /**
   * Get failed Safe creations
   */
  async getFailedSafeCreations(): Promise<
    Array<{ id: string; address: string; error: string | null; userId: string }>
  > {
    return this.prisma.userWallet.findMany({
      where: { safeCreationStatus: SafeCreationStatus.FAILED },
      select: {
        id: true,
        address: true,
        safeCreationError: true,
        userId: true,
      },
    }).then(wallets => wallets.map(w => ({
      id: w.id,
      address: w.address,
      error: w.safeCreationError,
      userId: w.userId,
    })));
  }

  /**
   * Retry all failed Safe creations
   */
  async retryAllFailedSafeCreations(): Promise<{ queued: number; failed: number }> {
    const failedWallets = await this.getFailedSafeCreations();
    let queued = 0;
    let failed = 0;

    for (const wallet of failedWallets) {
      const result = await this.queueSafeCreation(wallet.id, wallet.address, wallet.userId);
      if (result.queued) {
        queued++;
      } else {
        failed++;
      }
    }

    return { queued, failed };
  }
}
