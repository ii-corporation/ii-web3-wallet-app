# Zoop Mobile App Design System

Design tokens and styling guide extracted from Figma using **NativeWind (Tailwind CSS for React Native)**.

**Figma Source:** [Web3 Wallet App](https://www.figma.com/design/k29cFyOYzZSNu57rZ3m2L3/Web3-Wallet-app)

---

## Styling Approach: NativeWind

The Figma design uses **Tailwind CSS colors** (specifically the Slate palette). We'll use **NativeWind** to bring Tailwind's utility-first approach to React Native.

### Why NativeWind?

1. **Figma uses Tailwind colors** - Direct 1:1 mapping, no conversion needed
2. **Utility-first** - Faster development with inline styles
3. **Familiar syntax** - Same as Tailwind CSS for web
4. **TypeScript support** - Full autocomplete
5. **Dark mode** - Built-in support

---

## Installation

```bash
# Install NativeWind and dependencies
npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# Initialize Tailwind config
npx tailwindcss init
```

### Configure `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary (Violet from Tailwind + custom)
        primary: {
          50: '#f5f3ff',
          100: '#f5f3ff',
          200: '#ddd6fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Accent colors (custom)
        accent: {
          lime: '#f1fc70',
          mint: '#27e7c4',
          coral: '#f55b7a',
          lavender: '#9b74f6',
        },
        // Semantic
        success: '#009d69',
        error: '#ee5261',
        warning: '#f5b35b',
        // Dark mode background
        'dark-bg': '#111322',
      },
      fontFamily: {
        'inter': ['Inter'],
        'clash': ['ClashGrotesk'],
      },
    },
  },
  plugins: [],
};
```

### Configure `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### Configure `metro.config.js`

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### Create `global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Update `app/_layout.tsx` (Expo Router)

```tsx
import '../global.css';

export default function RootLayout() {
  // ...
}
```

---

## Color Palette

### Neutral Colors (Tailwind Slate - EXACT MATCH)

The Figma design uses Tailwind's **Slate** palette:

| Figma Name | NativeWind Class | Hex |
|------------|------------------|-----|
| Gray 50 | `bg-slate-50` | `#f8fafc` |
| Gray 100 | `bg-slate-100` | `#f1f5f9` |
| Gray 200 | `bg-slate-200` | `#e2e8f0` |
| Gray 300 | `bg-slate-300` | `#cbd5e1` |
| Gray 400 | `bg-slate-400` | `#94a3b8` |
| Gray 500 | `bg-slate-500` | `#64748b` |
| Gray 600 | `bg-slate-600` | `#475569` |
| Gray 700 | `bg-slate-700` | `#334155` |
| Gray 800 | `bg-slate-800` | `#1e293b` |
| Gray 900 | `bg-slate-900` | `#0f172a` |
| Gray 950 | `bg-slate-950` | `#020617` |

### Primary Colors (Tailwind Violet)

| Figma Name | NativeWind Class | Hex |
|------------|------------------|-----|
| Primary 100 | `bg-violet-100` | `#f5f3ff` |
| Primary 200 | `bg-violet-200` | `#ddd6fe` |
| Primary 400 | `bg-violet-400` | `#a78bfa` |
| Primary 500 | `bg-violet-500` | `#8b5cf6` |
| Primary 600 | `bg-violet-600` | `#7c3aed` |

### Semantic Colors

| Name | NativeWind Class | Hex |
|------|------------------|-----|
| Success | `text-success` / `bg-success` | `#009d69` |
| Error | `text-error` / `bg-error` | `#ee5261` |
| Warning | `text-warning` / `bg-warning` | `#f5b35b` |

### Accent Colors

| Name | NativeWind Class | Hex |
|------|------------------|-----|
| Lime | `bg-accent-lime` | `#f1fc70` |
| Mint | `bg-accent-mint` | `#27e7c4` |
| Coral | `bg-accent-coral` | `#f55b7a` |
| Lavender | `bg-accent-lavender` | `#9b74f6` |

### Base Colors

| Name | NativeWind Class | Hex |
|------|------------------|-----|
| White | `bg-white` | `#ffffff` |
| Black | `bg-slate-900` | `#0f172a` |
| Dark BG | `bg-dark-bg` | `#111322` |

---

## Typography

### Font Family

```tsx
// Headings & emphasis
<Text className="font-inter font-semibold">Heading</Text>

// Special display text
<Text className="font-clash">Display</Text>
```

### Text Styles

#### Headings

| Style | NativeWind Classes |
|-------|-------------------|
| H1 (24px) | `text-2xl font-semibold text-slate-900 leading-[30px]` |
| H2 (20px) | `text-xl font-semibold text-slate-900 leading-6` |
| H3 (18px) | `text-lg font-semibold text-slate-900 leading-6` |
| H4 (16px) | `text-base font-semibold text-slate-900 leading-[22px]` |
| H5 (14px) | `text-sm font-semibold text-slate-900 leading-[18px]` |

