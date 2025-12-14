import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { SafeFactoryService } from '../services/safe-factory.service';
import { SafeCreationJobData, SafeCreationResult } from '../interfaces';
import { SAFE_CREATION_QUEUE } from '../constants';
import { SafeCreationStatus } from '../../generated/prisma/client';
import { Address } from 'viem';

@Processor(SAFE_CREATION_QUEUE, {
  concurrency: 1, // Process one at a time to respect Hedera rate limits
  limiter: {
    max: 2, // Max 2 jobs per duration
    duration: 1000, // Per 1 second (Hedera ~2 accounts/sec limit)
  },
})
export class SafeCreationProcessor extends WorkerHost {
  private readonly logger = new Logger(SafeCreationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly safeFactoryService: SafeFactoryService,
  ) {
    super();
  }

  async process(job: Job<SafeCreationJobData>): Promise<SafeCreationResult> {
    const { userWalletId, ownerAddress, saltNonce } = job.data;

    this.logger.log(`Processing Safe creation job ${job.id}`);
    this.logger.log(`  User Wallet ID: ${userWalletId}`);
    this.logger.log(`  Owner Address: ${ownerAddress}`);

    try {
      if (!this.safeFactoryService.isConfigured()) {
        throw new Error('SafeFactoryService not configured');
      }

      // Check relayer balance before processing
      const canProcess = await this.safeFactoryService.canProcessSafeCreation();
      if (!canProcess) {
        const health = await this.safeFactoryService.getRelayerHealth();
        this.logger.error(`Relayer balance too low: ${health.balanceHbar} HBAR`);
        throw new Error(`Relayer balance too low: ${health.balanceHbar} HBAR`);
      }

      // Update status to PROCESSING
      await this.prisma.userWallet.update({
        where: { id: userWalletId },
        data: { safeCreationStatus: SafeCreationStatus.PROCESSING },
      });

      // Create the Safe wallet
      const result = await this.safeFactoryService.createSafe(
        ownerAddress as Address,
        BigInt(saltNonce.toString()),
      );

      if (result.success && result.safeAddress) {
        await this.prisma.userWallet.update({
          where: { id: userWalletId },
          data: {
            safeAddress: result.safeAddress,
            safeCreationStatus: SafeCreationStatus.COMPLETED,
            safeCreationTxHash: result.txHash,
            safeCreatedAt: new Date(),
            safeCreationError: null,
          },
        });

        this.logger.log(`Safe created successfully: ${result.safeAddress}`);
        return {
          success: true,
          safeAddress: result.safeAddress,
          txHash: result.txHash,
        };
      } else {
        throw new Error(result.error || 'Safe creation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Safe creation failed: ${errorMessage}`);

      await this.prisma.userWallet.update({
        where: { id: userWalletId },
        data: {
          safeCreationStatus: SafeCreationStatus.FAILED,
          safeCreationError: errorMessage,
        },
      });

      return { success: false, error: errorMessage };
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SafeCreationJobData>) {
    this.logger.log(`Job ${job.id} completed for wallet ${job.data.userWalletId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SafeCreationJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error(`Worker error: ${error.message}`);
  }
}
