import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WalletService } from '../services/wallet.service';
import { WalletCreatedEvent } from '../interfaces';

export const WALLET_CREATED_EVENT = 'wallet.created';

@Injectable()
export class WalletCreatedListener {
  private readonly logger = new Logger(WalletCreatedListener.name);

  constructor(private readonly walletService: WalletService) {}

  @OnEvent(WALLET_CREATED_EVENT)
  async handleWalletCreated(event: WalletCreatedEvent) {
    this.logger.log(`Received wallet.created event for wallet: ${event.walletId}`);

    try {
      const result = await this.walletService.queueSafeCreation(
        event.walletId,
        event.walletAddress,
        event.userId,
      );

      if (result.queued) {
        this.logger.log(`Queued Safe creation for wallet ${event.walletAddress}`);
        if (result.predictedAddress) {
          this.logger.log(`Predicted Safe address: ${result.predictedAddress}`);
        }
      } else if (result.predictedAddress) {
        this.logger.log(`Safe already exists at ${result.predictedAddress}`);
      } else {
        this.logger.warn(`Safe creation not queued: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle wallet.created event: ${error}`);
    }
  }
}
