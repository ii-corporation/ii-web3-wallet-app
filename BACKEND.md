# Zoop Backend Architecture

> **Framework**: NestJS with Fastify adapter
> **Purpose**: Transaction infrastructure for Hedera with queue-based processing

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Module Documentation](#4-module-documentation)
5. [Database Schema](#5-database-schema)
6. [Queue System](#6-queue-system)
7. [WebSocket Gateway](#7-websocket-gateway)
8. [Authentication](#8-authentication)
9. [Hedera Integration](#9-hedera-integration)
10. [API Endpoints](#10-api-endpoints)
11. [Configuration](#11-configuration)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment](#13-deployment)

---

## 1. Overview

The Zoop backend handles all blockchain interactions for the mobile app, providing:

- **Meta-transactions**: Users sign, backend submits to Hedera
- **Queue-based processing**: Rate-limited transaction submission
- **Off-chain ledger**: Track balances while accounts are pending
- **Real-time updates**: WebSocket notifications for transaction status
- **Account management**: Hedera account creation queue

### Why NestJS?

| Requirement | NestJS Solution |
|-------------|-----------------|
| Multiple domains | Modular architecture |
| Queue workers | `@nestjs/bullmq` integration |
| WebSockets | `@nestjs/websockets` |
| Validation | `class-validator` + pipes |
| Testing | Built-in utilities |
| Team scaling | Enforced patterns |
| Documentation | `@nestjs/swagger` |

---

## 2. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TECHNOLOGY STACK                                │
│                                                                              │
│   Framework                                                                  │
│   ├── NestJS 10+                                                            │
│   ├── Fastify adapter (2x faster than Express)                              │
│   ├── TypeScript 5+ (strict mode)                                           │
│   └── @nestjs/swagger (OpenAPI 3.0)                                         │
│                                                                              │
│   Validation                                                                 │
│   ├── class-validator (decorators)                                          │
│   ├── class-transformer (serialization)                                     │
│   └── Zod (complex schemas, optional)                                       │
│                                                                              │
│   Database                                                                   │
│   ├── PostgreSQL 15+                                                        │
│   ├── Prisma ORM                                                            │
│   └── prisma-nestjs-graphql (if GraphQL needed)                             │
│                                                                              │
│   Cache & Queue                                                              │
│   ├── Redis 7+ (ioredis)                                                    │
│   ├── @nestjs/bullmq (job queues)                                           │
│   ├── @bull-board/nestjs (admin UI)                                         │
│   └── @nestjs/cache-manager (caching)                                       │
│                                                                              │
│   Real-time                                                                  │
│   ├── @nestjs/websockets                                                    │
│   ├── socket.io + @socket.io/redis-adapter                                  │
│   └── Server-Sent Events (SSE) alternative                                  │
│                                                                              │
│   Blockchain                                                                 │
│   ├── @hashgraph/sdk (Hedera native SDK)                                    │
│   ├── viem (EVM chains - BSC, Ethereum)                                     │
│   └── ethers v6 (fallback/utilities)                                        │
│                                                                              │
│   Authentication                                                             │
│   ├── @nestjs/passport                                                      │
│   ├── Privy server SDK (@privy-io/server-auth)                              │
│   └── JWT for internal services                                             │
│                                                                              │
│   Security                                                                   │
│   ├── @nestjs/throttler (rate limiting)                                     │
│   ├── helmet (HTTP headers)                                                 │
│   └── cors (configured per environment)                                     │
│                                                                              │
│   Monitoring                                                                 │
│   ├── @nestjs/terminus (health checks)                                      │
│   ├── prom-client (Prometheus metrics)                                      │
│   ├── @sentry/nestjs (error tracking)                                       │
│   └── pino + nestjs-pino (structured logging)                               │
│                                                                              │
│   Testing                                                                    │
│   ├── Jest (unit + integration)                                             │
│   ├── Supertest (e2e)                                                       │
│   └── @nestjs/testing utilities                                             │
│                                                                              │
│   Infrastructure                                                             │
│   ├── Docker + Docker Compose                                               │
│   ├── AWS ECS / GCP Cloud Run                                               │
│   └── GitHub Actions (CI/CD)                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-fastify": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/bullmq": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/terminus": "^10.0.0",
    "@nestjs/cache-manager": "^2.0.0",
    "@bull-board/nestjs": "^5.0.0",
    "@bull-board/api": "^5.0.0",
    "@bull-board/fastify": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@hashgraph/sdk": "^2.40.0",
    "@privy-io/server-auth": "^1.0.0",
    "viem": "^2.0.0",
    "ioredis": "^5.0.0",
    "bullmq": "^5.0.0",
    "socket.io": "^4.0.0",
    "@socket.io/redis-adapter": "^8.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "helmet": "^7.0.0",
    "nestjs-pino": "^3.0.0",
    "pino-http": "^9.0.0",
    "prom-client": "^15.0.0",
    "@sentry/nestjs": "^8.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "prisma": "^5.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 3. Project Structure

```
backend/
├── src/
│   ├── main.ts                          # Application bootstrap
│   ├── app.module.ts                    # Root module
│   │
│   ├── common/                          # Shared utilities
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── api-paginated.decorator.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── guards/
│   │   │   └── throttle.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── timeout.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── address.util.ts
│   │       └── bigint.util.ts
│   │
│   ├── config/                          # Configuration
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   ├── validation.ts                # Env validation schema
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── hedera.config.ts
│   │   ├── evm.config.ts
│   │   └── app.config.ts
│   │
│   ├── prisma/                          # Database
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── prisma.health.ts
│   │
│   ├── auth/                            # Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   ├── strategies/
│   │   │   └── privy.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── auth-response.dto.ts
│   │
│   ├── users/                           # User management
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── user.dto.ts
│   │   │   ├── create-user.dto.ts
│   │   │   └── user-status.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── accounts/                        # Hedera account management
│   │   ├── accounts.module.ts
│   │   ├── accounts.controller.ts
│   │   ├── accounts.service.ts
│   │   ├── accounts.processor.ts        # Queue worker
│   │   └── dto/
│   │       ├── account-status.dto.ts
│   │       └── create-account.dto.ts
│   │
│   ├── transactions/                    # Transaction management
│   │   ├── transactions.module.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   ├── transactions.processor.ts    # Queue worker
│   │   ├── dto/
│   │   │   ├── submit-transaction.dto.ts
│   │   │   ├── transaction.dto.ts
│   │   │   ├── transaction-status.dto.ts
│   │   │   └── get-transactions.dto.ts
│   │   └── entities/
│   │       └── transaction.entity.ts
│   │
│   ├── balances/                        # Off-chain balance ledger
│   │   ├── balances.module.ts
│   │   ├── balances.controller.ts
│   │   ├── balances.service.ts
│   │   ├── balances.sync.service.ts     # Blockchain sync
│   │   └── dto/
│   │       └── balance.dto.ts
│   │
│   ├── blockchain/                      # Blockchain abstraction
│   │   ├── blockchain.module.ts
│   │   ├── blockchain.service.ts        # Unified interface
│   │   ├── hedera/
│   │   │   ├── hedera.module.ts
│   │   │   ├── hedera.service.ts
│   │   │   ├── hedera.types.ts
│   │   │   └── hedera.health.ts
│   │   └── evm/
│   │       ├── evm.module.ts
│   │       ├── evm.service.ts
│   │       └── evm.types.ts
│   │
│   ├── queues/                          # Queue infrastructure
│   │   ├── queues.module.ts
│   │   ├── queues.constants.ts
│   │   ├── queues.health.ts
│   │   ├── processors/
│   │   │   ├── account-creation.processor.ts
│   │   │   ├── transaction.processor.ts
│   │   │   ├── batch-transfer.processor.ts
│   │   │   └── balance-sync.processor.ts
│   │   └── jobs/
│   │       ├── account-creation.job.ts
│   │       ├── transaction.job.ts
│   │       └── batch-transfer.job.ts
│   │
│   ├── notifications/                   # Real-time notifications
│   │   ├── notifications.module.ts
│   │   ├── notifications.gateway.ts     # WebSocket gateway
│   │   ├── notifications.service.ts
│   │   └── dto/
│   │       └── notification.dto.ts
│   │
│   ├── treasury/                        # Treasury operations
│   │   ├── treasury.module.ts
│   │   ├── treasury.service.ts
│   │   └── treasury.types.ts
│   │
│   ├── metrics/                         # Prometheus metrics
│   │   ├── metrics.module.ts
│   │   ├── metrics.controller.ts
│   │   └── metrics.service.ts
│   │
│   └── health/                          # Health checks
│       ├── health.module.ts
│       └── health.controller.ts
│
├── prisma/
│   ├── schema.prisma                    # Database schema
│   ├── migrations/                      # Migration files
│   └── seed.ts                          # Seed data
│
├── test/
│   ├── app.e2e-spec.ts
│   ├── transactions.e2e-spec.ts
│   └── jest-e2e.json
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   └── docker-compose.yml
│
├── .env.example
├── .env.development
├── .env.production
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## 4. Module Documentation

### 4.1 App Module (Root)

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BalancesModule } from './balances/balances.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { QueuesModule } from './queues/queues.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TreasuryModule } from './treasury/treasury.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

import configuration from './config/configuration';
import { validate } from './config/validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),

    // Logging
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    BalancesModule,
    BlockchainModule,
    QueuesModule,
    NotificationsModule,
    TreasuryModule,
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {}
```

### 4.2 Main Bootstrap

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  // Pino logger
  app.useLogger(app.get(Logger));

  // Security
  await app.register(helmet);
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Zoop API')
      .setDescription('Zoop Backend API for mobile app')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Start
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application running on port ${port}`);
}

bootstrap();
```

### 4.3 Auth Module

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { PrivyStrategy } from './strategies/privy.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, PrivyStrategy],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}

// src/auth/strategies/privy.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { PrivyClient } from '@privy-io/server-auth';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PrivyStrategy extends PassportStrategy(Strategy, 'privy') {
  private privy: PrivyClient;

  constructor(
    private config: ConfigService,
    private users: UsersService,
  ) {
    super();
    this.privy = new PrivyClient(
      config.get('PRIVY_APP_ID'),
      config.get('PRIVY_APP_SECRET'),
    );
  }

  async validate(request: any): Promise<any> {
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const verifiedClaims = await this.privy.verifyAuthToken(token);
      const user = await this.users.findByPrivyId(verifiedClaims.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

// src/auth/auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class AuthGuard extends PassportAuthGuard('privy') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### 4.4 Transactions Module

```typescript
// src/transactions/transactions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { SubmitTransactionDto } from './dto/submit-transaction.dto';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionStatusDto } from './dto/transaction-status.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Submit a meta-transaction' })
  @ApiResponse({ status: 202, description: 'Transaction queued' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submit(
    @CurrentUser() user: User,
    @Body() dto: SubmitTransactionDto,
  ): Promise<TransactionStatusDto> {
    return this.transactionsService.submit(user, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction status' })
  @ApiResponse({ status: 200, type: TransactionDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<TransactionDto> {
    return this.transactionsService.getStatus(user.id, id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiResponse({ status: 200, type: [TransactionDto] })
  async getUserTransactions(
    @CurrentUser() user: User,
    @Query() query: GetTransactionsDto,
  ): Promise<{ data: TransactionDto[]; total: number }> {
    return this.transactionsService.getUserTransactions(user.id, query);
  }
}

// src/transactions/transactions.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { BalancesService } from '../balances/balances.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QUEUES, PRIORITIES } from '../queues/queues.constants';
import { SubmitTransactionDto } from './dto/submit-transaction.dto';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionStatusDto } from './dto/transaction-status.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { User } from '../users/entities/user.entity';
import { verifyTypedData } from 'viem';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private balances: BalancesService,
    private notifications: NotificationsService,
    @InjectQueue(QUEUES.TRANSACTIONS) private txQueue: Queue,
  ) {}

  async submit(user: User, dto: SubmitTransactionDto): Promise<TransactionStatusDto> {
    // 1. Verify EIP-712 signature
    const isValid = await this.verifySignature(user.privyEoaAddress, dto);
    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }

    // 2. Validate nonce (prevent replay attacks)
    await this.validateAndIncrementNonce(user.id, dto.nonce);

    // 3. Validate deadline
    if (dto.deadline < Math.floor(Date.now() / 1000)) {
      throw new BadRequestException('Transaction deadline expired');
    }

    // 4. Check balance for transfers/withdrawals
    if (dto.type === 'transfer' || dto.type === 'withdrawal') {
      const amount = BigInt(dto.params.amount);
      const available = await this.balances.getAvailable(user.id, 'ZOOP');
      if (available < amount) {
        throw new BadRequestException('Insufficient balance');
      }
    }

    // 5. Create transaction record
    const priority = this.getPriority(dto.type);
    const tx = await this.prisma.transaction.create({
      data: {
        userId: user.id,
        type: dto.type,
        status: 'queued',
        params: dto.params,
        priority,
        signature: dto.signature,
        nonce: dto.nonce,
        deadline: new Date(dto.deadline * 1000),
        queuedAt: new Date(),
      },
    });

    // 6. Reserve balance (optimistic lock)
    if (dto.type === 'transfer' || dto.type === 'withdrawal') {
      await this.balances.reserve(user.id, 'ZOOP', BigInt(dto.params.amount));
    }

    // 7. Add to queue
    await this.txQueue.add(
      dto.type,
      {
        transactionId: tx.id,
        userId: user.id,
        type: dto.type,
        params: dto.params,
      },
      { priority },
    );

    // 8. Get queue position
    const position = await this.getQueuePosition(tx.id);

    return {
      transactionId: tx.id,
      status: 'queued',
      queuePosition: position,
      estimatedWaitSeconds: position * 5, // ~5 sec per tx
    };
  }

  async getStatus(userId: string, txId: string): Promise<TransactionDto> {
    const tx = await this.prisma.transaction.findFirst({
      where: { id: txId, userId },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const queuePosition = tx.status === 'queued'
      ? await this.getQueuePosition(txId)
      : undefined;

    return {
      id: tx.id,
      type: tx.type,
      status: tx.status,
      params: tx.params,
      queuePosition,
      hederaTxId: tx.hederaTxId,
      createdAt: tx.createdAt,
      confirmedAt: tx.confirmedAt,
      errorMessage: tx.errorMessage,
    };
  }

  async getUserTransactions(
    userId: string,
    query: GetTransactionsDto,
  ): Promise<{ data: TransactionDto[]; total: number }> {
    const where = {
      userId,
      ...(query.status && { status: { in: query.status } }),
      ...(query.type && { type: { in: query.type } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.offset || 0,
        take: query.limit || 20,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: data.map(tx => ({
        id: tx.id,
        type: tx.type,
        status: tx.status,
        params: tx.params,
        hederaTxId: tx.hederaTxId,
        createdAt: tx.createdAt,
        confirmedAt: tx.confirmedAt,
        errorMessage: tx.errorMessage,
      })),
      total,
    };
  }

  private async verifySignature(
    address: string,
    dto: SubmitTransactionDto,
  ): Promise<boolean> {
    try {
      const valid = await verifyTypedData({
        address: address as `0x${string}`,
        domain: {
          name: 'Zoop',
          version: '1',
          chainId: 296, // Hedera testnet
        },
        types: {
          Transaction: [
            { name: 'type', type: 'string' },
            { name: 'params', type: 'string' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Transaction',
        message: {
          type: dto.type,
          params: JSON.stringify(dto.params),
          nonce: BigInt(dto.nonce),
          deadline: BigInt(dto.deadline),
        },
        signature: dto.signature as `0x${string}`,
      });
      return valid;
    } catch {
      return false;
    }
  }

  private async validateAndIncrementNonce(
    userId: string,
    nonce: number,
  ): Promise<void> {
    const result = await this.prisma.userNonce.upsert({
      where: { userId },
      create: { userId, currentNonce: nonce + 1 },
      update: {
        currentNonce: {
          increment: 1,
        },
      },
    });

    if (result.currentNonce - 1 !== nonce) {
      throw new BadRequestException('Invalid nonce');
    }
  }

  private getPriority(type: string): number {
    return PRIORITIES[type] || PRIORITIES.default;
  }

  private async getQueuePosition(txId: string): Promise<number> {
    const count = await this.prisma.transaction.count({
      where: {
        status: 'queued',
        queuedAt: {
          lt: (await this.prisma.transaction.findUnique({ where: { id: txId } }))?.queuedAt,
        },
      },
    });
    return count + 1;
  }
}

// src/transactions/dto/submit-transaction.dto.ts
import { IsString, IsNumber, IsObject, Min, IsHexadecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitTransactionDto {
  @ApiProperty({ enum: ['transfer', 'withdrawal', 'stake', 'unstake', 'claim'] })
  @IsString()
  type: string;

  @ApiProperty({ example: { to: '0x...', amount: '1000000000' } })
  @IsObject()
  params: Record<string, any>;

  @ApiProperty({ example: 42 })
  @IsNumber()
  @Min(0)
  nonce: number;

  @ApiProperty({ example: 1701234567 })
  @IsNumber()
  deadline: number;

  @ApiProperty({ example: '0x...' })
  @IsHexadecimal()
  signature: string;
}
```

### 4.5 Queue Processors

```typescript
// src/queues/queues.constants.ts
export const QUEUES = {
  ACCOUNT_CREATION: 'hedera:account-creation',
  TRANSACTIONS: 'hedera:transactions',
  BATCH_TRANSFERS: 'hedera:batch-transfers',
  BALANCE_SYNC: 'hedera:balance-sync',
  NOTIFICATIONS: 'notifications',
};

export const PRIORITIES = {
  unstake: 1,      // Critical - time-sensitive
  claim: 2,        // High
  withdrawal: 2,   // High
  transfer: 3,     // Normal
  stake: 3,        // Normal
  default: 3,
};

// src/queues/processors/transaction.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HederaService } from '../../blockchain/hedera/hedera.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { BalancesService } from '../../balances/balances.service';
import { QUEUES } from '../queues.constants';

interface TransactionJobData {
  transactionId: string;
  userId: string;
  type: string;
  params: Record<string, any>;
}

@Processor(QUEUES.TRANSACTIONS, {
  concurrency: 5,
  limiter: {
    max: 50,
    duration: 1000, // 50 per second
  },
})
export class TransactionProcessor extends WorkerHost {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    private prisma: PrismaService,
    private hedera: HederaService,
    private notifications: NotificationsService,
    private balances: BalancesService,
  ) {
    super();
  }

  async process(job: Job<TransactionJobData>): Promise<any> {
    const { transactionId, userId, type, params } = job.data;
    this.logger.log(`Processing ${type} transaction: ${transactionId}`);

    // Update status to processing
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'processing', submittedAt: new Date() },
    });

    try {
      // Execute on Hedera
      const result = await this.executeTransaction(type, params);

      // Update as confirmed
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'confirmed',
          hederaTxId: result.txId,
          hederaReceipt: result.receipt,
          confirmedAt: new Date(),
        },
      });

      // Release/apply balance changes
      await this.applyBalanceChanges(userId, type, params);

      // Notify user
      await this.notifications.send(userId, {
        type: 'transaction:confirmed',
        data: { transactionId, hederaTxId: result.txId },
      });

      return result;

    } catch (error) {
      this.logger.error(`Transaction failed: ${transactionId}`, error);

      // Update as failed (after max retries)
      if (job.attemptsMade >= (job.opts.attempts || 5) - 1) {
        await this.prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'failed',
            failedAt: new Date(),
            errorMessage: error.message,
          },
        });

        // Release reserved balance
        await this.balances.releaseReservation(userId, 'ZOOP', BigInt(params.amount || 0));

        // Notify user of failure
        await this.notifications.send(userId, {
          type: 'transaction:failed',
          data: { transactionId, error: error.message },
        });
      }

      throw error; // Let BullMQ handle retry
    }
  }

  private async executeTransaction(
    type: string,
    params: Record<string, any>,
  ): Promise<{ txId: string; receipt: any }> {
    switch (type) {
      case 'transfer':
        return this.hedera.transfer(params.to, BigInt(params.amount));
      case 'withdrawal':
        return this.hedera.transferFromTreasury(params.to, BigInt(params.amount));
      case 'stake':
        return this.hedera.stake(params.poolId, BigInt(params.amount));
      case 'unstake':
        return this.hedera.unstake(params.stakeId);
      case 'claim':
        return this.hedera.claimRewards(params.stakeIds);
      default:
        throw new Error(`Unknown transaction type: ${type}`);
    }
  }

  private async applyBalanceChanges(
    userId: string,
    type: string,
    params: Record<string, any>,
  ): Promise<void> {
    const amount = BigInt(params.amount || 0);

    switch (type) {
      case 'transfer':
      case 'withdrawal':
        await this.balances.confirmWithdrawal(userId, 'ZOOP', amount);
        break;
      case 'stake':
        await this.balances.confirmWithdrawal(userId, 'ZOOP', amount);
        break;
      // Unstake and claim will be handled by balance sync
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TransactionJobData>, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}

// src/queues/processors/account-creation.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HederaService } from '../../blockchain/hedera/hedera.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { TreasuryService } from '../../treasury/treasury.service';
import { QUEUES } from '../queues.constants';

interface AccountCreationJobData {
  userId: string;
  privyEoaAddress: string;
  deploySafe: boolean;
}

@Processor(QUEUES.ACCOUNT_CREATION, {
  concurrency: 3,
  limiter: {
    max: 50,
    duration: 1000, // 50 accounts per second
  },
})
export class AccountCreationProcessor extends WorkerHost {
  private readonly logger = new Logger(AccountCreationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private hedera: HederaService,
    private treasury: TreasuryService,
    private notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<AccountCreationJobData>): Promise<any> {
    const { userId, privyEoaAddress, deploySafe } = job.data;
    this.logger.log(`Creating Hedera account for user: ${userId}`);

    // Update status
    await this.prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'creating' },
    });

    try {
      // 1. Create Hedera account
      const accountId = await this.hedera.createAccount(privyEoaAddress);

      // 2. Optionally deploy Safe wallet
      let safeAddress: string | null = null;
      if (deploySafe) {
        safeAddress = await this.hedera.deploySafeWallet(privyEoaAddress);
      }

      // 3. Update user record
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hederaAccountId: accountId,
          safeWalletAddress: safeAddress,
          accountStatus: 'active',
        },
      });

      // 4. Transfer pending balance from treasury
      const pendingBalance = await this.prisma.balance.findFirst({
        where: { userId, tokenSymbol: 'ZOOP' },
      });

      if (pendingBalance && BigInt(pendingBalance.pendingDeposits) > 0n) {
        const targetAddress = safeAddress || privyEoaAddress;
        await this.treasury.transferToUser(
          targetAddress,
          BigInt(pendingBalance.pendingDeposits),
        );

        // Update balance record
        await this.prisma.balance.update({
          where: { id: pendingBalance.id },
          data: {
            onChainBalance: pendingBalance.pendingDeposits,
            pendingDeposits: '0',
          },
        });
      }

      // 5. Notify user
      await this.notifications.send(userId, {
        type: 'account:created',
        data: { hederaAccountId: accountId, safeAddress },
      });

      this.logger.log(`Account created for user ${userId}: ${accountId}`);
      return { accountId, safeAddress };

    } catch (error) {
      this.logger.error(`Account creation failed for ${userId}`, error);

      await this.prisma.user.update({
        where: { id: userId },
        data: { accountStatus: 'failed' },
      });

      throw error;
    }
  }
}
```

---

## 5. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ ENUMS ============

enum AccountStatus {
  pending
  creating
  active
  failed
}

enum TransactionStatus {
  pending
  queued
  processing
  submitted
  confirmed
  failed
}

enum TransactionType {
  account_creation
  safe_deployment
  transfer
  withdrawal
  stake
  unstake
  claim
  batch_transfer
}

// ============ MODELS ============

model User {
  id                String        @id @default(uuid()) @db.Uuid
  privyUserId       String        @unique @map("privy_user_id")
  privyEoaAddress   String        @map("privy_eoa_address") @db.VarChar(42)
  hederaAccountId   String?       @map("hedera_account_id") @db.VarChar(20)
  safeWalletAddress String?       @map("safe_wallet_address") @db.VarChar(42)
  accountStatus     AccountStatus @default(pending) @map("account_status")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  balances     Balance[]
  transactions Transaction[]
  nonce        UserNonce?

  @@index([accountStatus])
  @@index([privyEoaAddress])
  @@map("users")
}

model Balance {
  id                 String    @id @default(uuid()) @db.Uuid
  userId             String    @map("user_id") @db.Uuid
  tokenSymbol        String    @map("token_symbol") @db.VarChar(10)
  onChainBalance     Decimal   @default(0) @map("on_chain_balance") @db.Decimal(38, 0)
  pendingDeposits    Decimal   @default(0) @map("pending_deposits") @db.Decimal(38, 0)
  pendingWithdrawals Decimal   @default(0) @map("pending_withdrawals") @db.Decimal(38, 0)
  lastSyncedAt       DateTime? @map("last_synced_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, tokenSymbol])
  @@map("balances")
}

model Transaction {
  id            String            @id @default(uuid()) @db.Uuid
  userId        String            @map("user_id") @db.Uuid
  type          TransactionType
  status        TransactionStatus @default(pending)
  params        Json
  priority      Int               @default(3)
  queuePosition Int?              @map("queue_position")
  retryCount    Int               @default(0) @map("retry_count")

  // Signature data (for meta-transactions)
  signature String?
  nonce     Int?
  deadline  DateTime?

  // Hedera data
  hederaTxId    String? @map("hedera_tx_id") @db.VarChar(50)
  hederaReceipt Json?   @map("hedera_receipt")

  // Timestamps
  createdAt   DateTime  @default(now()) @map("created_at")
  queuedAt    DateTime? @map("queued_at")
  submittedAt DateTime? @map("submitted_at")
  confirmedAt DateTime? @map("confirmed_at")
  failedAt    DateTime? @map("failed_at")

  errorMessage String? @map("error_message")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status])
  @@index([userId, status])
  @@index([createdAt])
  @@index([type, status])
  @@map("transactions")
}

model UserNonce {
  userId       String @id @map("user_id") @db.Uuid
  currentNonce BigInt @default(0) @map("current_nonce")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_nonces")
}

model TreasuryOperation {
  id             String   @id @default(uuid()) @db.Uuid
  operationType  String   @map("operation_type") @db.VarChar(20)
  transactionId  String?  @map("transaction_id") @db.Uuid
  hederaTxId     String?  @map("hedera_tx_id") @db.VarChar(50)
  totalAmount    Decimal  @map("total_amount") @db.Decimal(38, 0)
  recipientCount Int?     @map("recipient_count")
  createdAt      DateTime @default(now()) @map("created_at")

  @@index([operationType])
  @@index([createdAt])
  @@map("treasury_operations")
}
```

---

## 6. Queue System

### 6.1 Queue Module Setup

```typescript
// src/queues/queues.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';

import { QUEUES } from './queues.constants';
import { TransactionProcessor } from './processors/transaction.processor';
import { AccountCreationProcessor } from './processors/account-creation.processor';
import { BatchTransferProcessor } from './processors/batch-transfer.processor';
import { BalanceSyncProcessor } from './processors/balance-sync.processor';
import { QueuesHealth } from './queues.health';

@Module({
  imports: [
    // Redis connection for BullMQ
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      }),
      inject: [ConfigService],
    }),

    // Register queues
    BullModule.registerQueue(
      { name: QUEUES.ACCOUNT_CREATION },
      { name: QUEUES.TRANSACTIONS },
      { name: QUEUES.BATCH_TRANSFERS },
      { name: QUEUES.BALANCE_SYNC },
      { name: QUEUES.NOTIFICATIONS },
    ),

    // Bull Board UI (development only)
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: FastifyAdapter,
    }),
    BullBoardModule.forFeature(
      { name: QUEUES.ACCOUNT_CREATION, adapter: BullMQAdapter },
      { name: QUEUES.TRANSACTIONS, adapter: BullMQAdapter },
      { name: QUEUES.BATCH_TRANSFERS, adapter: BullMQAdapter },
      { name: QUEUES.BALANCE_SYNC, adapter: BullMQAdapter },
    ),
  ],
  providers: [
    TransactionProcessor,
    AccountCreationProcessor,
    BatchTransferProcessor,
    BalanceSyncProcessor,
    QueuesHealth,
  ],
  exports: [BullModule, QueuesHealth],
})
export class QueuesModule {}
```

### 6.2 Queue Health Check

```typescript
// src/queues/queues.health.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { QUEUES } from './queues.constants';

@Injectable()
export class QueuesHealth extends HealthIndicator {
  constructor(
    @InjectQueue(QUEUES.TRANSACTIONS) private txQueue: Queue,
    @InjectQueue(QUEUES.ACCOUNT_CREATION) private accountQueue: Queue,
  ) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const [txWaiting, txActive, accountWaiting] = await Promise.all([
      this.txQueue.getWaitingCount(),
      this.txQueue.getActiveCount(),
      this.accountQueue.getWaitingCount(),
    ]);

    const isHealthy = txWaiting < 10000 && accountWaiting < 5000;

    const result = this.getStatus('queues', isHealthy, {
      transactions: { waiting: txWaiting, active: txActive },
      accounts: { waiting: accountWaiting },
    });

    if (!isHealthy) {
      throw new HealthCheckError('Queue backlog too high', result);
    }

    return result;
  }

  async getMetrics(): Promise<Record<string, number>> {
    const [txWaiting, txActive, txCompleted, txFailed] = await Promise.all([
      this.txQueue.getWaitingCount(),
      this.txQueue.getActiveCount(),
      this.txQueue.getCompletedCount(),
      this.txQueue.getFailedCount(),
    ]);

    return {
      'queue_transactions_waiting': txWaiting,
      'queue_transactions_active': txActive,
      'queue_transactions_completed': txCompleted,
      'queue_transactions_failed': txFailed,
    };
  }
}
```

---

## 7. WebSocket Gateway

```typescript
// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(private authService: AuthService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      // Store user association
      client.data.userId = user.id;
      client.join(`user:${user.id}`);

      // Track socket
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);

      this.logger.log(`Client connected: ${client.id} (user: ${user.id})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}

// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

export interface NotificationPayload {
  type: string;
  data: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(private gateway: NotificationsGateway) {}

  async send(userId: string, payload: NotificationPayload): Promise<void> {
    this.gateway.sendToUser(userId, payload.type, {
      ...payload.data,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTransactionUpdate(
    userId: string,
    transactionId: string,
    status: string,
    hederaTxId?: string,
  ): Promise<void> {
    await this.send(userId, {
      type: 'transaction:status_changed',
      data: { transactionId, status, hederaTxId },
    });
  }

  async sendAccountCreated(
    userId: string,
    hederaAccountId: string,
    safeAddress?: string,
  ): Promise<void> {
    await this.send(userId, {
      type: 'account:created',
      data: { hederaAccountId, safeAddress },
    });
  }
}
```

---

## 8. Authentication

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/server-auth';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private privy: PrivyClient;

  constructor(
    private config: ConfigService,
    private users: UsersService,
  ) {
    this.privy = new PrivyClient(
      config.get('PRIVY_APP_ID')!,
      config.get('PRIVY_APP_SECRET')!,
    );
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const verifiedClaims = await this.privy.verifyAuthToken(token);
      return this.users.findByPrivyId(verifiedClaims.userId);
    } catch {
      return null;
    }
  }

  async loginOrRegister(token: string): Promise<{ user: User; isNew: boolean }> {
    const verifiedClaims = await this.privy.verifyAuthToken(token);

    // Get Privy user details
    const privyUser = await this.privy.getUser(verifiedClaims.userId);
    const wallet = privyUser.linkedAccounts.find(
      (a) => a.type === 'wallet' && a.walletClientType === 'privy',
    );

    if (!wallet || !('address' in wallet)) {
      throw new UnauthorizedException('No embedded wallet found');
    }

    // Find or create user
    let user = await this.users.findByPrivyId(verifiedClaims.userId);
    let isNew = false;

    if (!user) {
      user = await this.users.create({
        privyUserId: verifiedClaims.userId,
        privyEoaAddress: wallet.address,
      });
      isNew = true;
    }

    return { user, isNew };
  }

  async getCurrentNonce(userId: string): Promise<number> {
    return this.users.getNonce(userId);
  }
}

// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login or register with Privy token' })
  async login(@Body() dto: LoginDto) {
    const { user, isNew } = await this.authService.loginOrRegister(dto.token);
    return {
      user: {
        id: user.id,
        privyEoaAddress: user.privyEoaAddress,
        hederaAccountId: user.hederaAccountId,
        safeWalletAddress: user.safeWalletAddress,
        accountStatus: user.accountStatus,
      },
      isNewUser: isNew,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@CurrentUser() user: User) {
    return {
      id: user.id,
      privyEoaAddress: user.privyEoaAddress,
      hederaAccountId: user.hederaAccountId,
      safeWalletAddress: user.safeWalletAddress,
      accountStatus: user.accountStatus,
    };
  }

  @Get('nonce')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current nonce for signing' })
  async getNonce(@CurrentUser() user: User) {
    const nonce = await this.authService.getCurrentNonce(user.id);
    return { nonce };
  }
}
```

---

## 9. Hedera Integration

```typescript
// src/blockchain/hedera/hedera.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  AccountId,
  PrivateKey,
  TransferTransaction,
  AccountCreateTransaction,
  Hbar,
  TokenAssociateTransaction,
  TokenId,
} from '@hashgraph/sdk';

@Injectable()
export class HederaService implements OnModuleInit {
  private readonly logger = new Logger(HederaService.name);
  private client: Client;
  private operatorKey: PrivateKey;
  private treasuryId: AccountId;
  private zoopTokenId: TokenId;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const network = this.config.get('HEDERA_NETWORK');
    const operatorId = this.config.get('HEDERA_OPERATOR_ID');
    const operatorKeyStr = this.config.get('HEDERA_OPERATOR_KEY');

