# Zoop Mobile App - Architecture & Features Document

> **Goal**: Build a clean, maintainable mobile wallet app following SOLID principles - NOT a translation of the existing codebase.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack Decision](#2-technology-stack-decision)
3. [Contract Integration Analysis](#3-contract-integration-analysis)
4. [Feature Requirements](#4-feature-requirements)
5. [Architecture Overview](#5-architecture-overview)
6. [SOLID Implementation Guidelines](#6-solid-implementation-guidelines)
7. [Layer Architecture](#7-layer-architecture)
8. [Module Structure](#8-module-structure)
9. [State Management Strategy](#9-state-management-strategy)
10. [Security Considerations](#10-security-considerations)
11. [Testing Strategy](#11-testing-strategy)
12. [Implementation Phases](#12-implementation-phases)

---

## 1. Executive Summary

### Project Context

We are building a **new** mobile wallet application for the Zoop ecosystem. This is a ground-up implementation that will:

- Integrate with the **new zoop-contracts** (Staking, NFT, Token)
- Use **Privy** for embedded wallet management
- Support **Hedera (primary)** and **EVM chains** (BSC, Ethereum)
- Follow **SOLID principles** for clean, maintainable code
- **Keep feature parity with old app** (no vesting for MVP)

### Old App Features (To Replicate)

Based on analysis of the existing Kodelab mobile app:

| Screen | Features |
|--------|----------|
| **Dashboard** | User profile, staking rewards display, ZOOP points, claim rewards, claim points, stake chart (my stakes vs others) |
| **Wallet** | ZOOP balance (per chain + total), NFT gallery, transaction history, send/receive/transfer actions |
| **Staking** | Browse creators, filter by category, stake to creator, view my stakes, unstake, lock period tracking |
| **Send** | Send tokens to address, QR scanner |
| **Receive** | Display wallet address, QR code |
| **Transfer** | Cross-chain transfer between networks |

### Key Differences from Old App

| Aspect | Old Mobile App | New Mobile App |
|--------|---------------|----------------|
| **Staking Model** | Creator-based staking via backend API | Pool-based on-chain staking (ZoopStaking contract) |
| **Rewards** | Backend-calculated rewards + ZOOP points | On-chain calculated rewards (pendingRewards) |
| **Contract Interaction** | Backend signs, user signs EIP-712 | User signs directly with Privy wallet |
| **SubWallet** | Factory-deployed per user | Direct wallet interaction (simpler) |
| **Architecture** | Mixed concerns, 1600+ line components | Clean SOLID architecture |
| **Vesting** | None | Not included in MVP (available in contracts for future) |

---

## 2. Technology Stack Decision

### Recommendation: React Native + Expo

**Why React Native over alternatives:**

| Factor | React Native | Flutter | Native |
|--------|-------------|---------|--------|
| **Privy SDK** | Full support | No support | No support |
| **Viem/Web3** | Excellent | Limited | Mixed |
| **WalletConnect** | v2 full support | Partial | Full |
| **Developer pool** | Largest | Growing | Split |
| **Time to market** | Fastest | Fast | Slowest |

**Critical Factor**: Privy is production-ready with SOC 2 Type II certification and only supports React Native for mobile embedded wallets.

### Recommended Stack

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│  React Native + Expo (Development Build)                │
│  UI: React Native Paper / Custom Components             │
│  Navigation: Expo Router (file-based)                   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                           │
│  State: Zustand (simpler than Context)                  │
│  Server State: TanStack Query v5                        │
│  Forms: React Hook Form + Zod                           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                              │
│  Use Cases / Services (pure TypeScript)                 │
│  Entities / Value Objects                               │
│  Repository Interfaces                                  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE                         │
│  Blockchain: Viem (27KB vs ethers 130KB)                │
│  Wallet: Privy Embedded Wallet                          │
│  External Wallets: WalletConnect v2 (optional)          │
│  Storage: expo-secure-store                             │
└─────────────────────────────────────────────────────────┘
```

### Safe Wallet Integration

The new architecture uses **Safe (Gnosis Safe) wallet proxies** instead of direct EOA interaction. This provides enhanced security and recovery options similar to Polymarket's approach.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WALLET ARCHITECTURE                           │
│                                                                  │
│   ┌─────────────────┐        ┌─────────────────────────────┐    │
│   │   Privy EOA     │──owns──│    Safe Wallet Proxy        │    │
│   │ (Embedded Key)  │        │  (User's Main Wallet)       │    │
│   └─────────────────┘        └─────────────────────────────┘    │
│          │                              │                        │
│          │ signs                        │ holds                  │
│          ▼                              ▼                        │
│   ┌─────────────────┐        ┌─────────────────────────────┐    │
│   │  Safe Tx Hash   │        │  ZOOP Tokens, NFTs, ETH     │    │
│   │   (EIP-712)     │        │  (All user assets)          │    │
│   └─────────────────┘        └─────────────────────────────┘    │
│                                                                  │
│   Optional: Social Recovery Module                               │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Guardians (family/friends) can recover if key lost     │   │
│   │  - 2-of-3 threshold                                     │   │
│   │  - 7 day delay before execution                         │   │
│   │  - Owner can cancel malicious attempts                  │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**ZoopSafeFactory Contract Features:**
- CREATE2 deterministic addresses (predict address before deployment)
- 1/1 multisig (single EOA owner for daily operations)
- Optional social recovery with guardians
- EIP-712 signatures for gasless wallet creation
- Full self-custody (Zoop has NO control over user funds)

**Smart Contracts (in `zoop-contracts/src/wallet/`):**
- `ZoopSafeFactory.sol` - Factory for deploying Safe proxies
- `IZoopSafeFactory.sol` - Interface with events and errors

**Mobile App Integration:**
```typescript
// 1. On first login, create Safe wallet for user
const safeAddress = await zoopSafeFactory.createWallet(
  privyEOA,           // User's Privy embedded wallet
  recoveryConfig,     // Optional guardians
  saltNonce           // For deterministic address
);

// 2. User's funds go to Safe address
const balance = await zoopToken.balanceOf(safeAddress);

// 3. Transactions are Safe transactions, signed by Privy EOA
const txHash = await safe.execTransaction(
  zoopToken.address,
  0,
  transferData,
  Operation.Call,
  0, 0, 0,
  address(0),
  address(0),
  signature  // Signed by Privy EOA
);
```

**Benefits over direct EOA:**
- Social recovery if key is lost
- Potential for batch transactions
- Future: multi-sig with additional signers
- Upgradeable security model

---

## 3. Contract Integration Analysis

### New Contracts vs Old App Contracts

The new `zoop-contracts` are significantly different from what the old mobile app integrated with:

#### Token (ZoopOFT / ZoopHTSConnector)

| Feature | Old App | New Contracts |
|---------|---------|---------------|
| Network | BSC Testnet only | Hedera (primary) + EVM chains |
| Decimals | 18 | 8 (Hedera) / 18 (EVM) |
| Cross-chain | LayerZero basic | LayerZero V2 OFT |
| Token type | ERC-20 only | HTS + ERC-20 |

**Mobile App Needs:**
- `balanceOf(address)` - Check balance
- `approve(spender, amount)` - Approve staking contract
- `transfer(to, amount)` - Send tokens
- Handle decimal conversion (8 ↔ 18)

#### Staking (ZoopStaking)

| Feature | Old App | New Contracts |
|---------|---------|---------------|
| Model | Creator-based via API | Pool-based on-chain |
| Lock periods | Backend controlled | Smart contract enforced |
| APR | Unknown/backend | Fixed + pool bonus |
| Auto-compound | Unknown | On-chain support |
| Rewards | API calculated | Contract calculated |

**Mobile App Functions:**
```typescript
// Read Operations
getPool(poolId) → Pool
poolCount() → number
baseAPR() → number
getEffectiveAPR(poolId) → number
getUserStakes(address) → stakeIds[]
getStake(stakeId) → { stake, owner }
pendingRewards(stakeId) → amount
getUserInfo(address) → UserInfo

// Write Operations (require signature)
stake(poolId, amount, autoCompound) → stakeId
unstake(stakeId)
claimRewards(stakeId) → rewards
claimMultiple(stakeIds[]) → totalRewards
compound(stakeId) → compounded
setAutoCompound(stakeId, enabled)
```

**Events to Monitor:**
- `Staked` - User staked tokens
- `Unstaked` - User withdrew
- `RewardsClaimed` - Rewards claimed
- `RewardsCompounded` - Auto-compound triggered
- `PoolCreated` - New pool available
- `BaseAPRUpdated` - APR changed

#### Vesting (ZoopVesting) - NOT IN MVP

> **Note**: Vesting contracts exist in zoop-contracts but are **not included in MVP**. The old app did not have vesting functionality. This can be added in a future release.

#### NFT (ZoopONFTHTS / ZoopONFT)

| Feature | Old App | New Contracts |
|---------|---------|---------------|
| Network | BSC | Hedera (origin) + EVM |
| Standard | ERC-721 | HTS NFT + ONFT721 |
| Minting | Unknown | Owner-only on Hedera |
| Bridging | None | LayerZero ONFT |

**Mobile App Functions:**
```typescript
// Read Operations
balanceOf(owner) → count
ownerOf(tokenId) → address
tokenURI(tokenId) → metadata URL
tokensOfOwner(owner, start, end) → tokenIds[]  // Hedera only
totalSupply() → count

// Write Operations (if user can transfer)
transfer / transferFrom
approve / setApprovalForAll
```

---

## 4. Feature Requirements

### Core Features (MVP) - Matching Old App

#### F1: Authentication & Wallet
- [ ] Email/Social login via Privy
- [ ] Embedded wallet creation (automatic)
- [ ] Wallet address display & copy
- [ ] QR code for receiving
- [ ] Network selector (Hedera/BSC/Ethereum)
- [ ] Logout functionality

#### F2: Dashboard
- [ ] User profile display
- [ ] Staking rewards display (earned + redeemable)
- [ ] ZOOP Points display
- [ ] Claim staking rewards (modal with amount input)
- [ ] Claim ZOOP points (convert to tokens)
- [ ] Stake chart visualization (my stakes vs others)
- [ ] Pull-to-refresh

#### F3: Wallet Screen
- [ ] ZOOP balance per network + total "All accounts"
- [ ] Network account selector (BSC, Hedera, All)
- [ ] Quick actions: Send, Receive, Transfer
- [ ] NFT gallery (horizontal scroll)
- [ ] Transaction history with search
- [ ] Transaction detail bottom sheet

#### F4: Staking (Creator-based → Pool-based)
- [ ] **Creators Tab**: Browse creators/influencers list
- [ ] Search creators by name
- [ ] Filter by category (Music, Tech, Entertainment, etc.)
- [ ] Infinite scroll pagination
- [ ] **Stake to Creator**: Amount input, lock period selection
- [ ] **My Stakes Tab**: View all active stakes
- [ ] Stake detail bottom sheet (amount, lock period, remaining time)
- [ ] Unstake button (only after lock period ends)
- [ ] Lock status badges (Locked/Unlocked/Unstaked)

> **Note**: Old app uses "Creator staking" via backend. New app will use ZoopStaking pools. We may need to map pools to "creators" or simplify to pool-based UI.

#### F5: Send Tokens
- [ ] Network selection bottom sheet
- [ ] Recipient address input
- [ ] QR code scanner for address
- [ ] Amount input with balance validation
- [ ] Transaction confirmation
- [ ] Success/error feedback

#### F6: Receive Tokens
- [ ] Network selection
- [ ] Display wallet address
- [ ] QR code generation
- [ ] Copy address button

#### F7: Cross-Chain Transfer
- [ ] Source network selection
- [ ] Destination network selection
- [ ] Amount input
- [ ] Fee estimation (LayerZero)
- [ ] Transaction confirmation

#### F8: NFT Gallery
- [ ] Display owned NFTs (grid/cards)
- [ ] NFT image + name
- [ ] NFT detail view (metadata)

### Secondary Features (Post-MVP)

#### F9: External Wallet Connection
- [ ] WalletConnect v2 support
- [ ] Use external wallet for signing

#### F10: Push Notifications
- [ ] Stake unlock reminders
- [ ] Reward accumulation alerts

#### F11: Vesting (Future)
- [ ] View vesting pools
- [ ] Claim vested tokens
- [ ] Vesting progress visualization

---

## 5. Architecture Overview

### Clean Architecture Layers

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │                    PRESENTATION                       │   │
│   │                                                       │   │
│   │   Screens (app/)                                      │   │
│   │   Components (components/)                            │   │
│   │   Hooks (presentation/hooks/)                         │   │
│   │                                                       │   │
│   └───────────────────────┬──────────────────────────────┘   │
│                           │                                   │
│   ┌───────────────────────▼──────────────────────────────┐   │
│   │                    APPLICATION                        │   │
│   │                                                       │   │
│   │   Use Cases (application/useCases/)                   │   │
│   │   DTOs (application/dto/)                             │   │
│   │   Mappers (application/mappers/)                      │   │
│   │                                                       │   │
│   └───────────────────────┬──────────────────────────────┘   │
│                           │                                   │
│   ┌───────────────────────▼──────────────────────────────┐   │
│   │                      DOMAIN                           │   │
│   │                                                       │   │
│   │   Entities (domain/entities/)                         │   │
│   │   Value Objects (domain/valueObjects/)                │   │
│   │   Repository Interfaces (domain/repositories/)        │   │
│   │   Domain Services (domain/services/)                  │   │
│   │                                                       │   │
│   └───────────────────────┬──────────────────────────────┘   │
│                           │                                   │
│   ┌───────────────────────▼──────────────────────────────┐   │
│   │                  INFRASTRUCTURE                       │   │
│   │                                                       │   │
│   │   Blockchain (infra/blockchain/)                      │   │
│   │   Repositories (infra/repositories/)                  │   │
│   │   External Services (infra/services/)                 │   │
│   │   Storage (infra/storage/)                            │   │
│   │                                                       │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Dependency Rule

**Dependencies only point inward:**
- Presentation → Application → Domain ← Infrastructure
- Domain knows nothing about outer layers
- Infrastructure implements Domain interfaces

---

## 6. SOLID Implementation Guidelines

### S - Single Responsibility Principle

Each class/module has ONE reason to change.

```typescript
// BAD: Does too much
class WalletManager {
  getBalance() { ... }
  sendTransaction() { ... }
  stake() { ... }
  claimRewards() { ... }
  formatAddress() { ... }
  showNotification() { ... }
}

// GOOD: Separated concerns
class TokenService {
  getBalance(address: Address): Promise<TokenAmount> { ... }
  transfer(to: Address, amount: TokenAmount): Promise<TxHash> { ... }
}

class StakingService {
  stake(poolId: PoolId, amount: TokenAmount): Promise<StakeId> { ... }
  claimRewards(stakeId: StakeId): Promise<TokenAmount> { ... }
}

class AddressFormatter {
  format(address: Address): string { ... }
  truncate(address: Address): string { ... }
}
```

### O - Open/Closed Principle

Open for extension, closed for modification.

```typescript
// Chain-agnostic interface
interface IBlockchainProvider {
  getBalance(address: string): Promise<bigint>;
  sendTransaction(tx: Transaction): Promise<string>;
  readContract<T>(params: ReadParams): Promise<T>;
  writeContract(params: WriteParams): Promise<string>;
}

// Implementations for different chains
class HederaProvider implements IBlockchainProvider { ... }
class EVMProvider implements IBlockchainProvider { ... }

// New chain? Add new implementation, don't modify existing
class SolanaProvider implements IBlockchainProvider { ... }
```

### L - Liskov Substitution Principle

Subtypes must be substitutable for their base types.

```typescript
// Base staking pool behavior
interface IStakingPool {
  stake(amount: TokenAmount): Promise<StakeId>;
  unstake(stakeId: StakeId): Promise<void>;
  getRewards(stakeId: StakeId): Promise<TokenAmount>;
}

// All pool types work the same way from consumer perspective
class FlexiblePool implements IStakingPool { ... }
class LockedPool implements IStakingPool { ... }
class BoostPool implements IStakingPool { ... }

// Consumer doesn't care which pool type
function claimFromPool(pool: IStakingPool, stakeId: StakeId) {
  return pool.getRewards(stakeId);
}
```

### I - Interface Segregation Principle

Clients shouldn't depend on interfaces they don't use.

```typescript
// BAD: Fat interface
interface IWallet {
  getAddress(): string;
  getBalance(): Promise<bigint>;
  signMessage(msg: string): Promise<string>;
  signTransaction(tx: Transaction): Promise<string>;
  stake(amount: bigint): Promise<void>;
  claim(): Promise<void>;
  bridgeTokens(): Promise<void>;
  mintNFT(): Promise<void>;
}

// GOOD: Segregated interfaces
interface IWalletIdentity {
  getAddress(): Address;
}

interface IWalletSigner {
  signMessage(message: string): Promise<Signature>;
  signTypedData(data: TypedData): Promise<Signature>;
}

interface ITokenHolder {
  getBalance(token: TokenAddress): Promise<TokenAmount>;
}

// Components only depend on what they need
class SendTokenScreen {
  constructor(
    private identity: IWalletIdentity,
    private signer: IWalletSigner,
    private holder: ITokenHolder
  ) {}
}
```

### D - Dependency Inversion Principle

Depend on abstractions, not concretions.

```typescript
// Domain layer defines interfaces
// domain/repositories/IStakingRepository.ts
interface IStakingRepository {
  getPools(): Promise<StakingPool[]>;
  getUserStakes(address: Address): Promise<Stake[]>;
  stake(poolId: PoolId, amount: TokenAmount): Promise<StakeId>;
}

// Infrastructure implements interfaces
// infra/repositories/StakingRepository.ts
class StakingRepository implements IStakingRepository {
  constructor(private provider: IBlockchainProvider) {}

  async getPools(): Promise<StakingPool[]> {
    // Implementation using viem
  }
}

// Application layer uses interfaces (injected)
// application/useCases/StakeTokensUseCase.ts
class StakeTokensUseCase {
  constructor(
    private stakingRepo: IStakingRepository,  // Abstraction, not concrete
    private tokenRepo: ITokenRepository
  ) {}

  async execute(params: StakeParams): Promise<StakeResult> {
    // Business logic using repositories
  }
}
```

---

## 7. Layer Architecture

### Domain Layer (Core)

**Pure TypeScript, no external dependencies.**

```
domain/
├── entities/
│   ├── User.ts
│   ├── StakingPool.ts
│   ├── Stake.ts
│   ├── Creator.ts
│   ├── Reward.ts
│   ├── Token.ts
│   ├── NFT.ts
│   └── Transaction.ts
├── valueObjects/
│   ├── Address.ts
│   ├── TokenAmount.ts
│   ├── ChainId.ts
│   ├── PoolId.ts
│   ├── StakeId.ts
│   └── Percentage.ts
├── repositories/
│   ├── ITokenRepository.ts
│   ├── IStakingRepository.ts
│   ├── ICreatorRepository.ts
│   ├── IRewardRepository.ts
│   └── INFTRepository.ts
├── services/
│   ├── RewardCalculator.ts
│   └── DecimalConverter.ts
└── errors/
    ├── DomainError.ts
    ├── InsufficientBalanceError.ts
    └── StakeLockedError.ts
```

**Example Entity:**

```typescript
// domain/entities/Stake.ts
export class Stake {
  constructor(
    public readonly id: StakeId,
    public readonly poolId: PoolId,
    public readonly amount: TokenAmount,
    public readonly startTime: Date,
    public readonly lockEndTime: Date,
    public readonly autoCompound: boolean,
    public readonly lastClaimTime: Date
  ) {}

  get isLocked(): boolean {
    return new Date() < this.lockEndTime;
  }

  get lockRemainingSeconds(): number {
    const now = new Date();
    if (now >= this.lockEndTime) return 0;
    return Math.floor((this.lockEndTime.getTime() - now.getTime()) / 1000);
  }

  canUnstake(): boolean {
    return !this.isLocked;
  }
}
```

**Example Value Object:**

```typescript
// domain/valueObjects/TokenAmount.ts
export class TokenAmount {
  private constructor(
    private readonly rawValue: bigint,
    private readonly decimals: number
  ) {}

  static fromRaw(value: bigint, decimals: number): TokenAmount {
    return new TokenAmount(value, decimals);
  }

  static fromHuman(value: string, decimals: number): TokenAmount {
    const multiplier = BigInt(10 ** decimals);
    const [whole, fraction = ''] = value.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    const raw = BigInt(whole) * multiplier + BigInt(paddedFraction);
    return new TokenAmount(raw, decimals);
  }

  toRaw(): bigint {
    return this.rawValue;
  }

  toHuman(): string {
    const str = this.rawValue.toString().padStart(this.decimals + 1, '0');
    const whole = str.slice(0, -this.decimals) || '0';
    const fraction = str.slice(-this.decimals).replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole;
  }

  add(other: TokenAmount): TokenAmount {
    if (this.decimals !== other.decimals) {
      throw new Error('Cannot add amounts with different decimals');
    }
    return new TokenAmount(this.rawValue + other.rawValue, this.decimals);
  }

  isGreaterThan(other: TokenAmount): boolean {
    return this.rawValue > other.rawValue;
  }
}
```

### Application Layer

**Use cases orchestrate domain logic.**

```
application/
├── useCases/
│   ├── auth/
│   │   ├── LoginUseCase.ts
│   │   └── LogoutUseCase.ts
│   ├── token/
│   │   ├── GetBalanceUseCase.ts
│   │   ├── GetBalanceAllChainsUseCase.ts
│   │   ├── TransferTokensUseCase.ts
│   │   ├── CrossChainTransferUseCase.ts
│   │   └── ApproveSpendingUseCase.ts
│   ├── staking/
│   │   ├── GetPoolsUseCase.ts
│   │   ├── GetUserStakesUseCase.ts
│   │   ├── StakeTokensUseCase.ts
│   │   ├── UnstakeTokensUseCase.ts
│   │   └── ClaimRewardsUseCase.ts
│   ├── creator/
│   │   ├── GetCreatorsUseCase.ts
│   │   ├── SearchCreatorsUseCase.ts
│   │   └── GetCreatorDetailsUseCase.ts
│   ├── reward/
│   │   ├── GetRewardsUseCase.ts
│   │   ├── ClaimStakingRewardsUseCase.ts
│   │   └── ClaimPointsUseCase.ts
│   ├── nft/
│   │   ├── GetUserNFTsUseCase.ts
│   │   └── GetNFTDetailsUseCase.ts
│   └── transaction/
│       └── GetTransactionHistoryUseCase.ts
├── dto/
│   ├── StakeDTO.ts
│   ├── PoolDTO.ts
│   ├── CreatorDTO.ts
│   ├── RewardDTO.ts
│   └── TransactionDTO.ts
├── mappers/
│   ├── StakeMapper.ts
│   ├── PoolMapper.ts
│   ├── CreatorMapper.ts
│   └── TransactionMapper.ts
└── ports/
    ├── IWalletPort.ts
    ├── INotificationPort.ts
    └── IAnalyticsPort.ts
```

**Example Use Case:**

```typescript
// application/useCases/staking/StakeTokensUseCase.ts
export interface StakeTokensParams {
  poolId: string;
  amount: string;
  autoCompound: boolean;
}

export interface StakeTokensResult {
  stakeId: string;
  transactionHash: string;
  lockEndTime: Date;
}

export class StakeTokensUseCase {
  constructor(
    private readonly stakingRepo: IStakingRepository,
    private readonly tokenRepo: ITokenRepository,
    private readonly walletPort: IWalletPort
  ) {}

  async execute(params: StakeTokensParams): Promise<StakeTokensResult> {
    // 1. Validate pool exists and is active
    const pool = await this.stakingRepo.getPool(PoolId.from(params.poolId));
    if (!pool.isActive) {
      throw new PoolNotActiveError(params.poolId);
    }

    // 2. Parse and validate amount
    const amount = TokenAmount.fromHuman(params.amount, 8); // ZOOP decimals
    if (amount.toRaw() <= 0n) {
      throw new InvalidAmountError('Amount must be greater than 0');
    }

    // 3. Check user balance
    const address = await this.walletPort.getAddress();
    const balance = await this.tokenRepo.getBalance(address);
    if (balance.isLessThan(amount)) {
      throw new InsufficientBalanceError(balance, amount);
    }

    // 4. Check/request approval
    const stakingContract = this.stakingRepo.getContractAddress();
    const allowance = await this.tokenRepo.getAllowance(address, stakingContract);
    if (allowance.isLessThan(amount)) {
      await this.tokenRepo.approve(stakingContract, amount);
    }

    // 5. Execute stake
    const result = await this.stakingRepo.stake(
      pool.id,
      amount,
      params.autoCompound
    );

    return {
      stakeId: result.stakeId.toString(),
      transactionHash: result.txHash,
      lockEndTime: result.lockEndTime
    };
  }
}
```

### Infrastructure Layer

**Implements interfaces with concrete technologies.**

```
infra/
├── blockchain/
│   ├── providers/
│   │   ├── HederaProvider.ts
│   │   └── EVMProvider.ts
│   ├── contracts/
│   │   ├── ZoopTokenContract.ts
│   │   ├── ZoopStakingContract.ts
│   │   └── ZoopNFTContract.ts
│   └── abis/
│       ├── ZoopOFT.json
│       ├── ZoopStaking.json
│       └── ZoopONFT.json
├── repositories/
│   ├── TokenRepository.ts
│   ├── StakingRepository.ts
│   ├── CreatorRepository.ts
│   ├── RewardRepository.ts
│   ├── TransactionRepository.ts
│   └── NFTRepository.ts
├── services/
│   ├── PrivyWalletService.ts
│   ├── WalletConnectService.ts
│   └── ApiService.ts
├── storage/
│   ├── SecureStorage.ts
│   └── AsyncStorage.ts
└── config/
    ├── chains.ts
    └── contracts.ts
```

**Example Repository:**

```typescript
// infra/repositories/StakingRepository.ts
export class StakingRepository implements IStakingRepository {
  constructor(
    private readonly provider: IBlockchainProvider,
    private readonly contractConfig: StakingContractConfig
  ) {}

  async getPools(): Promise<StakingPool[]> {
    const count = await this.provider.readContract<bigint>({
      address: this.contractConfig.address,
      abi: ZoopStakingABI,
      functionName: 'poolCount'
    });

    const pools: StakingPool[] = [];
    for (let i = 0; i < count; i++) {
      const poolData = await this.provider.readContract<PoolStruct>({
        address: this.contractConfig.address,
        abi: ZoopStakingABI,
        functionName: 'getPool',
        args: [BigInt(i)]
      });

      pools.push(this.mapPoolData(i, poolData));
    }

    return pools;
  }

  async stake(
    poolId: PoolId,
    amount: TokenAmount,
    autoCompound: boolean
  ): Promise<StakeResult> {
    const txHash = await this.provider.writeContract({
      address: this.contractConfig.address,
      abi: ZoopStakingABI,
      functionName: 'stake',
      args: [poolId.toBigInt(), amount.toRaw(), autoCompound]
    });

    // Wait for transaction and extract stakeId from events
    const receipt = await this.provider.waitForTransaction(txHash);
    const stakeId = this.extractStakeIdFromReceipt(receipt);

    return {
      stakeId,
      txHash,
      lockEndTime: this.calculateLockEndTime(poolId)
    };
  }

  private mapPoolData(id: number, data: PoolStruct): StakingPool {
    return new StakingPool(
      PoolId.from(id),
      data.name,
      data.lockDuration,
      Percentage.fromBasisPoints(Number(data.bonusMultiplier)),
      TokenAmount.fromRaw(data.totalStaked, 8),
      data.active
    );
  }
}
```

### Presentation Layer

**React Native screens and components.**

```
app/                          # Expo Router screens
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx            # Dashboard (home)
│   ├── staking.tsx          # Staking (creators + my stakes)
│   └── wallet.tsx           # Wallet/balance + NFTs + history
├── stake/
│   └── [creatorId].tsx      # Stake to specific creator
├── send.tsx
├── receive.tsx
├── transfer.tsx             # Cross-chain transfer
├── login.tsx
└── _layout.tsx

components/
├── common/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── BottomSheet.tsx
│   ├── Modal.tsx
│   ├── Loading.tsx
│   ├── SkeletonLoader.tsx
│   └── GradientText.tsx
├── dashboard/
│   ├── Profile.tsx
│   ├── RewardCard.tsx
│   ├── StakeChart.tsx
│   └── ClaimModal.tsx
├── wallet/
│   ├── BalanceCard.tsx
│   ├── AccountSelector.tsx
│   ├── TransactionCard.tsx
│   └── TransactionDetail.tsx
├── staking/
│   ├── CreatorCard.tsx
│   ├── CreatorGrid.tsx
│   ├── StakeCard.tsx
│   ├── StakeDetail.tsx
│   ├── CategoryFilter.tsx
│   └── LockBadge.tsx
└── nft/
    ├── NFTCard.tsx
    └── NFTGallery.tsx

presentation/
├── hooks/
│   ├── useAuth.ts
│   ├── useBalance.ts
│   ├── useRewards.ts
│   ├── useCreators.ts
│   ├── useMyStakes.ts
│   ├── useNFTs.ts
│   └── useTransactionHistory.ts
├── viewModels/
│   ├── DashboardViewModel.ts
│   ├── WalletViewModel.ts
│   └── StakingViewModel.ts
└── providers/
    ├── AuthProvider.tsx
    ├── WalletProvider.tsx
    ├── ToastProvider.tsx
    └── QueryProvider.tsx
```

---

## 8. Module Structure

### Dependency Injection Setup

```typescript
// di/container.ts
import { Container } from 'inversify';

const container = new Container();

// Providers
container.bind<IBlockchainProvider>('HederaProvider')
  .to(HederaProvider).inSingletonScope();
container.bind<IBlockchainProvider>('EVMProvider')
  .to(EVMProvider).inSingletonScope();

// Repositories
container.bind<ITokenRepository>('TokenRepository')
  .to(TokenRepository).inSingletonScope();
container.bind<IStakingRepository>('StakingRepository')
  .to(StakingRepository).inSingletonScope();
container.bind<IVestingRepository>('VestingRepository')
  .to(VestingRepository).inSingletonScope();

// Use Cases
container.bind<StakeTokensUseCase>('StakeTokensUseCase')
  .to(StakeTokensUseCase);
container.bind<ClaimRewardsUseCase>('ClaimRewardsUseCase')
  .to(ClaimRewardsUseCase);

export { container };
```

### Hook Pattern for UI

```typescript
// presentation/hooks/useStakingPools.ts
export function useStakingPools() {
  const getPoolsUseCase = useInjection<GetPoolsUseCase>('GetPoolsUseCase');

  return useQuery({
    queryKey: ['staking', 'pools'],
    queryFn: () => getPoolsUseCase.execute(),
    staleTime: 30_000,  // 30 seconds
    refetchInterval: 60_000  // 1 minute
  });
}

// presentation/hooks/useStake.ts
export function useStake() {
  const stakeUseCase = useInjection<StakeTokensUseCase>('StakeTokensUseCase');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: StakeTokensParams) => stakeUseCase.execute(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staking'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    }
  });
}
```

---

## 9. State Management Strategy

### Global State (Zustand)

For app-wide state that doesn't come from server:

```typescript
// stores/walletStore.ts
interface WalletState {
  address: string | null;
  chainId: number;
  isConnected: boolean;

  // Actions
  setAddress: (address: string) => void;
  setChainId: (chainId: number) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  chainId: 296,  // Hedera testnet
  isConnected: false,

  setAddress: (address) => set({ address, isConnected: true }),
  setChainId: (chainId) => set({ chainId }),
  disconnect: () => set({ address: null, isConnected: false })
}));
```

### Server State (TanStack Query)

For data that comes from blockchain/API:

```typescript
// All blockchain reads use TanStack Query
// - Automatic caching
// - Background refetching
// - Stale-while-revalidate
// - Error handling
// - Loading states

const { data: pools, isLoading, error } = useStakingPools();
const { data: stakes } = useUserStakes(address);
const { data: balance } = useBalance(address);
```

### Form State (React Hook Form + Zod)

```typescript
// Stake form validation
const stakeSchema = z.object({
  poolId: z.string().min(1, 'Select a pool'),
  amount: z.string()
    .refine(val => parseFloat(val) > 0, 'Amount must be positive')
    .refine(val => parseFloat(val) <= maxBalance, 'Insufficient balance'),
  autoCompound: z.boolean()
});

type StakeFormData = z.infer<typeof stakeSchema>;
```

---

## 10. Security Considerations

> **CRITICAL**: The old mobile app had **7 Critical/High security vulnerabilities**. We MUST NOT repeat these mistakes.

### Security Failures from Old App (DO NOT REPEAT)

| Vulnerability | Old App Issue | New App Solution |
|---------------|---------------|------------------|
| **API Keys Exposed** | Keys in Expo config, extractable from APK | Use token-based auth, never embed secrets |
| **Insecure Token Storage** | `AsyncStorage` (unencrypted) for tokens | **Always use `expo-secure-store`** |
| **No Certificate Pinning** | MITM attack vulnerable | Implement certificate pinning |
| **Missing Input Validation** | No regex, no limits, no rate limiting | Domain-level validation with limits |
| **Infinite Loop Bug** | Token refresh could loop forever | Max retry with exponential backoff |

### Mandatory Security Checklist

#### S1: Secure Storage (CRITICAL)
```typescript
// WRONG - Old app mistake
await AsyncStorage.setItem("zoop_web2_access_token", token); // UNENCRYPTED!

// CORRECT - Use SecureStore EVERYWHERE
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync("access_token", token);
await SecureStore.setItemAsync("refresh_token", refreshToken);
```

**Rule**: NEVER use AsyncStorage for tokens, keys, or sensitive data.

#### S2: No Secrets in Code
```typescript
// WRONG - Old app had this
headers: {
  "app-api-key": Constants.expoConfig?.extra?.web2ApiKey, // Extractable!
}

// CORRECT - Token-based auth only
headers: {
  "Authorization": `Bearer ${await SecureStore.getItemAsync('access_token')}`
}
```

**Rule**: NO API keys, secrets, or credentials in source code or Expo config.

#### S3: Certificate Pinning
```typescript
// Implement SSL pinning for API calls
import { fetch } from 'react-native-ssl-pinning';

const response = await fetch(url, {
  method: 'POST',
  sslPinning: {
    certs: ['api_certificate'] // Bundle certificate hash
  }
});
```

#### S4: Input Validation (Domain Layer)
```typescript
// domain/valueObjects/Address.ts
export class Address {
  private constructor(private readonly value: string) {}

  static from(input: string): Address {
    // 1. Format validation
    if (!input.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new InvalidAddressError('Invalid address format');
    }
    // 2. Checksum validation
    if (!isAddress(input)) {
      throw new InvalidAddressError('Invalid checksum');
    }
    // 3. Not zero address
    if (input === '0x0000000000000000000000000000000000000000') {
      throw new InvalidAddressError('Cannot use zero address');
    }
    return new Address(getAddress(input));
  }
}

// domain/valueObjects/TokenAmount.ts
export class TokenAmount {
  static fromHuman(value: string, decimals: number): TokenAmount {
    // 1. Format validation
    if (!value || value.trim() === '') {
      throw new InvalidAmountError('Amount required');
    }
    // 2. Numeric validation
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new InvalidAmountError('Invalid number');
    }
    // 3. Positive validation
    if (num <= 0) {
      throw new InvalidAmountError('Amount must be positive');
    }
    // 4. Max limit (prevent fat-finger errors)
    if (num > MAX_TRANSACTION_AMOUNT) {
      throw new InvalidAmountError('Amount exceeds maximum');
    }
    // 5. Decimal precision
    const parts = value.split('.');
    if (parts[1] && parts[1].length > decimals) {
      throw new InvalidAmountError(`Max ${decimals} decimal places`);
    }
    return new TokenAmount(/* ... */);
  }
}
```

#### S5: Transaction Safety
```typescript
// presentation/hooks/useTransactionGuard.ts
export function useTransactionGuard() {
  const lastTxTime = useRef<number>(0);
  const MIN_TX_INTERVAL = 5000; // 5 seconds between transactions

  const canSubmit = (): boolean => {
    const now = Date.now();
    if (now - lastTxTime.current < MIN_TX_INTERVAL) {
      return false; // Rate limited
    }
    lastTxTime.current = now;
    return true;
  };

  return { canSubmit };
}

// Always show confirmation with details
const confirmTransaction = async (tx: Transaction) => {
  // 1. Show human-readable details
  // 2. Display recipient (with address book lookup)
  // 3. Show amount in both token and USD
  // 4. Estimate gas/fees
  // 5. Require explicit confirmation
  // 6. Optional: require biometric for large amounts
};
```

#### S6: Token Refresh with Limits
```typescript
// WRONG - Old app could loop forever
while (true) {
  const token = await getIdentityToken();
  if (!token) {
    await delay(1000);
    continue; // INFINITE LOOP RISK!
  }
}

// CORRECT - Max retries with exponential backoff
const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  const token = await getIdentityToken();
  if (token) return token;

  const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), 30000);
  await sleep(delay);
}
throw new AuthError('Token refresh failed after max retries');
```

### Wallet Security

- **Privy handles key management** - Keys never exposed to app
- **Secure storage** for ALL tokens via `expo-secure-store`
- **No plaintext storage** of sensitive data
- **Biometric unlock** option for large transactions
- **Session timeout** after inactivity

### Transaction Security

- **All transactions require explicit user confirmation**
- **Display human-readable transaction details** before signing
- **Rate limiting** (min 5 seconds between transactions)
- **Max transaction limits** (configurable per user)
- **Address whitelist** option for frequent recipients

### Network Security

- **HTTPS only** for all API calls
- **Certificate pinning** for API endpoints (REQUIRED)
- **Validate chain IDs** before transactions
- **Request signing** for sensitive operations

### Code Quality Standards

To avoid old app issues:

| Standard | Old App | New App Requirement |
|----------|---------|---------------------|
| Test Coverage | <1% | **>80%** |
| Typos in Code | 17+ instances | **Zero tolerance** - lint rules |
| Commented Code | 100+ lines | **None** - use git history |
| `any` Type Usage | 50+ instances | **Banned** - use proper types |
| Component Size | 1,350+ lines | **<300 lines** per component |
| Code Review | None evident | **Required** for all PRs |

---

## 11. Testing Strategy

### Test Pyramid

```
        /\
       /  \     E2E Tests (Detox)
      /----\    - Critical user flows
     /      \   - Stake/Unstake flow
    /--------\  - Login flow
   /          \
  / Integration \ Integration Tests
 /   Tests      \ - Repository + Provider
/----------------\ - Use Case + Repository
        |
        |         Unit Tests (Jest)
        |         - Domain entities
        |         - Value objects
        |         - Use cases (mocked deps)
        |         - Formatters/Calculators
```

### Unit Test Example

```typescript
// domain/entities/Stake.test.ts
describe('Stake', () => {
  describe('isLocked', () => {
    it('returns true when lock end time is in future', () => {
      const stake = new Stake(
        StakeId.from(1),
        PoolId.from(0),
        TokenAmount.fromHuman('100', 8),
        new Date('2024-01-01'),
        new Date('2024-12-31'),  // Future
        false,
        new Date('2024-01-01')
      );

      expect(stake.isLocked).toBe(true);
    });

    it('returns false when lock end time has passed', () => {
      const stake = new Stake(
        StakeId.from(1),
        PoolId.from(0),
        TokenAmount.fromHuman('100', 8),
        new Date('2023-01-01'),
        new Date('2023-06-01'),  // Past
        false,
        new Date('2023-01-01')
      );

      expect(stake.isLocked).toBe(false);
    });
  });
});
```

### Integration Test Example

```typescript
// infra/repositories/StakingRepository.test.ts
describe('StakingRepository', () => {
  let repo: StakingRepository;
  let mockProvider: MockBlockchainProvider;

  beforeEach(() => {
    mockProvider = new MockBlockchainProvider();
    repo = new StakingRepository(mockProvider, testConfig);
  });

  describe('getPools', () => {
    it('fetches and maps all pools correctly', async () => {
      mockProvider.setReadContractResponse('poolCount', 2n);
      mockProvider.setReadContractResponse('getPool', [
        mockPoolData(0),
        mockPoolData(1)
      ]);

      const pools = await repo.getPools();

      expect(pools).toHaveLength(2);
      expect(pools[0].name).toBe('30 Day Lock');
    });
  });
});
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Project setup and core infrastructure

- [ ] Initialize Expo project with TypeScript
- [ ] Set up development build (not Expo Go)
- [ ] Configure Privy SDK
- [ ] Set up Viem with Hedera + EVM providers
- [ ] Implement domain layer (entities, value objects)
- [ ] Create repository interfaces
- [ ] Set up Zustand stores
- [ ] Configure TanStack Query

**Deliverable**: App shell with Privy login working

### Phase 2: Dashboard & Wallet (Week 3-4)

**Goal**: Dashboard and basic wallet functionality

- [ ] Token repository implementation
- [ ] Balance fetching per chain + total
- [ ] Dashboard screen with profile
- [ ] Rewards display (staking + points)
- [ ] Claim rewards modal
- [ ] Claim points modal
- [ ] Stake chart component
- [ ] Wallet screen with account selector

**Deliverable**: Dashboard + wallet balance display

### Phase 3: Send/Receive/Transfer (Week 5-6)

**Goal**: Token transfer functionality

- [ ] Send tokens screen
- [ ] QR code scanner
- [ ] Receive screen with QR generation
- [ ] Cross-chain transfer screen
- [ ] Transaction confirmation flow
- [ ] Transaction history display
- [ ] Transaction detail bottom sheet

**Deliverable**: Full token transfer capabilities

### Phase 4: Staking (Week 7-9)

**Goal**: Full staking functionality (creator-based UI)

- [ ] Creator repository (API integration)
- [ ] Creators listing with infinite scroll
- [ ] Creator search
- [ ] Category filter modal
- [ ] Stake to creator screen
- [ ] My stakes tab
- [ ] Stake detail bottom sheet
- [ ] Unstake functionality
- [ ] Lock period tracking + badges

**Deliverable**: Complete staking feature

### Phase 5: NFT & Polish (Week 10-11)

**Goal**: NFT gallery and UX improvements

- [ ] NFT repository implementation
- [ ] NFT gallery (horizontal scroll in wallet)
- [ ] NFT detail view
- [ ] Loading states and skeletons
- [ ] Error handling UX
- [ ] Pull-to-refresh everywhere
- [ ] Toast notifications
- [ ] Animations and transitions

**Deliverable**: NFT feature + polished UX

### Phase 6: Testing & Launch Prep (Week 12)

**Goal**: Quality assurance

- [ ] Unit test coverage >80%
- [ ] Integration tests for repositories
- [ ] E2E tests for critical flows
- [ ] Performance optimization
- [ ] Security review
- [ ] Beta testing (TestFlight / Internal Testing)

**Deliverable**: Production-ready app

---

## Appendix A: Contract Addresses (To Be Configured)

```typescript
// infra/config/contracts.ts
export const CONTRACTS = {
  hedera: {
    testnet: {
      token: '0x...',
      staking: '0x...',
      vesting: '0x...',
      nft: '0x...'
    },
    mainnet: {
      token: '0x...',
      staking: '0x...',
      vesting: '0x...',
      nft: '0x...'
    }
  },
  bsc: {
    testnet: {
      token: '0x...',
      staking: '0x...'
    }
  }
};
```

## Appendix B: Environment Variables

```env
# .env.development
PRIVY_APP_ID=xxx
PRIVY_CLIENT_ID=xxx
HEDERA_NETWORK=testnet
API_BASE_URL=https://api.dev.zoop.com
```

## Appendix C: Figma Integration

**Awaiting Figma designs from user.**

When provided:
1. Export design tokens (colors, spacing, typography)
2. Generate component library from designs
3. Map screens to navigation structure
4. Document any design system patterns
5. Ensure consistency with old app DA (Design Assets)

---

## Appendix D: Decision - Staking Model

### Old App: Creator-Based Staking
- Users stake to specific "creators" (influencers)
- Backend manages creator list via API
- Staking rewards calculated by backend

### New Contracts: Pool-Based Staking
- Users stake to pools with fixed lock periods
- Rewards calculated on-chain
- No "creator" concept in contracts

### Recommended Approach
**Option A**: Keep creator UI, map creators to pools
- Each creator corresponds to a staking pool
- Backend maintains creator ↔ pool mapping
- Preserves familiar UX from old app

**Option B**: Simplify to pool-based UI
- Show pools directly (30-day, 90-day, etc.)
- Remove creator browsing
- Cleaner, more transparent

**Decision**: TBD - discuss with user

---

## 13. Hedera Transaction Infrastructure

### Overview

Hedera has unique constraints that require careful backend architecture:

- **No mempool**: Transactions exceeding network capacity (~15M gas/sec) are immediately rejected
- **Account creation cost**: ~230,000 gas per account (~65 accounts/sec max throughput)
- **Deterministic finality**: 3-5 seconds, but no queuing mechanism

This section documents the infrastructure needed to handle these constraints at scale.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HEDERA TRANSACTION INFRASTRUCTURE                      │
│                                                                               │
│   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│   │   Mobile App    │────▶│   Backend API   │────▶│   Redis Queue   │       │
│   │   (User)        │     │   (Express)     │     │   (BullMQ)      │       │
│   └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                            │                 │
│                                                            ▼                 │
│   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│   │   PostgreSQL    │◀────│  Queue Worker   │────▶│   Hedera Node   │       │
│   │   (State DB)    │     │  (Rate Limited) │     │   (Hashio/etc)  │       │
│   └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                               │
│   Rate Limits:                                                               │
│   - Account Creation: 50-60/sec (safety margin from 65/sec limit)           │
│   - Token Transfers: Batched, ~100-200/sec depending on complexity          │
│   - Withdrawals: Prioritized queue with user-level rate limits              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### User Account Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER ACCOUNT LIFECYCLE                              │
│                                                                               │
│   1. SIGNUP                                                                  │
│   ┌─────────────────┐                                                        │
│   │ User signs up   │──▶ Privy creates EOA (instant)                        │
│   │ via Privy       │──▶ Backend queues Hedera account creation             │
│   └─────────────────┘──▶ User gets "account pending" status                 │
│                                                                               │
│   2. PENDING STATE (0-60 seconds typical, up to minutes during surge)       │
│   ┌─────────────────┐                                                        │
│   │ User Balance:   │    On-chain: 0 (no account yet)                       │
│   │ 1000 ZOOP       │    Off-chain ledger: 1000 ZOOP (Treasury holds)       │
│   └─────────────────┘    Status: "Setting up your wallet..."                │
│                                                                               │
│   3. ACCOUNT CREATED                                                         │
│   ┌─────────────────┐                                                        │
│   │ Queue worker    │──▶ Creates Hedera account                             │
│   │ processes       │──▶ Deploys Safe wallet (optional)                     │
│   └─────────────────┘──▶ Transfers pending balance from Treasury            │
│                                                                               │
│   4. ACTIVE STATE                                                            │
│   ┌─────────────────┐                                                        │
│   │ User has full   │    On-chain: 1000 ZOOP                                │
│   │ Hedera account  │    Can send, stake, bridge independently              │
│   └─────────────────┘    Gas: Meta-tx (backend pays) or self-pay            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Queue System Design

#### Job Types

```typescript
// Queue job types
enum JobType {
  ACCOUNT_CREATION = 'account_creation',
  SAFE_DEPLOYMENT = 'safe_deployment',
  TOKEN_TRANSFER = 'token_transfer',
  BATCH_TRANSFER = 'batch_transfer',
  WITHDRAWAL = 'withdrawal',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM_REWARDS = 'claim_rewards'
}

// Priority levels (lower = higher priority)
enum Priority {
  CRITICAL = 1,    // Unstake (time-sensitive after unlock)
  HIGH = 2,        // Withdrawals, claims
  NORMAL = 3,      // Stakes, transfers
  LOW = 4,         // Account creation (can wait)
  BACKGROUND = 5   // Batch operations, cleanup
}
```

#### Queue Configuration

```typescript
// BullMQ queue configuration
const queueConfig = {
  // Rate limiting per job type
  rateLimits: {
    account_creation: { max: 50, duration: 1000 },  // 50/sec
    token_transfer: { max: 100, duration: 1000 },   // 100/sec
    batch_transfer: { max: 10, duration: 1000 },    // 10 batches/sec
    withdrawal: { max: 50, duration: 1000 },        // 50/sec
  },

  // Retry configuration
  retry: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,      // Start at 1 sec
      maxDelay: 60000   // Max 1 minute
    }
  },

  // Dead letter queue for failed jobs
  deadLetterQueue: 'failed_transactions'
};
```

### Handling Mass Withdrawals (1000+ Concurrent Users)

#### Scenario: 1000 Users Request Withdrawal Simultaneously

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MASS WITHDRAWAL HANDLING                                  │
│                                                                               │
│   Input: 1000 withdrawal requests arrive within 1 minute                    │
│                                                                               │
│   Step 1: INTAKE (immediate)                                                │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ - Validate each request (balance, not already pending)           │       │
│   │ - Add to Redis queue with priority HIGH                          │       │
│   │ - Update DB: withdrawal_status = 'queued'                        │       │
│   │ - Return to user: "Withdrawal queued, position: X/1000"          │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                               │
│   Step 2: BATCH PROCESSING (queue worker)                                   │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ - Group withdrawals into batches of 20                           │       │
│   │ - Each batch = single multi-transfer transaction                 │       │
│   │ - Process rate: ~3-5 batches/sec = 60-100 withdrawals/sec       │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                               │
│   Step 3: EXECUTION (per batch)                                             │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ - Construct batch transfer tx (Treasury → 20 users)             │       │
│   │ - Submit to Hedera                                               │       │
│   │ - Wait for confirmation (3-5 sec)                                │       │
│   │ - Update DB for all 20 users: withdrawal_status = 'completed'   │       │
│   │ - Push notification to users                                     │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                               │
│   Timeline:                                                                  │
│   - 1000 withdrawals ÷ 20 per batch = 50 batches                            │
│   - 50 batches × 5 sec per batch = ~4-5 minutes total                       │
│   - User sees: "Processing... estimated 2-5 minutes"                        │
│                                                                               │
│   Failure Handling:                                                          │
│   - If batch fails: Retry with exponential backoff                          │
│   - If user in failed batch: Individual retry, then manual review           │
│   - Dead letter queue for persistent failures → admin dashboard             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Off-Chain Ledger (Hybrid Model)

For users without Hedera accounts yet, or during high load:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OFF-CHAIN LEDGER MODEL                               │
│                                                                               │
│   PostgreSQL Schema:                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ users                                                            │       │
│   │ ├── id                                                           │       │
│   │ ├── privy_eoa_address        (always exists)                    │       │
│   │ ├── hedera_account_id        (null until created)               │       │
│   │ ├── safe_wallet_address      (null until deployed)              │       │
│   │ ├── account_status           (pending|creating|active|failed)   │       │
│   │ └── created_at                                                   │       │
│   │                                                                  │       │
│   │ balances                                                         │       │
│   │ ├── user_id                                                      │       │
│   │ ├── token_address                                                │       │
│   │ ├── on_chain_balance         (last known from blockchain)       │       │
│   │ ├── pending_in               (incoming, not yet confirmed)      │       │
│   │ ├── pending_out              (outgoing, not yet confirmed)      │       │
│   │ └── available_balance        (computed: on_chain + in - out)    │       │
│   │                                                                  │       │
│   │ transactions                                                     │       │
│   │ ├── id                                                           │       │
│   │ ├── user_id                                                      │       │
│   │ ├── type                     (deposit|withdrawal|transfer|...)  │       │
│   │ ├── amount                                                       │       │
│   │ ├── status                   (pending|queued|processing|done)   │       │
│   │ ├── hedera_tx_id             (null until submitted)             │       │
│   │ ├── queue_position           (for user visibility)              │       │
│   │ └── timestamps                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                               │
│   Balance Calculation:                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ If user.hedera_account_id IS NULL:                               │       │
│   │   → Show off-chain ledger balance (Treasury holds actual tokens)│       │
│   │   → All operations go through backend                            │       │
│   │                                                                  │       │
│   │ If user.hedera_account_id EXISTS:                                │       │
│   │   → Show on-chain balance (read from Hedera directly)           │       │
│   │   → User can operate independently OR via backend               │       │
│   └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Gas Payment Strategy

#### Phase 1: Launch (Months 1-3) - Subsidized

```typescript
// Backend pays all gas, no user fees
const processTransaction = async (tx: Transaction) => {
  // Backend wallet (funded with HBAR) submits all transactions
  const result = await hederaClient.submitTransaction(tx);

  // No fee deducted from user
  // Zoop absorbs gas costs as customer acquisition cost
  return result;
};

// Budget: Estimate ~$X/month based on expected transaction volume
// Cap: Optional per-user daily transaction limit to prevent abuse
```

#### Phase 2: Flat Fee (Months 3-6)

```typescript
// Introduce small flat fee in ZOOP
const WITHDRAWAL_FEE_ZOOP = parseUnits('0.5', 8); // 0.5 ZOOP

const processWithdrawal = async (userId: string, amount: bigint) => {
  const netAmount = amount - WITHDRAWAL_FEE_ZOOP;

  // Fee goes to Zoop operations wallet
  await transferFromTreasury(userId, netAmount);
  await transferToOperations(WITHDRAWAL_FEE_ZOOP);
};

// Adjustment: Review monthly, adjust fee based on HBAR price trends
```

#### Phase 3: Dynamic Fee (Post-Listing)

```typescript
// Once ZOOP is listed on DEX (SaucerSwap)
const calculateGasFee = async (estimatedGas: bigint): Promise<bigint> => {
  // Get HBAR cost
  const hbarCost = estimatedGas * await getHbarGasPrice();

  // Get ZOOP/HBAR price from DEX TWAP
  const zoopPerHbar = await getSaucerSwapTWAP('ZOOP', 'HBAR', 1800); // 30min TWAP

  // Convert to ZOOP with 10% buffer
  const zoopCost = (hbarCost * zoopPerHbar * 110n) / 100n;

  return zoopCost;
};
```

### Meta-Transaction Flow

Users sign intent, backend submits to Hedera:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         META-TRANSACTION FLOW                                │
│                                                                               │
│   1. User Intent                                                             │
│   ┌─────────────────┐                                                        │
│   │ Mobile App      │──▶ User wants to send 100 ZOOP to Alice               │
│   │                 │──▶ App creates EIP-712 typed data                     │
│   │                 │──▶ Privy wallet signs (user approves)                 │
│   └─────────────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│   2. Signature Submission                                                    │
│   ┌─────────────────┐                                                        │
│   │ POST /api/tx    │                                                        │
│   │ {               │                                                        │
│   │   type: 'transfer',                                                      │
│   │   to: '0xAlice...',                                                     │
│   │   amount: '100000000', // 100 ZOOP in 8 decimals                        │
│   │   nonce: 42,                                                            │
│   │   deadline: 1701234567,                                                 │
│   │   signature: '0x...'                                                    │
│   │ }               │                                                        │
│   └─────────────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│   3. Backend Validation                                                      │
│   ┌─────────────────┐                                                        │
│   │ - Verify signature matches user's Privy EOA                             │
│   │ - Check nonce (prevent replay)                                          │
│   │ - Verify deadline not passed                                            │
│   │ - Check user balance (on-chain or off-chain ledger)                     │
│   │ - Rate limit check                                                       │
│   └─────────────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│   4. Queue & Execute                                                         │
│   ┌─────────────────┐                                                        │
│   │ - Add to Redis queue                                                     │
│   │ - Worker picks up job                                                    │
│   │ - Submit to Hedera (backend pays HBAR)                                  │
│   │ - Wait for confirmation                                                  │
│   │ - Update database                                                        │
│   │ - Notify user via WebSocket/push                                        │
│   └─────────────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│   5. User Notification                                                       │
│   ┌─────────────────┐                                                        │
│   │ "Transfer complete! Tx: 0.0.123456@1701234570"                          │
│   └─────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema (PostgreSQL)

```sql
-- Core tables for Hedera transaction infrastructure

CREATE TYPE account_status AS ENUM ('pending', 'creating', 'active', 'failed');
CREATE TYPE tx_status AS ENUM ('pending', 'queued', 'processing', 'submitted', 'confirmed', 'failed');
CREATE TYPE tx_type AS ENUM ('account_creation', 'safe_deployment', 'transfer', 'withdrawal', 'stake', 'unstake', 'claim');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    privy_user_id VARCHAR(255) UNIQUE NOT NULL,
    privy_eoa_address VARCHAR(42) NOT NULL,
    hedera_account_id VARCHAR(20),  -- e.g., "0.0.123456"
    safe_wallet_address VARCHAR(42),
    account_status account_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Off-chain balance ledger
CREATE TABLE balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_symbol VARCHAR(10) NOT NULL,  -- 'ZOOP', 'HBAR'
    on_chain_balance NUMERIC(38, 0) DEFAULT 0,  -- Last synced from chain
    pending_deposits NUMERIC(38, 0) DEFAULT 0,
    pending_withdrawals NUMERIC(38, 0) DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, token_symbol)
);

-- Transaction queue
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type tx_type NOT NULL,
    status tx_status DEFAULT 'pending',

    -- Transaction details (JSONB for flexibility)
    params JSONB NOT NULL,  -- {to, amount, poolId, etc.}

    -- Queue management
    priority INTEGER DEFAULT 3,
    queue_position INTEGER,
    retry_count INTEGER DEFAULT 0,

    -- Hedera specifics
    hedera_tx_id VARCHAR(50),  -- "0.0.123@1701234567.123456789"
    hedera_receipt JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    queued_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Nonce tracking for meta-transactions
CREATE TABLE user_nonces (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    current_nonce BIGINT DEFAULT 0
);

-- Treasury operations log
CREATE TABLE treasury_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(20) NOT NULL,  -- 'batch_transfer', 'fee_collection'
    transaction_id UUID REFERENCES transactions(id),
    hedera_tx_id VARCHAR(50),
    total_amount NUMERIC(38, 0),
    recipient_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_users_account_status ON users(account_status);
```

### Redis Queue Structure (BullMQ)

```typescript
// Queue names
const QUEUES = {
  ACCOUNT_CREATION: 'hedera:account-creation',
  TRANSACTIONS: 'hedera:transactions',
  BATCH_TRANSFERS: 'hedera:batch-transfers',
  NOTIFICATIONS: 'notifications'
};

// Job data structures
interface AccountCreationJob {
  userId: string;
  privyEoaAddress: string;
  deploySafe: boolean;
}

interface TransactionJob {
  transactionId: string;
  userId: string;
  type: TxType;
  params: Record<string, unknown>;
  signature?: string;  // For meta-transactions
}

interface BatchTransferJob {
  batchId: string;
  transfers: Array<{
    transactionId: string;
    to: string;
    amount: string;
  }>;
}
```

### Monitoring & Alerts

```typescript
// Key metrics to monitor
const METRICS = {
  // Queue health
  'queue.account_creation.waiting': Gauge,
  'queue.account_creation.active': Gauge,
  'queue.transactions.waiting': Gauge,
  'queue.transactions.processing_time': Histogram,

  // Hedera specifics
  'hedera.gas_used_per_second': Gauge,
  'hedera.account_creations_per_minute': Counter,
  'hedera.transaction_success_rate': Gauge,
  'hedera.average_confirmation_time': Histogram,

  // Business metrics
  'withdrawals.pending_count': Gauge,
  'withdrawals.average_wait_time': Histogram,
  'users.pending_account_creation': Gauge
};

// Alert thresholds
const ALERTS = {
  // Critical
  'queue.transactions.waiting > 10000': 'Critical: Transaction backlog',
  'hedera.transaction_success_rate < 0.95': 'Critical: High failure rate',

  // Warning
  'queue.account_creation.waiting > 1000': 'Warning: Account creation backlog',
  'hedera.gas_used_per_second > 12000000': 'Warning: Approaching gas limit',

  // Info
  'withdrawals.average_wait_time > 300': 'Info: Withdrawal times elevated'
};
```

### API Endpoints

```typescript
// Backend API for transaction infrastructure

// Submit meta-transaction
POST /api/v1/transactions
Body: {
  type: 'transfer' | 'stake' | 'unstake' | 'claim',
  params: { ... },
  signature: string,
  nonce: number,
  deadline: number
}
Response: {
  transactionId: string,
  status: 'queued',
  estimatedWaitTime: number  // seconds
}

// Check transaction status
GET /api/v1/transactions/:id
Response: {
  id: string,
  status: 'pending' | 'queued' | 'processing' | 'confirmed' | 'failed',
  queuePosition?: number,
  hederaTxId?: string,
  confirmedAt?: string
}

// Get user's pending transactions
GET /api/v1/users/:id/transactions?status=pending,queued,processing
Response: {
  transactions: Transaction[],
  summary: {
    pendingWithdrawals: number,
    pendingStakes: number,
    estimatedCompletionTime: number
  }
}

// WebSocket for real-time updates
WS /api/v1/ws
Events:
  - transaction:status_changed
  - account:created
  - withdrawal:completed
```

### Capacity Planning

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAPACITY ESTIMATES                                   │
│                                                                               │
│   Hedera Limits (Conservative):                                             │
│   - Account creation: 50/sec (leaving 15/sec margin)                        │
│   - Token transfers: 100/sec (single) or 500/sec (batched)                 │
│   - Gas budget: 12M gas/sec (leaving 3M margin)                            │
│                                                                               │
│   Scenario: 10,000 DAU                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ Daily Operations (estimated):                                    │       │
│   │ - New accounts: 500/day → 0.006/sec (easily handled)            │       │
│   │ - Transfers: 5,000/day → 0.06/sec (easily handled)              │       │
│   │ - Stakes/Unstakes: 1,000/day → 0.01/sec (easily handled)        │       │
│   │ - Claims: 2,000/day → 0.02/sec (easily handled)                 │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                               │
│   Scenario: 100,000 DAU                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ Daily Operations:                                                │       │
│   │ - New accounts: 5,000/day → 0.06/sec (handled)                  │       │
│   │ - Transfers: 50,000/day → 0.6/sec (handled)                     │       │
│   │ - Peak hour (10x): 6/sec → batching recommended                 │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                               │
│   Scenario: Viral Spike (10x normal in 1 hour)                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │ - 10,000 new signups in 1 hour                                   │       │
│   │ - Account creation queue: ~3 hours to clear (50/sec)            │       │
│   │ - Users functional immediately via off-chain ledger             │       │
│   │ - Auto-scale workers if queue > threshold                       │       │
│   └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Backend Technology Stack

Based on the Hedera infrastructure requirements:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND STACK                                        │
│                                                                               │
│   Runtime & Framework                                                        │
│   ├── Node.js 20+ (LTS)                                                     │
│   ├── Express.js or Fastify (API)                                           │
│   ├── TypeScript (strict mode)                                              │
│   └── Zod (validation)                                                       │
│                                                                               │
│   Database                                                                   │
│   ├── PostgreSQL 15+ (primary data)                                         │
│   ├── Prisma (ORM)                                                          │
│   └── Redis 7+ (queues, caching, sessions)                                  │
│                                                                               │
│   Queue System                                                               │
│   ├── BullMQ (job queue on Redis)                                           │
│   ├── Bull Board (admin UI)                                                 │
│   └── Separate worker processes                                             │
│                                                                               │
│   Blockchain                                                                 │
│   ├── @hashgraph/sdk (Hedera native)                                        │
│   ├── viem (EVM chains)                                                     │
│   └── Hashio / Arkhia (Hedera JSON-RPC)                                     │
│                                                                               │
│   Authentication                                                             │
│   ├── Privy server SDK (verify tokens)                                      │
│   └── JWT (internal service auth)                                           │
│                                                                               │
│   Monitoring                                                                 │
│   ├── Prometheus (metrics)                                                  │
│   ├── Grafana (dashboards)                                                  │
│   └── Sentry (error tracking)                                               │
│                                                                               │
│   Infrastructure                                                             │
│   ├── Docker + Docker Compose (local dev)                                   │
│   ├── AWS ECS or GCP Cloud Run (production)                                 │
│   └── GitHub Actions (CI/CD)                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

> **Note**: This document is a living specification. Update as requirements evolve.
