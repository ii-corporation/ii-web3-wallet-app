import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserDto {
  privyId: string;
  email?: string;
  displayName?: string;
  walletAddress?: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Find or create a user based on Privy ID
   * This is called after successful Privy authentication
   */
  async findOrCreateByPrivyId(data: CreateUserDto) {
    this.logger.log(`Finding or creating user for Privy ID: ${data.privyId}`);

    // Try to find existing user
    let user = await this.prisma.user.findUnique({
      where: { privyId: data.privyId },
      include: { wallets: true },
    });

    if (user) {
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
      if (data.walletAddress) {
        const existingWallet = user.wallets.find(
          (w) => w.address === data.walletAddress,
        );
        if (!existingWallet) {
          await this.prisma.userWallet.create({
            data: {
              userId: user.id,
              address: data.walletAddress,
              isPrimary: user.wallets.length === 0,
            },
          });
          this.logger.log(`Added wallet ${data.walletAddress}`);

          // Refresh user with new wallet
          user = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { wallets: true },
          });
        }
      }

      return { user, isNew: false };
    }

    // Create new user
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
    return { user, isNew: true };
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