    this.operatorKey = PrivateKey.fromStringECDSA(operatorKeyStr);
    this.treasuryId = AccountId.fromString(this.config.get('HEDERA_TREASURY_ID'));
    this.zoopTokenId = TokenId.fromString(this.config.get('ZOOP_TOKEN_ID'));

    this.client = network === 'mainnet'
      ? Client.forMainnet()
      : Client.forTestnet();

    this.client.setOperator(operatorId, this.operatorKey);

    this.logger.log(`Hedera client initialized for ${network}`);
  }

  async createAccount(evmAddress: string): Promise<string> {
    const tx = new AccountCreateTransaction()
      .setKey(PrivateKey.fromStringECDSA(evmAddress).publicKey)
      .setInitialBalance(new Hbar(0.5)) // Small HBAR for gas
      .setMaxAutomaticTokenAssociations(10);

    const response = await tx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    const accountId = receipt.accountId!.toString();
    this.logger.log(`Created Hedera account: ${accountId}`);

    // Auto-associate ZOOP token
    await this.associateToken(accountId, this.zoopTokenId.toString());

    return accountId;
  }

  async associateToken(accountId: string, tokenId: string): Promise<void> {
    const tx = new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTokenIds([TokenId.fromString(tokenId)]);

    await tx.execute(this.client);
    this.logger.log(`Associated token ${tokenId} with account ${accountId}`);
  }

  async transfer(
    to: string,
    amount: bigint,
  ): Promise<{ txId: string; receipt: any }> {
    const tx = new TransferTransaction()
      .addTokenTransfer(this.zoopTokenId, this.treasuryId, -amount)
      .addTokenTransfer(this.zoopTokenId, AccountId.fromString(to), amount);

    const response = await tx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return {
      txId: response.transactionId.toString(),
      receipt: receipt.toJSON(),
    };
  }

  async transferFromTreasury(
    to: string,
    amount: bigint,
  ): Promise<{ txId: string; receipt: any }> {
    return this.transfer(to, amount);
  }

  async batchTransfer(
    transfers: Array<{ to: string; amount: bigint }>,
  ): Promise<{ txId: string; receipt: any }> {
    const tx = new TransferTransaction();

    let totalAmount = 0n;
    for (const { to, amount } of transfers) {
      tx.addTokenTransfer(this.zoopTokenId, AccountId.fromString(to), amount);
      totalAmount += amount;
    }

    tx.addTokenTransfer(this.zoopTokenId, this.treasuryId, -totalAmount);

    const response = await tx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return {
      txId: response.transactionId.toString(),
      receipt: receipt.toJSON(),
    };
  }

  async stake(poolId: number, amount: bigint): Promise<{ txId: string; receipt: any }> {
    // Call ZoopStaking contract via ContractExecuteTransaction
    // Implementation depends on contract ABI
    throw new Error('Not implemented - use contract execution');
  }

  async unstake(stakeId: number): Promise<{ txId: string; receipt: any }> {
    // Call ZoopStaking contract
    throw new Error('Not implemented - use contract execution');
  }

  async claimRewards(stakeIds: number[]): Promise<{ txId: string; receipt: any }> {
    // Call ZoopStaking contract
    throw new Error('Not implemented - use contract execution');
  }

  async deploySafeWallet(ownerAddress: string): Promise<string> {
    // Call ZoopSafeFactory contract
    throw new Error('Not implemented - use contract execution');
  }

  async getBalance(accountId: string): Promise<bigint> {
    // Query token balance
    throw new Error('Not implemented');
  }
}
```

---

## 10. API Endpoints

### Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Login with Privy token | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| GET | `/api/v1/auth/nonce` | Get signing nonce | Yes |
| GET | `/api/v1/users/:id/status` | Get account status | Yes |
| GET | `/api/v1/balances` | Get user balances | Yes |
| POST | `/api/v1/transactions` | Submit transaction | Yes |
| GET | `/api/v1/transactions/:id` | Get transaction status | Yes |
| GET | `/api/v1/transactions` | List user transactions | Yes |
| GET | `/api/v1/health` | Health check | No |
| GET | `/api/v1/metrics` | Prometheus metrics | No |

### OpenAPI Documentation

Available at `/docs` in development.

---

## 11. Configuration

```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  privy: {
    appId: process.env.PRIVY_APP_ID,
    appSecret: process.env.PRIVY_APP_SECRET,
  },

  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    operatorId: process.env.HEDERA_OPERATOR_ID,
    operatorKey: process.env.HEDERA_OPERATOR_KEY,
    treasuryId: process.env.HEDERA_TREASURY_ID,
    zoopTokenId: process.env.ZOOP_TOKEN_ID,
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
});