#### Body Text

| Style | NativeWind Classes |
|-------|-------------------|
| Body Large | `text-[17px] font-normal text-slate-700 leading-[22px]` |
| Body Medium | `text-[15px] font-normal text-slate-700 leading-5` |
| Body Small | `text-[13px] font-normal text-slate-700 leading-[18px]` |

#### Caption

| Style | NativeWind Classes |
|-------|-------------------|
| Caption | `text-[11px] font-normal text-slate-500 leading-[14px] tracking-[0.22px]` |
| Caption Small | `text-[9px] font-normal text-slate-500 leading-3` |

---

## Gradients

NativeWind doesn't support gradients natively. Use `expo-linear-gradient`:

```tsx
import { LinearGradient } from 'expo-linear-gradient';

// Primary Gradient
<LinearGradient
  colors={['#9c2cf3', '#3a6ff9']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  className="rounded-lg p-4"
>
  <Text className="text-white font-semibold">Gradient Button</Text>
</LinearGradient>

// Coin/Token Gradient
<LinearGradient
  colors={['#727ded', '#9a53f9']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
/>
```

---

## Shadows / Elevation

```tsx
// Elevation 100 (subtle)
<View className="shadow-sm shadow-black/[0.03]" />

// Elevation 200 (cards)
<View className="shadow-md shadow-black/[0.06]" />

// Elevation Modal
<View className="shadow-xl shadow-slate-900/30" />
```

For more control, use custom shadows in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    boxShadow: {
      'elevation-100': '0 4px 20px rgba(0, 0, 0, 0.03)',
      'elevation-200': '0 4px 20px rgba(0, 0, 0, 0.06)',
      'elevation-modal': '0 4px 20px rgba(15, 23, 42, 0.06), 0 4px 112px rgba(15, 23, 42, 0.3)',
    },
  },
},
```

---

## Spacing

NativeWind uses Tailwind's spacing scale (base 4px):

| Token | Class | Value |
|-------|-------|-------|
| 1 | `p-1` | 4px |
| 2 | `p-2` | 8px |
| 3 | `p-3` | 12px |
| 4 | `p-4` | 16px |
| 5 | `p-5` | 20px |
| 6 | `p-6` | 24px |
| 8 | `p-8` | 32px |
| 10 | `p-10` | 40px |
| 12 | `p-12` | 48px |

---

## Border Radius

| Token | Class | Value |
|-------|-------|-------|
| sm | `rounded-sm` | 2px |
| default | `rounded` | 4px |
| md | `rounded-md` | 6px |
| lg | `rounded-lg` | 8px |
| xl | `rounded-xl` | 12px |
| 2xl | `rounded-2xl` | 16px |
| 3xl | `rounded-3xl` | 24px |
| full | `rounded-full` | 9999px |

---

## Component Examples

### Button - Primary

```tsx
<TouchableOpacity className="bg-violet-600 px-5 py-3 rounded-lg active:bg-violet-700">
  <Text className="text-white font-semibold text-center">Continue</Text>
</TouchableOpacity>
```

### Button - Secondary

```tsx
<TouchableOpacity className="bg-violet-100 px-5 py-3 rounded-lg active:bg-violet-200">
  <Text className="text-violet-600 font-semibold text-center">Cancel</Text>
</TouchableOpacity>
```

### Button - Outline

```tsx
<TouchableOpacity className="border border-violet-600 px-5 py-3 rounded-lg active:bg-violet-50">
  <Text className="text-violet-600 font-semibold text-center">Learn More</Text>
</TouchableOpacity>
```

### Button - Gradient

```tsx
import { LinearGradient } from 'expo-linear-gradient';

