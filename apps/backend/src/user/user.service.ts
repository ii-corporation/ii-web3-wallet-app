import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { WALLET_CREATED_EVENT } from '../wallet/listeners/wallet-created.listener';
import { WalletCreatedEvent } from '../wallet/interfaces';

export interface CreateUserDto {
  privyId: string;
  email?: string;
  displayName?: string;
  walletAddress?: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Find or create a user based on Privy ID
   * This is called after successful Privy authentication
   * Handles race conditions from concurrent login requests
   */
  async findOrCreateByPrivyId(data: CreateUserDto) {
    this.logger.log(`Finding or creating user for Privy ID: ${data.privyId}`);

    // Try to find existing user
    let user = await this.prisma.user.findUnique({
      where: { privyId: data.privyId },
      include: { wallets: true },
    });

    if (user) {
      return this.handleExistingUser(user, data);
    }

    // Create new user - handle race condition with concurrent requests
    try {
      this.logger.log(`Creating new user for Privy ID: ${data.privyId}`);
      user = await this.prisma.user.create({
        data: {
          privyId: data.privyId,
          email: data.email,
          displayName: data.displayName,
          wallets: data.walletAddress
            ? {
                create: {
                  address: data.walletAddress,
                  isPrimary: true,
                },
              }
            : undefined,
        },
        include: { wallets: true },
      });

      this.logger.log(`Created new user: ${user.id}`);

      // Emit event for Safe creation
      if (data.walletAddress && user.wallets.length > 0) {
        const wallet = user.wallets[0];
        this.emitWalletCreatedEvent(wallet.id, data.walletAddress, user.id);
      }

      return { user, isNew: true };
    } catch (error: any) {
      // Handle race condition: another request created the user first
      if (error.code === 'P2002') {
        this.logger.log(`Race condition detected, fetching existing user`);
        user = await this.prisma.user.findUnique({
          where: { privyId: data.privyId },
          include: { wallets: true },
        });

        if (user) {
          return this.handleExistingUser(user, data);
        }
      }
      throw error;
    }
  }

  /**
   * Handle existing user - update email and add wallet if needed
   */
  private async handleExistingUser(
    existingUser: Awaited<ReturnType<typeof this.findByPrivyId>>,
    data: CreateUserDto,
  ) {
    if (!existingUser) {
      throw new Error('User not found');
    }

    let user = existingUser;
    this.logger.log(`User found: ${user.id}`);

    // Update email if it changed
    if (data.email && user.email !== data.email) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { email: data.email },
        include: { wallets: true },
      });
      this.logger.log(`Updated user email to: ${data.email}`);
    }

    // Add wallet if provided and not already linked
    if (data.walletAddress && user.wallets) {
      const existingWallet = user.wallets.find(
        (w) => w.address === data.walletAddress,
      );
      if (!existingWallet) {
        const newWallet = await this.prisma.userWallet.create({
          data: {
            userId: user.id,
            address: data.walletAddress,
            isPrimary: user.wallets.length === 0,
          },
        });
        this.logger.log(`Added wallet ${data.walletAddress}`);

        // Emit event for Safe creation (decoupled from WalletService)
        this.emitWalletCreatedEvent(newWallet.id, data.walletAddress, user.id);

        // Refresh user with new wallet
        const refreshedUser = await this.prisma.user.findUnique({
          where: { id: user.id },
          include: { wallets: true },
        });
        if (refreshedUser) {
          user = refreshedUser;
        }
      }
    }

    return { user, isNew: false };
  }

  /**
   * Emit wallet.created event for Safe creation
   * This decouples UserService from WalletService
   */
  private emitWalletCreatedEvent(
    walletId: string,
    walletAddress: string,
    userId: string,
  ): void {
    const event: WalletCreatedEvent = {
      walletId,
      walletAddress,
      userId,
    };

    this.logger.log(`Emitting ${WALLET_CREATED_EVENT} for wallet ${walletAddress}`);
    this.eventEmitter.emit(WALLET_CREATED_EVENT, event);
  }

  /**
   * Find user by Privy ID
   */
  async findByPrivyId(privyId: string) {
    return this.prisma.user.findUnique({
      where: { privyId },
      include: { wallets: true },
    });
  }

  /**
   * Find user by internal ID
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { wallets: true },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(privyId: string, data: { displayName?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { privyId },
      data,
      include: { wallets: true },
    });
  }
}
