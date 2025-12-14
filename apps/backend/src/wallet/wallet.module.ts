import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletController } from './wallet.controller';
import { WalletService, SafeFactoryService } from './services';
import { SafeCreationProcessor } from './processors';
import { WalletCreatedListener } from './listeners';
import { PrismaModule } from '../prisma/prisma.module';
import { SAFE_CREATION_QUEUE } from './constants';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    BullModule.registerQueueAsync({
      name: SAFE_CREATION_QUEUE,
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          attempts: configService.get<number>('SAFE_CREATION_MAX_RETRIES', 3),
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    SafeFactoryService,
    SafeCreationProcessor,
    WalletCreatedListener,
  ],
  exports: [WalletService, SafeFactoryService],
})
export class WalletModule {}
