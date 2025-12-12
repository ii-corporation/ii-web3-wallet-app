# Zoop Mobile App - Contractor Specification

**Version:** 1.0 | **Date:** December 2024

---

## 1. Executive Summary

**Zoop** is a mobile wallet for the Zoop ecosystem: social login authentication, ZOOP token management on Hedera, creator staking, points-to-token conversion, rewards shop, and cross-chain transfers.

| Already Built | To Be Built |
|---------------|-------------|
| Expo/React Native structure | Business logic & blockchain integration |
| Privy auth (working) | Complete UI for all screens |
| NestJS backend + Prisma | Queue system, WebSocket, contract calls |
| Basic navigation | Staking, Convert, Rewards, Wallet features |

---

## 2. Tech Stack

> Open to recommendations for better alternatives.

| Layer | Mobile | Backend |
|-------|--------|---------|
| Framework | React Native + Expo | NestJS + Fastify |
| State | Zustand + TanStack Query | PostgreSQL + Prisma |
| Styling | NativeWind | - |
| Auth | Privy | Privy Server SDK |
| Blockchain | Viem | Viem + BullMQ |
| Real-time | - | Socket.io |

**Infrastructure:** PostgreSQL, Redis, Docker, Bun

---

## 3. Feature Requirements Table

| ID | Feature | Screen | Complexity | Details |
|----|---------|--------|------------|---------|
| F1 | [Authentication](#f1-authentication) | Welcome | Medium | Privy OAuth + Safe wallet creation |
| F2 | [Home Dashboard](#f2-home-dashboard) | Home | Medium | Balance, earnings, stakes overview |
| F3 | [Staking](#f3-staking) | Staking | High | Explore creators, stake tokens, claim rewards |
| F4 | [Convert Points](#f4-convert-points-to-zoop) | Convert | Medium | Convert points to ZOOP with creator boost |
| F5 | [Rewards Shop](#f5-rewards-shop) | Rewards | Medium | Gift cards, shop discounts |
| F6 | [Wallet](#f6-wallet-main-screen) | Wallet | High | Balance, transactions, NFTs |
| F7 | [Wallet - Send](#f7-wallet---send) | Wallet/Send | High | Send tokens with network selection |
| F8 | [Wallet - Receive](#f8-wallet---receive) | Wallet/Receive | Low | QR code, address, network selection |
| F9 | [Notifications](#f9-notifications) | System | Medium | Push notifications, in-app alerts |

---

## 4. Feature Details

### F1: Authentication

**Screen:** Welcome/Login

**User Flow:**

1. User opens app → sees welcome screen
2. Taps "Continue" → Privy modal opens
3. User selects login method (Email, Google, Apple)
4. Privy creates embedded EOA wallet automatically
5. Backend syncs user → creates/retrieves user record
6. Backend queues Safe wallet deployment (see below)
7. User redirected to Home


**Privy Integration:**

- Privy handles all authentication (OAuth + email magic link)
- Privy automatically creates an embedded EOA wallet for each user
- The embedded wallet is the user's signing key (owner of the Safe wallet)


**Safe Wallet Creation:**

Each user gets a **Safe smart contract wallet** deployed on-chain, controlled by their Privy EOA:

- Uses our `ZoopSafeFactory` contract to deploy Safe proxies
- Safe is configured as 1/1 multisig (single owner = Privy EOA)
- Deterministic addresses via CREATE2 (can predict address before deployment)
- User's funds go to the Safe address, signed by their Privy EOA

**ZoopSafeFactory Contract Functions:**

```solidity
// Deploy Safe for user (called by backend)
createWallet(owner, saltNonce) → safeAddress

// Compute address before deployment
computeWalletAddress(owner, saltNonce) → predictedAddress

// Check if user has wallet
hasWallet(owner) → (bool exists, address safe)
```

**Security Model:**

- User's Privy EOA is the sole owner (self-custody)
- Privy handles key recovery via their secure infrastructure
- Zoop has NO control over user funds


**Backend Sync (on login):**

```
POST /api/v1/auth/sync
Authorization: Bearer <privy-token>

Response:
{
  "user": {
    "id": "uuid",
    "privyEoaAddress": "0x...",
    "safeWalletAddress": "0x..." | null,
    "accountStatus": "pending" | "creating" | "active"
  },
  "isNewUser": boolean
}
```


**Account Status Flow:**

- `pending` - User just registered, Safe wallet not yet deployed
- `creating` - Safe wallet deployment in progress (queued)
- `active` - User has Safe wallet deployed, can transact on-chain

See [Section 5](#5-hedera-blockchain-constraints) for why wallet creation is async.

---

### F2: Home Dashboard

**Screen:** Home (main tab)


**Section 1: Your Assets**

| Component | Description |
|-----------|-------------|
| ZOOP Points | Off-chain points balance (e.g., "3,320") |
| ZOOP Tokens | On-chain token balance (e.g., "6,258") |
| View Wallet | Link to Wallet screen |


**Section 2: Earnings**

| Component | Description |
|-----------|-------------|
| Daily Rewards | Estimated daily earnings from staking (e.g., "38.06") |
| Estimated ZPY | ZOOP Platform Yield percentage (e.g., "5.75%") |
| Stake button | Link to Staking screen |

**Tooltips:**

Info icons (ⓘ) next to "Daily Rewards" and "Estimated ZPY" open tooltip popovers with explanatory text (see Figma for exact copy).


**Section 3: Available to Stake**

| Component | Description |
|-----------|-------------|
| Tokens ready to stake | Number of unstaked tokens (e.g., "220") |


**Section 4: Your Top Stakes**

| Component | Description |
|-----------|-------------|
| Donut Chart | Visual distribution of stakes by creator |
| Total Staked | Sum of all staked tokens (e.g., "8,300 Total staked") |
| Creator List | Top 3 creators with staked amounts |
| View Stakes | Link to full stakes list |


**Empty State (new user):**

When user has ZOOP Points but no tokens staked:

- Show informational banner: "Earn up to 5.67% ZPY by staking"
- Message: "Convert your Points to Tokens to get started. Then choose your favorite creator to stake them and start earning more Tokens."
- CTA button: "Convert your Points"
- Daily rewards and ZPY show "0.00"

---

### App Navigation

**Bottom Tab Bar (persistent across all screens):**

| Tab | Icon | Screen |
|-----|------|--------|
| HOME | House | Home Dashboard |
| STAKING | Layers | Staking (Explore/My Stakes) |
| CONVERT | Arrows | Convert Points to ZOOP |
| REWARDS | Gift | Rewards Shop |
| WALLET | Wallet | Wallet (Send/Receive/NFTs) |

---

### F3: Staking

**Screen:** Staking tab


**Tabs:**

| Tab | Description |
|-----|-------------|
| Explore | Browse and discover creators to stake on |
| My Stakes | View user's active stakes |

---

#### Explore Tab

**Category Filters (horizontal scroll):**

Entertainment, Tech & Gaming, Music, Social Figure, Fashion, Sport, Health & Fitness, Travel, Beauty, Business


**Creator Grid:**

- 2-column grid layout
- Each card shows: Creator image, name
- Tap to open Creator Details


**Search:**

- Search icon in header
- Search creators by name

---

#### Creator Details (Bottom Sheet)

| Component | Description |
|-----------|-------------|
| Avatar + Name | Creator profile image and name |
| Category Badge | e.g., "ENTERTAINMENT" |
| "You staked" Badge | Shows if user already has stake with this creator |
| Description | Creator bio (truncated with "...more") |
| Social Links | Instagram, Threads, X icons |


**Staking Rewards Section:**

List of benefits for staking with this creator (e.g., "Behind-the-Scenes Content", "Exclusive Updates", "Member Specials")


**Stats:**

| Stat | Description |
|------|-------------|
| You staked | User's current stake amount (e.g., "250.00 Tokens") |
| Estimated ZPY | Range based on lock period (e.g., "3.67% - 7.20%") |
| Total Staked Users | Number of users staking (e.g., "463,059") |
| Total staked | Total tokens in pool (e.g., "253,832 Tokens") |
| Smart contract | Contract address (clickable → opens blockchain explorer) |


**Action Buttons:**

| Button | Action |
|--------|--------|
| View Club | Opens creator's Club on ZOOP platform |
| Stake | Opens Stake amount screen |

---

#### Stake Screen (Amount Entry)

| Component | Description |
|-----------|-------------|
| Header | Back arrow + "Stake" title |
| Creator Info | Avatar, name, category badge |
| Balance Display | "Balance: 2,358" (user's available tokens) |
| Amount Input | Token input field with number pad |
| Quick Amounts | 10%, 25%, 50%, All buttons |
| Lock Period | 30, 90 (default), 180, 360 days selector |
| Estimated ZPY | Updates based on lock period (e.g., "5.6%") |
| Confirm Button | Proceeds to review screen |


**Lock Period Default:** 90 days is pre-selected. User can tap to change.

---

#### Review Staking (Confirmation Modal)

| Field | Example |
|-------|---------|
| Staked to | Carmelita Rose |
| Amount to stake | 250.00 Tokens |
| Lock period | 90 days |
| Estimated ZPY | 5.6% |
| Estimated reward | ≈ 15.20 Tokens |
| Unlock date | May 14, 2025 |
| Fee | 0.6% = 1.50 Tokens |
| **Total** | 251.50 Tokens |


**Buttons:** Cancel | Stake

---

#### My Stakes Tab

**Summary Header:**

| Stat | Description |
|------|-------------|
| Total staked | Sum of all staked tokens (e.g., "8,300") |
| Total earned | Rewards earned over time (e.g., "430") |
| Estimated ZPY | Average yield (e.g., "5.75%") |


**Stake List:**

Each stake item shows:

| Component | Description |
|-----------|-------------|
| Creator Avatar | Profile image |
| Creator Name | e.g., "Carmelita Rose" |
| Staked Amount | "You staked: 1,200" |
| Lock Period | "Lock period: 90 days" |
| Days Remaining | "Days left: 5 days" (or empty if unlocked) |
| Claim Link | "Claim token rewards" (purple text) |

Tap stake item → opens Stake Details bottom sheet

---

#### Stake Details (Bottom Sheet)

**Locked State:**

| Field | Example |
|-------|---------|
| Creator | Avatar + Name + "56 DAYS LEFT" badge |
| You staked | 500 Tokens |
| Start date | May 14, 2025 |
| Lock period | 90 days |
| Estimated ZPY | 5.67% |
| End date | Sept 14, 2025 |
| Hash | 0x9f88460b1734d39e20a.....ef592 (clickable → explorer) |

**Button:** "Claimable in 56 days" (disabled/gray)


**Unlocked State:**

| Field | Example |
|-------|---------|
| Creator | Avatar + Name + "CLAIMABLE" badge (green) |
| You staked | 1,200 Tokens |
| Start date | May 14, 2025 |
| Lock period | 180 days |
| Estimated ZPY | 5.67% |
| End date | Sept 14, 2025 |
| Stake reward | 27.36 Tokens |
| Hash | 0x9f88460b1734d39e20a.....ef592 (clickable → explorer) |

**Button:** "Claim reward" (purple, active)

---

#### Success Notifications

**Stake Success (snackbar):**

- Creator info (avatar, name, amount, lock period)
- "Staked Successfully. Unlocks on Aug 12"


**Claim Success (snackbar):**

- Creator info
- "Awesome, your rewards have been claimed!"

---

#### Staking Contract Integration

The ZoopStaking smart contract handles:

- Pool-based staking (each creator = 1 pool)
- Lock periods with bonus multipliers
- On-chain reward calculation


**Upgradeable Proxy Pattern:**

The staking contract uses an **upgradeable proxy pattern** (e.g., UUPS or Transparent Proxy):

| Component | Description |
|-----------|-------------|
| Proxy Contract | Fixed address that never changes - this is what the app interacts with |
| Implementation | Logic contract that can be upgraded by admin |
| Storage | Maintained in proxy, persists across upgrades |

**What this means for the mobile app:**

- The **contract address stays the same** forever (proxy address)
- Function signatures may change or new functions added via upgrades
- App should fetch ABI dynamically or be designed for easy updates
- Consider versioning the contract interface in the app
- Backend can abstract contract changes from mobile app

**Recommended approach:**

```
Mobile App → Backend API → Contract (via Proxy)
```

The backend handles contract interactions, so if the implementation is upgraded:
1. Only backend needs updating (new ABI, new function calls)
2. Mobile app API calls remain unchanged
3. No app store update required for contract upgrades


**Transaction Flow (Seamless Gas Abstraction):**

Fee is hidden from user. Backend deducts fee silently:

```
1. User enters stake amount (250 ZOOP) and lock period
2. App displays: "Staking 250 ZOOP to Carmelita Rose"
   (no fee shown - seamless UX)
3. User confirms in Review modal
4. User signs intent with Privy EOA (EIP-712)
5. Backend validates signature
6. Backend silently deducts ZOOP fee (~0.5 ZOOP) from user balance
7. Backend submits stake transaction (pays HBAR from reserve)
8. On confirmation → WebSocket notification → success UI
```

**Requirements:**

- Safe wallet must be deployed (status: `active`)
- User needs sufficient ZOOP balance (amount + hidden fee)
- No HBAR needed (backend pays gas)
- **User never sees fees** - completely seamless

**Pending users** (Safe not deployed yet) cannot stake - UI shows "Setting up wallet..." and disables the Stake button.


**Key Contract Functions:**

```solidity
// Read
getPool(poolId) → Pool info
getUserStakes(address) → User's stake IDs
pendingRewards(stakeId) → Claimable rewards
getEffectiveAPR(poolId) → APR with bonuses

// Write (require signature)
stake(poolId, amount, lockPeriod)
unstake(stakeId) // Only after lock ends
claimRewards(stakeId)
```

*Note: These functions represent the current implementation. Function signatures may evolve with upgrades.*


**Unstaking Rules:**

- User CANNOT unstake before lock period ends
- UI shows countdown: "Days left: X days"
- After unlock, user can unstake anytime
- Rewards claimable only after lock period ends


**Restaking Boost:**

When a stake's lock period ends, users have two options:

| Option | Action | Benefit |
|--------|--------|---------|
| Unstake | Withdraw tokens to wallet | No bonus |
| Restake | Lock tokens again immediately | **Loyalty boost on ZPY** |

**How the boost works:**

- If user chooses to restake directly (without withdrawing), they receive a loyalty multiplier
- Boost increases effective ZPY (e.g., base 5% → boosted 5.5%)
- Consecutive restakes may compound the boost (depends on contract implementation)
- Boost resets if user unstakes and withdraws

**UI Flow (Unlocked Stake):**

```
┌─────────────────────────────────────┐
│  Your stake is unlocked!            │
│                                     │
│  [Unstake]     [Restake + Boost]    │
│                      ↑              │
│              Shows boost %          │
└─────────────────────────────────────┘
```

**Example:**

| Scenario | Base ZPY | Boost | Effective ZPY |
|----------|----------|-------|---------------|
| First stake | 5.0% | 0% | 5.0% |
| First restake | 5.0% | +0.5% | 5.5% |
| Second restake | 5.0% | +1.0% | 6.0% |
| Unstake & re-stake later | 5.0% | 0% (reset) | 5.0% |

---

### F4: Convert Points to ZOOP

**Screen:** Convert

**Purpose:** Convert off-chain Zoop Points to on-chain ZOOP tokens while optionally boosting a creator.

---

#### Convert Screen

**Banner (dismissible):**

"Convert your ZOOP Token - Convert your ZOOP Points to ZOOP tokens while contributing to boost your favorite creators."


**Amount Input:**

| Component | Description |
|-----------|-------------|
| Points Input | Token input field with number pad |
| Balance | "Balance: 2,358" display |
| Max Button | Sets input to maximum available |


**Input States:**

| State | Appearance |
|-------|------------|
| Default | "0.00" placeholder |
| Focused | Cursor visible, purple border |
| Filled | Amount displayed (e.g., "2500.00") |
| Error | Red border, "Insufficient balance" message |


**Creator Boost (optional):**

| Component | Description |
|-----------|-------------|
| Creator Avatars | Horizontal scroll of creators (ZOOP, Floyd McCoy, etc.) |
| None Option | Select to convert without boosting |
| View All | Link to see all creators |

Boosting a creator gives them a portion of the conversion.


**Lock Period Selector:**

30 | 90 | 180 | 360 days


**Conversion Summary:**

| Field | Example |
|-------|---------|
| You convert | 132.50 Points |
| You receive | 87.25 Tokens |
| Rate | 1 Point = 1 Token |
| Exchange fee | 0.6% |
| Conversion estimation | 2,500.00 Tokens |


**Disclaimer:**

"Converting ZOOP Points into Tokens and then actively staking them is solely for platform utility, supporting creators and platform growth, without implying monetary returns or profits."


**Button:** Confirm

---

#### Review Conversion (Modal)

| Field | Example |
|-------|---------|
| Amount | 2,500.00 Points |
| Boosting | No boost / Carmelita Rose |
| Lock period | 30 days |
| Conversion estimation | 2,483.50 Tokens |

**Buttons:** Cancel | Convert

---

#### After Conversion

1. Redirect to Staking page
2. Show banner: "Earn up to 5.67% ZPY by staking. Choose your favorite creator to stake and start earning more Tokens."
3. Show snackbar: "Conversion successful. Tokens added to your wallet."


**Important:** This is a one-way conversion. ZOOP cannot be converted back to points.

---

#### Conversion Backend Architecture

**How conversion works:**

Points are off-chain (database), ZOOP tokens are on-chain. The **Treasury wallet** holds the ZOOP token supply and executes token delivery to users.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSION FLOW                               │
│                                                                  │
│   1. User requests conversion (2,500 Points → ZOOP)             │
│      └─► App sends request to backend                           │
│                                                                  │
│   2. Backend validates                                          │
│      └─► Check user has sufficient points                       │
│      └─► Check user's Safe wallet is deployed (status: active)  │
│      └─► Calculate ZOOP amount (apply rate + fees)              │
│                                                                  │
│   3. Backend creates conversion job                             │
│      └─► Deduct points from user's balance (database)           │
│      └─► Create job in Redis queue (BullMQ)                     │
│      └─► Return job ID to user                                  │
│                                                                  │
│   4. Queue worker processes                                     │
│      └─► Treasury wallet transfers ZOOP to user's Safe          │
│      └─► Update conversion record (status: confirmed)           │
│      └─► Notify user via WebSocket                              │
└─────────────────────────────────────────────────────────────────┘
```

**Why Redis Queue (BullMQ)?**

| Benefit | Description |
|---------|-------------|
| **Reliability** | Jobs persist in Redis, won't be lost if server restarts |
| **Retry logic** | Failed transfers automatically retry with backoff |
| **Idempotency** | Each job has unique ID, prevents double-delivery |
| **Rate limiting** | Queue respects Hedera's transaction limits |
| **Audit trail** | All jobs logged with status, timestamps, tx hashes |
| **Replay capability** | Failed/stuck jobs can be manually replayed |

**Conversion Job Schema:**

```typescript
interface ConversionJob {
  id: string;                    // Unique job ID
  userId: string;                // User requesting conversion
  pointsAmount: number;          // Points to convert
  zoopAmount: number;            // ZOOP to receive (after fees)
  recipientAddress: string;      // User's Safe wallet address
  creatorBoostId?: string;       // Optional creator to boost
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  attempts: number;              // Retry count
  hederaTxId?: string;           // On-chain tx ID when confirmed
  createdAt: Date;
  confirmedAt?: Date;
  error?: string;                // Error message if failed
}
```

**Failure Handling:**

```
Job fails (network error, insufficient Treasury balance, etc.)
  └─► BullMQ retries with exponential backoff (3 attempts)
  └─► If still failing → status: 'failed', alert ops team
  └─► Points NOT refunded automatically (requires manual review)
  └─► Admin can replay job or refund points manually
```

**Treasury Wallet Requirements:**

- Must hold sufficient ZOOP token supply for conversions
- Backend monitors Treasury balance, alerts if running low
- Conversion rate controlled by backend (can be adjusted without contract changes)

---

### F5: Rewards Shop

**Screen:** Rewards

**Purpose:** Users spend ZOOP tokens to purchase gift cards, shop discounts, and other rewards.

---

#### Main Rewards Screen

**Top Deals Section:**

- Horizontal scroll of featured deals
- Cards show: Brand image, brand name, type label (e.g., "Gift Cards", "Shops")


**Products Section:**

| Category | Description |
|----------|-------------|
| Gift Cards | "Convert your tokens into amazing gift cards that you can use later" |
| Shops | "Get access to exclusive discounts and coupon codes to save cash" |

Each category is expandable/tappable to view full list.


**Featured Card:**

Shows highlighted deal with discount badge (e.g., "10% OFF")

---

#### Gift Cards Screen

**Tabs:** Discover | Collected


**Discover Tab:**

Grid of brand cards:

| Component | Description |
|-----------|-------------|
| Brand Logo | Amazon, Nike, Apple, XBOX, Airbnb, Uber, Samsung, Tesla, etc. |
| Brand Name | Below logo |
| Price | "From: X [tokens]" |


**Gift Card Detail:**

| Component | Description |
|-----------|-------------|
| Availability Badge | "14 LEFT" (yellow badge) |
| Brand Logo | Large brand image |
| Base Price | "From: 1,400" |
| Amount Selector | $50 | $100 | $150 buttons |
| Tokens Required | "1,600 tokens left to unlock" |
| Description | "Trade your tokens for an Amazon Gift Card." |
| Buy Button | "Buy with 2,000 Tokens" |


**Collected Tab:**

- Shows purchased gift cards
- "COLLECTED" badge on cards
- Can view/redeem codes

---

#### Shops Screen

**Category Filters (horizontal scroll):**

Top Deals, Electronics, Health & Beauty, Fashion


**Featured Deal:**

| Component | Description |
|-----------|-------------|
| Banner Image | Store promotional image |
| Store Name | e.g., "H&M" |
| Deal Title | "10% discount at H&M" |
| Availability | "10 LEFT" badge |


**Flash Deals Section:**

Grid of time-limited deals with store logos (McDonald's, Sony, etc.)


**Top Stores Section:**

Horizontal scroll of store logos (H&M, Sony, XBOX, Uber, Apple)


**Shop Deal Detail:**

| Component | Description |
|-----------|-------------|
| Deal Title | "10% discount at H&M" |
| Availability Badge | "13 LEFT" |
| Deal Image | Promotional image |
| Exchange Price | "Exchange: 2,800" |
| Tokens Status | "1,600 tokens left to unlock" |
| Description | "Trade your tokens for a coupon code to save 10% on your next order." |
| Buy Button | "Buy with 2,800 Tokens" |

---

#### Purchase Flow

1. User selects gift card or shop deal
2. User selects amount (for gift cards)
3. User taps "Buy with X Tokens"
4. Confirmation modal shows details
5. User confirms → signs transaction
6. Backend processes purchase
7. User receives code/voucher (shown in Collected tab)

---

### F6: Wallet (Main Screen)

**Screen:** Wallet tab

---

#### Wallet Overview

| Component | Description |
|-----------|-------------|
| Settings Icon | Top right, opens settings |
| Balance Display | "Available token balance: 3,840" |
| Action Buttons | Send | Receive |


**Transactions Section:**

| Component | Description |
|-----------|-------------|
| Header | "Transactions" with "View all" link |
| Transaction Items | List of recent transactions (3-5 items) |

Each transaction shows:

| Component | Description |
|-----------|-------------|
| Icon | Arrow up (sent), arrow down (received), stake icon, etc. |
| Description | "Received from 0xAc...aeC1d" or "Staked to Carmelita Rose" |
| Date/Time | "23/12/2024 · 11:44 AM" |
| Amount | "+1,250" (green) or "-2,500" (red) or "500" (neutral for stakes) |


**My NFTs Section:**

| Component | Description |
|-----------|-------------|
| Header | "My NFTs" |
| NFT Cards | Grid of owned NFTs |
| NFT Card | Image thumbnail + name + ID |

---

#### Transactions Screen (Full List)

**Tabs:** All | Staked | Received | Sent


**Transaction Types:**

| Type | Icon | Description | Amount Color |
|------|------|-------------|--------------|
| Received | ↓ | "Received from 0xAc...aeC1d" | Green (+) |
| Sent | ↑ | "Sent to 0xAc...aeC1d" | Red (-) |
| Staked | Stake | "Staked to Carmelita Rose" | Neutral |
| Converted | Exchange | "Converted to Tokens" | Neutral |

---

#### Transaction Details (Bottom Sheet)

| Field | Example |
|-------|---------|
| Type | Received |
| Date | May 14, 2025 - 09:15 AM |
| Amount | 2,500 Tokens |
| Status | Success |
| From | 0xa3f5c2d4e8f9a0b1c2.....4f5g6h7 (clickable) |
| To | 0×8740b34fb6f09cec.....a6a5e8d (clickable) |
| Fee | 0.6% = 16.50 Tokens |
| Hash | 0×9f88460b1734d39d20a.....ef592 (clickable → explorer) |

---

#### NFT Details Screen

| Field | Example |
|-------|---------|
| NFT Image | Full-size image |
| Name | Hedera welcome gift |
| Description | "The description for this NFT that users receive as a welcome gift when they signup on Zoop for the first time." |
| Minted on | May 14, 2025 |
| Serial Number | 21,490 |
| ID | 0.0.123456 (clickable → explorer) |

---

### F7: Wallet - Send

**Screen:** Wallet → Send

---

#### Send Screen

| Component | Description |
|-----------|-------------|
| Header | Back arrow + "Send" title |
| Network Selector | Dropdown: "Select the network" (Hedera, Ethereum, BNB) |
| Recipient Address | Label: "Recipient Address", Input field + QR scan icon |
| Amount Section | Label: "Amount", Balance display (e.g., "Balance: 2,209"), "Max" button |
| Token Selector | Dropdown showing "ZOOP Tokens" |
| Amount Input | Numeric input field (e.g., "0.00") |
| Fee Display | "Fee: 0.6%" |
| Network Warning | Yellow box (see below) |
| Send Button | Purple button, initiates transaction |
| Number Pad | On-screen numeric keyboard |


**Network Warning (yellow box):**

"You must select the same network you will be using to deposit your ZOOP Tokens. Using the wrong network will result in a loss of funds."

---

#### Review Transaction (Modal)

**Header:** "Review transaction"

| Field | Example |
|-------|---------|
| Amount | 2,500.00 Points |
| Network | Hedera |
| To | 0x8740b34fb6f09cec.....a6a5e8d |
| Fee | 0.6% = 16.50 Tokens |
| You receive | 2,483.50 Tokens |


**Warning (yellow box):**

"Token transfers are permanent and cannot be undone once submitted. Review all details carefully."


**Buttons:** Cancel | Send

---

#### Success Notification

Snackbar: "Tokens sent successfully"

---

#### Cross-Chain Bridging (LayerZero)

When user wants to send ZOOP tokens to a different blockchain (e.g., Hedera → Ethereum or BSC), the transfer uses **LayerZero OFT** (Omnichain Fungible Token) protocol.


**Supported Networks:**

| Network | Contract | Type |
|---------|----------|------|
| Hedera | ZoopHTSConnector | Native HTS token (8 decimals) |
| Ethereum | ZoopOFT | ERC20 (18 decimals) |
| BSC | ZoopOFT | ERC20 (18 decimals) |


**Bridging Flow (Hedera → EVM):**

```
1. User initiates cross-chain send
2. User signs transaction with Privy
3. Backend calls ZoopHTSConnector.send()
   └─► Tokens transferred to connector contract
   └─► Tokens burned on Hedera
   └─► LayerZero message sent to destination chain
4. LayerZero relayer picks up message
5. ZoopOFT on destination chain mints tokens to recipient
6. User notified when complete
```


**Bridging Flow (EVM → Hedera):**

```
1. User initiates cross-chain send from EVM chain
2. User signs transaction
3. ZoopOFT.send() is called
   └─► Tokens burned on source chain
   └─► LayerZero message sent to Hedera
4. ZoopHTSConnector on Hedera receives message
   └─► Tokens minted via HTS
   └─► Tokens transferred to recipient
5. User notified when complete
```


**Contract Functions:**

```solidity
// ZoopHTSConnector (Hedera) - inherited from OFTCore
function send(
    SendParam calldata _sendParam,  // includes dstEid, to, amount
    MessagingFee calldata _fee,
    address _refundAddress
) external payable returns (MessagingReceipt memory, OFTReceipt memory);

// ZoopOFT (EVM chains) - inherited from OFT
function send(
    SendParam calldata _sendParam,
    MessagingFee calldata _fee,
    address _refundAddress
) external payable returns (MessagingReceipt memory, OFTReceipt memory);

// Quote fee before sending
function quoteSend(
    SendParam calldata _sendParam,
    bool _payInLzToken
) external view returns (MessagingFee memory);
```


**Decimal Handling:**

| Chain | Local Decimals | Shared Decimals |
|-------|----------------|-----------------|
| Hedera (HTS) | 8 | 8 |
| Ethereum/BSC | 18 | 8 |

LayerZero handles decimal conversion automatically using `sharedDecimals = 8`.


**UI Considerations:**

- Show estimated bridge time (~1-5 minutes)
- Show LayerZero fee (paid in native token: HBAR or ETH/BNB)
- Show destination network clearly
- Provide transaction tracking via LayerZero Scan

---

### F8: Wallet - Receive

**Screen:** Wallet → Receive

---

#### Receive Screen

| Component | Description |
|-----------|-------------|
| Header | Back arrow + "Receive" title |
| Network Selector | Label: "Network", Dropdown showing current network (e.g., "Hedera") with dropdown arrow |
| Wallet Address | Label: "Wallet address", Full address (e.g., "0×1234a1f0c2f345a8b1f2ae1ee12f3...") with copy icon |
| QR Code | Large scannable QR code containing wallet address |
| Network Warning | Yellow box at bottom (see below) |


**Network Warning (yellow box):**

"You must select the same network you will be using to deposit your ZOOP Tokens. Using the wrong network will result in a loss of funds."

---

#### Select Network (Modal)

**Header:** "Select network"

| Network | Icon | State |
|---------|------|-------|
| Hedera | H logo (purple) | Default selected (checkmark) |
| Ethereum | ETH logo (blue) | Selectable |
| BNB | BNB logo (yellow) | Selectable |

Selecting a network updates the wallet address and QR code to show the address for that chain.

---

#### Copy Notification

Snackbar: "Wallet address copied"

---

### F9: Notifications

**Purpose:** Keep users informed about their transactions, rewards, and account status.


**Notification Types:**

| Type | Trigger | Message Example |
|------|---------|-----------------|
| Transaction Confirmed | Tx succeeds on-chain | "Your transfer of 100 ZOOP was confirmed" |
| Transaction Failed | Tx fails | "Transfer failed: insufficient balance" |
| Rewards Available | Staking rewards ready | "You have 50 ZOOP rewards to claim!" |
| Wallet Ready | Safe deployed | "Your wallet is ready to use" |
| Purchase Complete | Shop order fulfilled | "Your reward has been delivered" |


**Push Notifications (Expo):**

- Use Expo Push Notifications for background alerts
- User must grant permission on first launch
- Store push token in backend for targeting


**In-App Notifications:**

- Real-time via WebSocket connection
- Toast/snackbar for immediate feedback
- Notification center for history (optional)


**WebSocket Events (from backend):**

| Event | Action |
|-------|--------|
| `transaction:confirmed` | Show success toast |
| `transaction:failed` | Show error toast |
| `account:created` | Show "Wallet ready" banner |
| `balance:updated` | Refresh balance display |

---

## 5. Hedera Blockchain Constraints

### Critical: Account/Contract Creation Rate Limit

**Hedera network has a hard limit: ~2 accounts per second**

This means:

- Cannot deploy Safe wallets synchronously on user signup
- Must queue wallet deployment
- Users function with off-chain ledger until wallet ready


### Wallet Creation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WALLET CREATION FLOW                          │
│                                                                  │
│   1. User signs up via Privy                                    │
│      └─► Privy creates EOA instantly                            │
│                                                                  │
│   2. Backend receives signup                                     │
│      └─► Creates user record (status: "pending")                │
│      └─► Computes predicted Safe address (CREATE2)              │
│      └─► Adds job to Redis queue                                │
│                                                                  │
│   3. Queue worker processes (rate limited)                       │
│      └─► Calls ZoopSafeFactory.createWallet()                   │
│      └─► Safe proxy deployed, owned by user's EOA               │
│      └─► Updates user (status: "active")                        │
│      └─► Transfers pending balance from Treasury                │
│                                                                  │
│   4. User notified via WebSocket                                 │
│      └─► "Your wallet is ready!"                                │
└─────────────────────────────────────────────────────────────────┘
```


**Predictable Address:**

Since Safe uses CREATE2, we can compute the wallet address BEFORE deployment:

```
predictedAddress = ZoopSafeFactory.computeWalletAddress(userEOA, saltNonce)
```

This allows users to receive funds even while their wallet is still pending deployment.


### Pending User Experience

**The Problem:**

During high-traffic periods (marketing campaigns, launches), thousands of users may sign up simultaneously. With Hedera's ~2 accounts/second rate limit, deploying Safe wallets for 10,000 new users would take ~83 minutes.

**Recommended Approach: Wait for Safe Deployment**

The simplest and most secure approach is to require Safe wallet deployment before enabling on-chain actions:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PENDING USER FLOW                             │
│                                                                  │
│   1. User signs up via Privy                                    │
│      └─► EOA created instantly                                  │
│      └─► Safe deployment queued                                 │
│                                                                  │
│   2. User sees "Setting up your wallet..." status               │
│      └─► Can browse app, view creators, explore features        │
│      └─► Cannot perform on-chain actions yet                    │
│                                                                  │
│   3. Safe deployed (minutes to hours depending on queue)        │
│      └─► User notified: "Your wallet is ready!"                 │
│      └─► Full functionality unlocked                            │
└─────────────────────────────────────────────────────────────────┘
```

**What pending users CAN do:**

| Action | How It Works |
|--------|--------------|
| Browse app | View Home, Staking, Rewards screens |
| View creators | Explore creators, read bios, see stats |
| See their predicted wallet address | CREATE2 allows pre-computing address |
| Convert points (off-chain) | Points → pending token balance (credited when wallet ready) |

**What pending users CANNOT do (until Safe deployed):**

| Action | Reason |
|--------|--------|
| Stake tokens | Requires on-chain transaction |
| Send tokens | Requires on-chain transaction |
| Claim rewards | Requires on-chain transaction |
| Receive tokens | Can receive to predicted address, but can't use until deployed |

**UI States:**

| Account Status | UI Behavior |
|----------------|-------------|
| `pending` | Show "Setting up wallet..." banner, disable on-chain actions |
| `creating` | Show "Almost ready..." with progress indicator |
| `active` | Full functionality, no restrictions |

**Why this approach:**

- **Simple**: No complex Treasury accounting
- **Secure**: No honeypot wallet holding everyone's funds
- **Honest UX**: Users know their wallet is being set up
- **No reconciliation**: Stakes belong to user's Safe from the start

### Backend Queue System (BullMQ + Redis)

Since users submit their own on-chain transactions (staking, sending, etc.), the backend queue is only needed for **backend-initiated operations**:

| Operation | Why Queued |
|-----------|------------|
| Safe wallet deployment | Rate-limited by Hedera (~2/sec), triggered on signup |
| Conversion delivery | Treasury sends ZOOP to user after point conversion |

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND QUEUE USAGE                           │
│                                                                  │
│   User Signup → Queue Safe Deployment → Worker deploys Safe     │
│                                                                  │
│   User Converts Points → Queue ZOOP Delivery → Treasury sends   │
└─────────────────────────────────────────────────────────────────┘
```

**User-initiated on-chain actions (stake, send, claim) go directly to Hedera from the mobile app - NOT through the backend queue.**


### Queue Priorities

| Priority | Job Type | Rationale |
|----------|----------|-----------|
| 1 (High) | Conversion delivery | User is waiting for tokens |
| 2 (Normal) | Safe deployment | User can browse while waiting |


### Mass Signup Scenario

**If 10,000 users sign up during a launch:**

1. All Safe deployments queued
2. Workers process at ~2/sec (Hedera rate limit)
3. Users see "Setting up wallet..." status
4. Total time: ~83 minutes for all wallets
5. Users notified when their Safe is ready

---

## 6. Backend Infrastructure Requirements

### Required Services

| Service | Purpose |
|---------|---------|
| PostgreSQL | User data, balances, transactions |
| Redis | Job queues, caching, sessions |
| WebSocket | Real-time notifications |


### Database Schema (Key Tables)

**users:**

```
- id (UUID)
- privy_user_id (unique)
- privy_eoa_address (Privy wallet)
- hedera_account_id (null until created)
- account_status (pending/creating/active/failed)
- created_at, updated_at
```


**balances:**

```
- user_id (FK)
- token_symbol (ZOOP, etc.)
- on_chain_balance (last synced)
- pending_deposits (incoming)
- pending_withdrawals (outgoing)
```


**transactions:**

```
- id (UUID)
- user_id (FK)
- type (transfer/stake/claim/etc.)
- status (pending/queued/processing/confirmed/failed)
- params (JSON - to, amount, etc.)
- hedera_tx_id (after confirmation)
- created_at, confirmed_at
```


### Queue Jobs (BullMQ)

| Queue | Job Types |
|-------|-----------|
| hedera:accounts | Account creation, Safe deployment |
| hedera:transactions | Transfers, stakes, claims |
| hedera:batch | Batch transfers |


### WebSocket Events

| Event | Payload | When |
|-------|---------|------|
| `transaction:status` | `{txId, status}` | Status change |
| `transaction:confirmed` | `{txId, hederaTxId}` | Tx confirmed |
| `transaction:failed` | `{txId, error}` | Tx failed |
| `account:created` | `{hederaAccountId}` | Account ready |
| `balance:updated` | `{tokenSymbol, balance}` | Balance change |


### API Design Principles

The contractor should design APIs following these principles:

1. **RESTful endpoints** for CRUD operations
2. **Async transactions** - Return immediately with status, notify via WebSocket
3. **Idempotency** - Use nonces for transaction requests
4. **Rate limiting** - Protect against abuse
5. **Validation** - Validate all inputs server-side

---

## 7. Authentication & Wallet Integration

### Privy Integration

**Privy provides:**

- Social login (Google, Apple, Email)
- Embedded wallet (automatic)
- Secure key management (user never sees private key)
- JWT tokens for backend auth


**Mobile SDK Usage:**

```tsx
// Login
const { loginWithUI } = usePrivy();
await loginWithUI({ loginMethods: ['email', 'google', 'apple'] });

// Get user
const { user, authenticated } = usePrivy();

// Sign transaction
const { signTypedData } = usePrivy();
const signature = await signTypedData(typedData);

// Get access token for backend
const { getAccessToken } = usePrivy();
const token = await getAccessToken();
```


### Transaction Flow (Gas Abstraction)

Users pay fees in **ZOOP tokens**, backend pays actual gas in **HBAR**. Users never need to acquire HBAR.

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAS ABSTRACTION MODEL                         │
│                                                                  │
│   User Action                                                   │
│     └─► App calculates fee (ZOOP) using oracle price            │
│     └─► App displays: "You receive: X ZOOP" (after fee)         │
│     └─► User signs transaction intent (EIP-712)                 │
│     └─► Backend receives signed intent + ZOOP fee               │
│                                                                  │
│   Backend Processing                                            │
│     └─► Validates signature                                     │
│     └─► Deducts ZOOP fee from user                              │
│     └─► Submits transaction to Hedera (pays HBAR from reserve)  │
│     └─► Notifies user via WebSocket                             │
│                                                                  │
│   Fee Collection                                                │
│     └─► ZOOP fees collected in Treasury                         │
│     └─► Periodically swap ZOOP → HBAR to replenish reserve      │
│         OR keep ZOOP (if valuable)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Seamless Fee Model (Hidden from User)

**Fees are invisible to the user.** The app only shows the final amount (X = Y - fee).

```
User enters:     100.00 ZOOP to send
App displays:    "Recipient receives 99.90 ZOOP"
                 (fee silently deducted, not shown)
```

**UX Principle:** User should never see "fee", "gas", or "network cost". The experience is seamless like a traditional app.

| What User Sees | What Happens Behind the Scenes |
|----------------|--------------------------------|
| "Send 100 ZOOP" | Backend calculates: 100 - 0.1 fee = 99.9 |
| "Recipient gets 99.90 ZOOP" | Fee deducted silently |
| No fee breakdown shown | Backend pays HBAR, collects ZOOP difference |

---

#### ZOOP/HBAR Price Oracle

To calculate fees in ZOOP, backend needs real-time ZOOP/HBAR exchange rate:

**Options:**

| Source | Description | Pros | Cons |
|--------|-------------|------|------|
| **AMM Pool** | Query on-chain liquidity pool (e.g., SaucerSwap) | Real-time, decentralized | Requires ZOOP/HBAR pool to exist |
| **Chainlink/Oracle** | Use price feed oracle | Reliable, standard | May not have ZOOP pair |
| **Internal pricing** | Backend sets fixed rate | Simple, controlled | Not market-based |
| **CEX API** | Query exchange price | Market price | Centralized dependency |

**Recommended: AMM Pool (SaucerSwap)**

```typescript
// Pseudocode: Get ZOOP/HBAR rate from AMM
const zoopHbarRate = await saucerSwap.getPrice('ZOOP', 'HBAR');

// Calculate fee in ZOOP
const hbarGasCost = 0.002; // HBAR needed for transaction
const feeInZoop = hbarGasCost / zoopHbarRate;

// Add buffer for price volatility (e.g., 10%)
const finalFee = feeInZoop * 1.1;
```

---

#### Fee Calculation Flow (Backend Only)

```
1. User initiates action (e.g., send 100 ZOOP)
2. App sends request to backend
3. Backend (invisible to user):
   a. Estimates HBAR gas cost for transaction type
   b. Fetches current ZOOP/HBAR rate from AMM
   c. Calculates: feeZoop = gasHbar / zoopHbarRate
   d. Adds buffer (10-20%) for price movement
4. App displays: "Recipient receives 99.90 ZOOP"
   (NO fee breakdown shown - just the result)
5. User confirms
6. User signs intent
7. Backend executes transaction, silently deducts fee
```

**Key UX principle:** User only sees what they get or what recipient gets. Never show fee calculations.

---

#### Backend HBAR Reserve

Backend maintains an HBAR reserve to pay gas:

```
┌─────────────────────────────────────────────────────────────────┐
│                    HBAR RESERVE MANAGEMENT                       │
│                                                                  │
│   ZOOP Fees Collected                                           │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────────┐         ┌──────────────┐                     │
│   │   Treasury   │ ──────► │  AMM Swap    │                     │
│   │  (ZOOP fees) │  swap   │  ZOOP→HBAR   │                     │
│   └──────────────┘         └──────────────┘                     │
│                                   │                              │
│                                   ▼                              │
│                            ┌──────────────┐                     │
│                            │ HBAR Reserve │                     │
│                            │  (gas fund)  │                     │
│                            └──────────────┘                     │
│                                   │                              │
│                                   ▼                              │
│                            Pay gas for user                     │
│                            transactions                         │
└─────────────────────────────────────────────────────────────────┘
```

**Reserve management:**

| Task | Description |
|------|-------------|
| Monitor balance | Alert if HBAR reserve drops below threshold |
| Auto-replenish | Swap ZOOP → HBAR when reserve low |
| Fee buffer | Collect slightly more ZOOP than needed (10-20%) to cover volatility |
| Profit option | Keep ZOOP if expecting price appreciation |

---

#### Requirements for on-chain actions

| Requirement | Description |
|-------------|-------------|
| Safe wallet deployed | User's Safe must be active on Hedera |
| ZOOP balance | Sufficient tokens for action + fee |
| No HBAR needed | Backend pays gas from reserve |

---

**Pending users** (Safe not deployed yet):

- Cannot perform on-chain actions
- UI shows "Setting up wallet..." and disables transaction buttons
- See [Pending User Experience](#pending-user-experience) for details

---

## 8. Security Requirements

### Mandatory Security Measures

| Requirement | Implementation |
|-------------|----------------|
| Token Storage | Use expo-secure-store, NEVER AsyncStorage |
| API Auth | JWT Bearer tokens from Privy |
| Input Validation | Validate all inputs (addresses, amounts) |
| Rate Limiting | Per-user limits on transactions |
| Signature Verification | Verify all signed requests server-side |
| No Secrets in App | All sensitive operations via backend |


### Transaction Safety

| Rule | Implementation |
|------|----------------|
| Confirmation | Always show confirmation modal |
| Amount Display | Show amount in token AND USD |
| Address Validation | Validate format before sending |
| Max Limits | Optional per-user transaction limits |
| Rate Limit | Min 5 seconds between transactions |


### Code Quality Standards

| Standard | Requirement |
|----------|-------------|
| TypeScript | Strict mode, no `any` |
| Test Coverage | >80% for critical paths |
| Error Handling | Graceful errors, user-friendly messages |
| Logging | Structured logs, no sensitive data |

---

## 9. Design System

### Figma Reference

**Figma File:** [Web3 Wallet App](https://www.figma.com/design/k29cFyOYzZSNu57rZ3m2L3/Web3-Wallet-app)


### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary (Violet 600) | #7c3aed | Buttons, accents |
| Slate 900 | #0f172a | Text primary |
| Slate 500 | #64748b | Text secondary |
| Slate 100 | #f1f5f9 | Backgrounds |
| Success | #009d69 | Positive values |
| Error | #ee5261 | Errors, negative |


### Typography

| Style | Size | Weight | Class |
|-------|------|--------|-------|
| H1 | 24px | Semibold | text-2xl font-semibold |
| H2 | 20px | Semibold | text-xl font-semibold |
| Body | 15px | Regular | text-[15px] |
| Caption | 11px | Regular | text-[11px] text-slate-500 |


### Components (NativeWind)

**Primary Button:**

```tsx
<TouchableOpacity className="bg-violet-600 px-5 py-3 rounded-lg">
  <Text className="text-white font-semibold text-center">Continue</Text>
</TouchableOpacity>
```


**Card:**

```tsx
<View className="bg-white rounded-xl p-4 shadow-md">
  <Text className="text-lg font-semibold text-slate-900">Title</Text>
</View>
```


**Input:**

```tsx
<TextInput
  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
  placeholder="Enter amount"
/>
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| ZOOP | Native token of the Zoop ecosystem |
| Zoop Points | Off-chain reward points (convertible to ZOOP tokens) |
| ZPY | ZOOP Platform Yield - annual percentage yield from staking |
| Safe Wallet | Smart contract wallet (Safe) deployed for each user |
| Privy | Auth provider with embedded wallet |
| Privy EOA | User's embedded signing key created by Privy |
| Hedera | Layer 1 blockchain (EVM-compatible, primary network) |
| EOA | Externally Owned Account (standard wallet controlled by private key) |
| Meta-transaction | User signs intent, backend submits and pays gas |
| Treasury | Backend-controlled wallet holding tokens for pending users |
| CREATE2 | Deterministic contract deployment (predictable address) |
| ZoopSafeFactory | Our factory contract for deploying user Safe wallets |
| LayerZero | Cross-chain messaging protocol for bridging tokens |
| OFT | Omnichain Fungible Token - LayerZero's token bridging standard |
| ZoopHTSConnector | Hedera contract for ZOOP token with LayerZero bridging |
| ZoopOFT | EVM contract for ZOOP token on Ethereum/BSC |
| HTS | Hedera Token Service - native token standard on Hedera |
| sharedDecimals | Common decimal precision for cross-chain transfers (8) |
| Proxy Contract | Fixed-address contract that delegates calls to an implementation contract |
| Upgradeable Contract | Contract pattern where logic can be updated while address stays the same |
| UUPS | Universal Upgradeable Proxy Standard - upgrade pattern where logic lives in implementation |


## Appendix B: Environment Variables

```env
# Mobile App
EXPO_PUBLIC_PRIVY_APP_ID=xxx
EXPO_PUBLIC_PRIVY_CLIENT_ID=xxx
EXPO_PUBLIC_API_URL=https://api.zoop.app

# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PRIVY_APP_ID=xxx
PRIVY_APP_SECRET=xxx
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e...
HEDERA_TREASURY_ID=0.0.xxxxx
ZOOP_TOKEN_ID=0.0.xxxxx
```

---

**Questions?** Contact the Zoop team for clarification on any requirements.