<TouchableOpacity>
  <LinearGradient
    colors={['#9c2cf3', '#3a6ff9']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    className="px-5 py-3 rounded-lg"
  >
    <Text className="text-white font-semibold text-center">Get Started</Text>
  </LinearGradient>
</TouchableOpacity>
```

### Card

```tsx
<View className="bg-white rounded-xl p-4 shadow-md shadow-black/[0.06]">
  <Text className="text-lg font-semibold text-slate-900">Card Title</Text>
  <Text className="text-sm text-slate-600 mt-1">Card description</Text>
</View>
```

### Input

```tsx
<TextInput
  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm"
  placeholder="Enter amount"
  placeholderTextColor="#94a3b8"
/>

// Focused state (handle with state)
<TextInput
  className="bg-slate-50 border border-violet-500 rounded-lg px-4 py-3 text-slate-900 text-sm"
/>

// Error state
<TextInput
  className="bg-slate-50 border border-error rounded-lg px-4 py-3 text-slate-900 text-sm"
/>
```

### Balance Card

```tsx
<View className="bg-white rounded-2xl p-5 shadow-md shadow-black/[0.06]">
  <Text className="text-sm text-slate-500">Total Balance</Text>
  <Text className="text-3xl font-bold text-slate-900 mt-1">$1,234.56</Text>
  <View className="flex-row items-center mt-2">
    <Text className="text-success text-sm font-medium">+5.2%</Text>
    <Text className="text-slate-400 text-sm ml-1">today</Text>
  </View>
</View>
```

### Transaction Item

```tsx
<View className="flex-row items-center py-3 border-b border-slate-100">
  <View className="w-10 h-10 rounded-full bg-violet-100 items-center justify-center">
    <ArrowUpIcon className="w-5 h-5 text-violet-600" />
  </View>
  <View className="flex-1 ml-3">
    <Text className="text-sm font-semibold text-slate-900">Sent ZOOP</Text>
    <Text className="text-xs text-slate-500">To 0x1234...5678</Text>
  </View>
  <View className="items-end">
    <Text className="text-sm font-semibold text-slate-900">-150 ZOOP</Text>
    <Text className="text-xs text-slate-500">$12.50</Text>
  </View>
</View>
```

### Creator Card (Staking)

```tsx
<View className="bg-white rounded-xl overflow-hidden shadow-md shadow-black/[0.06]">
  <Image source={{ uri: creatorImage }} className="w-full h-32" />
  <View className="p-4">
    <Text className="text-base font-semibold text-slate-900">{creatorName}</Text>
    <Text className="text-sm text-slate-500 mt-1">{category}</Text>
    <View className="flex-row items-center justify-between mt-3">
      <View>
        <Text className="text-xs text-slate-400">APY</Text>
        <Text className="text-sm font-semibold text-success">{apy}%</Text>
      </View>
      <TouchableOpacity className="bg-violet-600 px-4 py-2 rounded-lg">
        <Text className="text-white text-sm font-semibold">Stake</Text>
      </TouchableOpacity>
    </View>
  </View>
</View>
```

---

## Dark Mode

### Setup

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' for system preference
  // ...
};
```

### Usage

```tsx
// Automatically adapts to dark mode
<View className="bg-white dark:bg-slate-800">
  <Text className="text-slate-900 dark:text-white">Hello</Text>
</View>
```

### Dark Mode Colors

| Element | Light | Dark |
|---------|-------|------|
| Background | `bg-white` | `dark:bg-dark-bg` |
| Surface | `bg-slate-50` | `dark:bg-slate-800` |
| Text Primary | `text-slate-900` | `dark:text-white` |
| Text Secondary | `text-slate-600` | `dark:text-slate-300` |
| Border | `border-slate-200` | `dark:border-slate-700` |

---

## Reusable Style Classes

Create custom utility classes for common patterns:

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-violet-600 px-5 py-3 rounded-lg active:bg-violet-700;
  }

  .btn-secondary {
    @apply bg-violet-100 px-5 py-3 rounded-lg active:bg-violet-200;
  }

  .card {
    @apply bg-white rounded-xl p-4 shadow-md shadow-black/[0.06];
  }

  .input {
    @apply bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm;
  }

  .heading-1 {
    @apply text-2xl font-semibold text-slate-900 leading-[30px];
  }

  .heading-2 {
    @apply text-xl font-semibold text-slate-900 leading-6;
  }

  .body-text {
    @apply text-[15px] font-normal text-slate-700 leading-5;
  }

  .caption {
    @apply text-[11px] font-normal text-slate-500 leading-[14px];
  }
}
```

Usage:

```tsx
<TouchableOpacity className="btn-primary">
  <Text className="text-white font-semibold text-center">Submit</Text>
</TouchableOpacity>

<View className="card">
  <Text className="heading-2">Card Title</Text>
  <Text className="body-text mt-2">Description here</Text>
</View>
```

---

## Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root layout (import global.css here)
│   ├── index.tsx           # Home screen
│   ├── (tabs)/             # Tab navigator
│   └── (auth)/             # Auth screens
├── components/
│   ├── ui/                 # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Text.tsx
│   ├── wallet/             # Wallet-specific components
│   ├── staking/            # Staking components
│   └── common/             # Shared components
├── global.css              # Tailwind imports + custom classes
└── tailwind.config.js      # Tailwind configuration
```

---

## TypeScript Support

Create type-safe className helper:

```tsx
// src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
import { cn } from '@/lib/cn';

<View className={cn(
  "p-4 rounded-lg",
  isActive && "bg-violet-100",
  isDisabled && "opacity-50"
)} />
```

Install dependencies:

```bash
npm install clsx tailwind-merge
```

---

## Summary

| Aspect | Choice |
|--------|--------|
| Styling | NativeWind (Tailwind for RN) |
| Colors | Tailwind Slate + Violet + Custom |
| Typography | Inter (primary), Clash Grotesk (display) |
| Spacing | Tailwind 4px base scale |
| Icons | lucide-react-native or expo/vector-icons |
| Gradients | expo-linear-gradient |
| Dark Mode | NativeWind `dark:` prefix |

---

**Last Updated:** December 2025
**Figma:** Web3 Wallet App
**Framework:** React Native + Expo + NativeWind
