import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return { healthy: true, message: 'Database connection is healthy' };
    } catch (error: any) {
      return { healthy: false, message: `Database error: ${error.message}` };
    }
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...', process.env.DATABASE_URL);

    // Test pool directly first
    try {
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Pool direct test: SUCCESS');
    } catch (err: any) {
      this.logger.error('Pool direct test FAILED:', err.message);
    }

    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