// src/config/validation.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number = 6379;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsString()
  PRIVY_APP_ID: string;

  @IsString()
  PRIVY_APP_SECRET: string;

  @IsString()
  HEDERA_NETWORK: string;

  @IsString()
  HEDERA_OPERATOR_ID: string;

  @IsString()
  HEDERA_OPERATOR_KEY: string;

  @IsString()
  HEDERA_TREASURY_ID: string;

  @IsString()
  ZOOP_TOKEN_ID: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
```

### Environment Variables

```bash
# .env.example

# App
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/zoop

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Privy
PRIVY_APP_ID=
PRIVY_APP_SECRET=

# Hedera
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e...
HEDERA_TREASURY_ID=0.0.xxxxx
ZOOP_TOKEN_ID=0.0.xxxxx

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:19006

# Sentry (optional)
SENTRY_DSN=
```

---

## 12. Testing Strategy

```typescript
// test/transactions.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);

    // Setup test user and auth token
    // ...
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/v1/transactions', () => {
    it('should queue a valid transaction', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'transfer',
          params: { to: '0.0.123456', amount: '1000000000' },
          nonce: 1,
          deadline: Math.floor(Date.now() / 1000) + 3600,
          signature: '0x...',
        })
        .expect(202);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.status).toBe('queued');
    });

    it('should reject expired deadline', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'transfer',
          params: { to: '0.0.123456', amount: '1000000000' },
          nonce: 2,
          deadline: Math.floor(Date.now() / 1000) - 100, // Past
          signature: '0x...',
        })
        .expect(400);
    });
  });
});
```

---

## 13. Deployment

### Docker Setup

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/zoop
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  worker:
    build:
      context: ..
      dockerfile: docker/Dockerfile.worker
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/zoop
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=zoop
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Health Check Endpoint

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { QueuesHealth } from '../queues/queues.health';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private queuesHealth: QueuesHealth,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.queuesHealth.isHealthy(),
    ]);
  }

  @Get('ready')
  @Public()
  ready() {
    return { status: 'ok' };
  }
}
```

---

## Summary

This backend architecture provides:

1. **NestJS framework** with Fastify for performance
2. **Queue-based processing** for Hedera rate limits
3. **Off-chain ledger** for pending accounts
4. **WebSocket** real-time updates
5. **Privy authentication** integration
6. **Prisma ORM** with PostgreSQL
7. **BullMQ** for job queues
8. **Comprehensive testing** setup
9. **Docker deployment** ready

The architecture handles Hedera's constraints (no mempool, gas limits) while providing a smooth user experience through the mobile app.
