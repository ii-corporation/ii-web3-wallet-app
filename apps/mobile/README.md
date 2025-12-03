# Zoop Mobile App

React Native mobile application built with Expo and NativeWind.

## Tech Stack

- **Framework**: [Expo](https://expo.dev) (SDK 53)
- **Styling**: [NativeWind](https://nativewind.dev) v4 (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State**: Zustand + React Query
- **Auth**: Privy React Native SDK

## Getting Started

### Prerequisites

- Bun v1.2+
- iOS Simulator (macOS) or Android Emulator
- [Expo Go](https://expo.dev/client) app for physical device testing

### Setup

```bash
# From monorepo root
bun install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start Expo dev server
bun start

# Or with cache clear
bun start -c
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go for physical device

## Project Structure

```
apps/mobile/
├── App.tsx                 # App entry point
├── app/                    # Expo Router screens (file-based routing)
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── index.tsx       # Home/Dashboard
│   │   ├── wallet.tsx      # Wallet & transactions
│   │   ├── staking.tsx     # Staking pools
│   │   └── settings.tsx    # User settings
│   ├── _layout.tsx         # Root layout
│   └── auth/               # Authentication screens
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base components (Button, Card, Input)
│   │   ├── wallet/         # Wallet-specific components
│   │   └── staking/        # Staking-specific components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Privy authentication
│   │   ├── useBalance.ts   # Token balances
│   │   └── useStaking.ts   # Staking operations
│   ├── services/           # External service clients
│   │   ├── api.ts          # Backend API client
│   │   └── blockchain.ts   # Viem/blockchain interactions
│   ├── stores/             # Zustand state stores
│   │   ├── auth.ts         # Auth state
│   │   └── wallet.ts       # Wallet state
│   └── utils/              # Helper functions
├── assets/                 # Images, fonts, icons
├── global.css              # Tailwind global styles
├── tailwind.config.js      # Tailwind/NativeWind config
├── metro.config.js         # Metro bundler config
└── app.json                # Expo configuration
```

## Styling with NativeWind

NativeWind allows using Tailwind CSS classes in React Native:

```tsx
import { View, Text } from 'react-native';

export function Card({ title, children }) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <Text className="text-lg font-semibold text-slate-900">{title}</Text>
      {children}
    </View>
  );
}
```

### Design System Colors

Defined in `tailwind.config.js`:

| Color | Usage |
|-------|-------|
| `primary-500` | Primary brand (violet) |
| `success` | Positive states (#009d69) |
| `error` | Error states (#ee5261) |
| `lime` | Accent color (#f1fc70) |
| `mint` | Secondary accent (#27e7c4) |
| `bg-dark` | Dark background (#111322) |

## Environment Variables

All mobile env vars must be prefixed with `EXPO_PUBLIC_`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_PRIVY_APP_ID=your_app_id
EXPO_PUBLIC_HEDERA_RPC_URL=https://testnet.hashio.io/api
```

Access in code:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun start` | Start Expo dev server |
| `bun start -c` | Start with cache clear |
| `bun run ios` | Run on iOS Simulator |
| `bun run android` | Run on Android Emulator |
| `bun run build` | Create production build |

## Key Features

### Authentication (Privy)
- Social login (Google, Apple, Email)
- Embedded wallet creation
- Session management

### Wallet
- View ZOOP balance (Hedera + BSC)
- Send/receive tokens
- Transaction history
- QR code scanning

### Staking
- View available pools
- Stake/unstake tokens
- Claim rewards
- Auto-compound toggle

### Bridge
- Cross-chain transfers (Hedera <-> BSC)
- LayerZero OFT integration
- Fee estimation

## Troubleshooting

### Metro bundler issues
```bash
# Clear all caches
bunx expo start -c
```

### NativeWind styles not applying
1. Ensure `global.css` is imported in `App.tsx`
2. Check `tailwind.config.js` content paths
3. Restart Metro bundler

### Expo Go compatibility
Some native modules require development builds:
```bash
bunx expo prebuild
bunx expo run:ios  # or run:android
```
