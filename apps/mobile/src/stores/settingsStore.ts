/**
 * Settings Store
 * Manages user preferences and app settings with persistence
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

// Expo SecureStore adapter for Zustand
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export type Theme = "light" | "dark" | "system";
export type Currency = "USD" | "EUR" | "GBP" | "CHF";
export type Language = "en" | "fr" | "de" | "es";

interface NotificationSettings {
  pushEnabled: boolean;
  transactionAlerts: boolean;
  stakingRewards: boolean;
  priceAlerts: boolean;
  marketing: boolean;
}

interface PrivacySettings {
  showBalances: boolean;
  showActivity: boolean;
  analyticsEnabled: boolean;
}

interface SecuritySettings {
  biometricEnabled: boolean;
  autoLockMinutes: number;
  hideBalanceOnLock: boolean;
}

interface SettingsState {
  // Display
  theme: Theme;
  currency: Currency;
  language: Language;
  compactMode: boolean;

  // Notifications
  notifications: NotificationSettings;

  // Privacy
  privacy: PrivacySettings;

  // Security
  security: SecuritySettings;

  // Actions
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: Language) => void;
  setCompactMode: (enabled: boolean) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  updateSecurity: (settings: Partial<SecuritySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  theme: "system" as Theme,
  currency: "USD" as Currency,
  language: "en" as Language,
  compactMode: false,
  notifications: {
    pushEnabled: true,
    transactionAlerts: true,
    stakingRewards: true,
    priceAlerts: false,
    marketing: false,
  },
  privacy: {
    showBalances: true,
    showActivity: true,
    analyticsEnabled: true,
  },
  security: {
    biometricEnabled: false,
    autoLockMinutes: 5,
    hideBalanceOnLock: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setCompactMode: (compactMode) => set({ compactMode }),

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updatePrivacy: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      updateSecurity: (settings) =>
        set((state) => ({
          security: { ...state.security, ...settings },
        })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "zoop-settings-store",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

/**
 * Selectors
 */
export const selectTheme = (state: SettingsState) => state.theme;
export const selectCurrency = (state: SettingsState) => state.currency;
export const selectNotificationSettings = (state: SettingsState) => state.notifications;
export const selectPrivacySettings = (state: SettingsState) => state.privacy;
export const selectSecuritySettings = (state: SettingsState) => state.security;
