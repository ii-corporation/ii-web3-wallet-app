# Zoop Mobile App

A mobile-first Web3 wallet for the ZOOP ecosystem built on Hedera and BSC.

## Overview

Zoop is a non-custodial mobile wallet that enables users to:

- **Manage ZOOP tokens** - Hold, send, and receive ZOOP across Hedera and BSC chains
- **Stake tokens** - Earn rewards through flexible and fixed-term staking pools
- **Bridge assets** - Cross-chain transfers using LayerZero OFT standard
- **Safe wallet integration** - Social recovery via Privy embedded wallets

## Architecture

```
apps/
  mobile/          # React Native (Expo) mobile app with NativeWind
  backend/         # NestJS API with Fastify adapter

packages/
  shared-types/    # TypeScript types shared between apps
  constants/       # Chain configs, contract addresses, error codes
  contracts/       # Smart contract ABIs
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, Expo, NativeWind |
| Backend | NestJS, Fastify, Prisma |
| Database | PostgreSQL, Redis (BullMQ) |
| Blockchain | Hedera, BSC, Viem, LayerZero |
| Auth | Privy (embedded wallets) |

## Prerequisites

- [Bun](https://bun.sh) v1.2+
- [Docker](https://docker.com) (for local database)
- [Expo Go](https://expo.dev/client) app on your phone (for mobile testing)

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd zoop-mobile-app
bun install
```

### 2. Start local services (PostgreSQL + Redis)

```bash
# Start databases in background
docker compose up -d

# Verify services are running
docker compose ps
```

Services started:
- **PostgreSQL**: `localhost:5432` (user: `zoop`, password: `zoop_dev_password`, db: `zoop`)
- **Redis**: `localhost:6379`

Optional debug tools (start with `--profile debug`):
```bash
docker compose --profile debug up -d
```
- **pgAdmin**: http://localhost:5050 (admin@zoop.dev / admin)
- **Redis Commander**: http://localhost:8081

### 3. Configure environment variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your Privy and Hedera credentials

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
# Edit apps/mobile/.env with your Privy App ID
```

### 4. Run database migrations

```bash
cd apps/backend
bun run prisma:migrate
```

### 5. Start development servers

```bash
# From root - runs all apps
bun run dev

# Or run individually:
bun run mobile    # Start Expo dev server
bun run backend   # Start NestJS server
```

### 6. Open the mobile app

- **iOS Simulator**: Press `i` in the Expo terminal
- **Android Emulator**: Press `a` in the Expo terminal
- **Physical device**: Scan QR code with Expo Go app

## Scripts

| Command | Description |
|---------|-------------|
| `bun install` | Install all dependencies |
| `bun run dev` | Start all apps in dev mode |
| `bun run build` | Build all packages |
| `bun run mobile` | Start Expo mobile app |
| `bun run backend` | Start NestJS backend |

## Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Reset database (delete volumes)
docker compose down -v
```

## Project Structure

```
zoop-mobile-app/
├── apps/
│   ├── mobile/                 # Expo React Native app
│   │   ├── app/                # App screens (file-based routing)
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API clients, blockchain
│   │   │   └── stores/         # State management
│   │   └── assets/             # Images, fonts
│   │
│   └── backend/                # NestJS API
│       └── src/
│           ├── modules/        # Feature modules
│           │   ├── auth/       # Privy authentication
│           │   ├── users/      # User management
│           │   ├── wallets/    # Wallet operations
│           │   ├── staking/    # Staking pools
│           │   └── bridge/     # Cross-chain transfers
│           ├── common/         # Shared utilities
│           └── prisma/         # Database client
│
├── packages/
│   ├── shared-types/           # TypeScript interfaces
│   ├── constants/              # Chains, contracts, errors
│   └── contracts/              # Smart contract ABIs
│
├── docker-compose.yml          # Local PostgreSQL + Redis
└── turbo.json                  # Turborepo config
```

## Documentation

- [Architecture](./ARCHITECTURE.md) - System design, Hedera constraints, transaction infrastructure
- [Backend](./BACKEND.md) - API design, modules, database schema
- [Design System](./DESIGN_SYSTEM.md) - UI components, colors, typography

## Troubleshooting

### Docker issues

```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Force recreate containers
docker compose up -d --force-recreate
```

### Expo issues

```bash
# Clear Expo cache
cd apps/mobile
bunx expo start -c
```

### Bun issues

```bash
# Clear bun cache and reinstall
rm -rf node_modules bun.lock
bun install
```
