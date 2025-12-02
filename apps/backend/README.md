# Zoop Backend API

NestJS backend API with Fastify adapter for the Zoop mobile wallet.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com) v11
- **HTTP**: [Fastify](https://fastify.io) adapter (faster than Express)
- **Database**: PostgreSQL with [Prisma](https://prisma.io) ORM
- **Queue**: [BullMQ](https://bullmq.io) with Redis
- **Validation**: class-validator + class-transformer
- **Auth**: Privy JWT verification

## Getting Started

### Prerequisites

- Bun v1.2+
- Docker (for PostgreSQL + Redis)
- Privy account with App ID and Secret

### Setup

```bash
# From monorepo root
bun install

# Start local databases
docker compose up -d

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
bun run prisma:migrate

# Start development server
bun run start:dev
```

Server runs at `http://localhost:3001`

## Project Structure

```
apps/backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Health check endpoints
│   │
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication (Privy)
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts   # JWT guard
│   │   │   └── dto/
│   │   │
│   │   ├── users/              # User management
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── wallets/            # Wallet operations
│   │   │   ├── wallets.module.ts
│   │   │   ├── wallets.controller.ts
│   │   │   ├── wallets.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── balances/           # Balance tracking
│   │   │   ├── balances.module.ts
│   │   │   ├── balances.controller.ts
│   │   │   ├── balances.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── staking/            # Staking pools
│   │   │   ├── staking.module.ts
│   │   │   ├── staking.controller.ts
│   │   │   ├── staking.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── bridge/             # Cross-chain bridge
│   │   │   ├── bridge.module.ts
│   │   │   ├── bridge.controller.ts
│   │   │   ├── bridge.service.ts
│   │   │   └── dto/
│   │   │
│   │   └── transactions/       # Transaction queue
│   │       ├── transactions.module.ts
│   │       ├── transactions.service.ts
│   │       ├── transactions.processor.ts  # BullMQ worker
│   │       └── dto/
│   │
│   ├── common/                 # Shared utilities
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Response interceptors
│   │   └── pipes/              # Validation pipes
│   │
│   └── prisma/                 # Database
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       └── schema.prisma       # Database schema
│
├── test/                       # E2E tests
├── .env.example                # Environment template
├── nest-cli.json               # NestJS CLI config
└── tsconfig.json               # TypeScript config
```

## API Endpoints

### Authentication
```
POST   /api/auth/verify          # Verify Privy token
POST   /api/auth/refresh         # Refresh session
```

### Users
```
GET    /api/users/me             # Get current user
PATCH  /api/users/me             # Update profile
```

### Wallets
```
GET    /api/wallets              # List user wallets
POST   /api/wallets              # Create wallet
GET    /api/wallets/:address     # Get wallet details
```

### Balances
```
GET    /api/balances             # Get all balances
GET    /api/balances/:token      # Get specific token balance
```

### Staking
```
GET    /api/staking/pools        # List staking pools
GET    /api/staking/stakes       # Get user stakes
POST   /api/staking/stake        # Create new stake
POST   /api/staking/unstake      # Unstake tokens
POST   /api/staking/claim        # Claim rewards
```

### Bridge
```
GET    /api/bridge/quote         # Get bridge quote
POST   /api/bridge/transfer      # Initiate bridge transfer
GET    /api/bridge/status/:id    # Check transfer status
```

### Transactions
```
GET    /api/transactions         # List transactions
GET    /api/transactions/:id     # Get transaction details
```

## Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://zoop:zoop_dev_password@localhost:5432/zoop

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGINS=http://localhost:8081,http://localhost:19006

# Privy
PRIVY_APP_ID=your_app_id
PRIVY_APP_SECRET=your_app_secret

# Hedera
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=your_private_key
HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api

# BSC
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

## Database

### Prisma Commands

```bash
# Generate Prisma client
bun run prisma:generate

# Create migration
bun run prisma:migrate

# Reset database
bun run prisma:reset

# Open Prisma Studio
bun run prisma:studio
```

### Schema Overview

```prisma
model User {
  id            String    @id @default(cuid())
  privyId       String    @unique
  email         String?
  wallets       Wallet[]
  stakes        Stake[]
  createdAt     DateTime  @default(now())
}

model Wallet {
  id            String    @id @default(cuid())
  address       String    @unique
  chain         Chain
  userId        String
  user          User      @relation(...)
}

model Balance {
  id            String    @id @default(cuid())
  walletId      String
  token         String
  amount        Decimal
  pendingIn     Decimal   @default(0)
  pendingOut    Decimal   @default(0)
}

model Transaction {
  id            String    @id @default(cuid())
  type          TxType
  status        TxStatus
  walletId      String
  amount        Decimal
  txHash        String?
  queuePosition Int?
}
```

## Transaction Queue (BullMQ)

Hedera has limited throughput (~65 accounts/sec). We use BullMQ to queue transactions:

```typescript
// Adding a transaction to queue
await this.transactionQueue.add('hedera-tx', {
  type: 'TRANSFER',
  from: '0x...',
  to: '0x...',
  amount: '1000000',
}, {
  priority: 1,        // Higher = processed first
  attempts: 3,        // Retry on failure
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
});
```

Monitor queue at Redis Commander: http://localhost:8081

## Scripts

| Command | Description |
|---------|-------------|
| `bun run start` | Start server |
| `bun run start:dev` | Start with hot reload |
| `bun run start:prod` | Start production build |
| `bun run build` | Build for production |
| `bun run test` | Run unit tests |
| `bun run test:e2e` | Run E2E tests |
| `bun run prisma:generate` | Generate Prisma client |
| `bun run prisma:migrate` | Run migrations |
| `bun run prisma:studio` | Open Prisma Studio |

## Testing

```bash
# Unit tests
bun run test

# E2E tests (requires running database)
bun run test:e2e

# Test coverage
bun run test:cov
```

## Architecture Notes

### Why Fastify?

Fastify is ~2x faster than Express for JSON serialization, important for high-throughput APIs.

### Why BullMQ?

Hedera's consensus limits require queuing transactions. BullMQ provides:
- Priority queues
- Retry with backoff
- Rate limiting
- Job scheduling
- Dashboard (Bull Board)

### Off-chain Ledger

To handle Hedera's account creation delays:
1. User signs up -> Balance shows 0 ZOOP
2. Deposit detected -> `pendingIn` incremented immediately
3. Account created on Hedera -> Balance synced
4. `availableBalance = onChain + pendingIn - pendingOut`

See [ARCHITECTURE.md](../../ARCHITECTURE.md) for full details.
