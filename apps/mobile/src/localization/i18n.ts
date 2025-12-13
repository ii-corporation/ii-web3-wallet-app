import { I18n } from "i18n-js";
import * as Localization from "expo-localization";

// Import translations
import en from "./locales/en";
import fr from "./locales/fr";

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: "English", nativeName: "English", flag: "\ud83c\uddec\ud83c\udde7" },
  fr: { name: "French", nativeName: "Fran\u00e7ais", flag: "\ud83c\uddeb\ud83c\uddf7" },
  // Add more languages as needed:
  // es: { name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  // de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Create i18n instance
const i18n = new I18n({
  en,
  fr,
});

// Set default locale based on device
const deviceLocale = Localization.getLocales()[0]?.languageCode ?? "en";

// Check if device locale is supported, fallback to English
i18n.defaultLocale = "en";
i18n.locale = Object.keys(SUPPORTED_LANGUAGES).includes(deviceLocale)
  ? deviceLocale
  : "en";

// Enable fallback to default locale
i18n.enableFallback = true;

// Export translation function
export const t = (key: string, options?: object) => i18n.t(key, options);

// Export locale getter/setter
export const getLocale = () => i18n.locale;

export const setLocale = (locale: SupportedLanguage) => {
  if (Object.keys(SUPPORTED_LANGUAGES).includes(locale)) {
    i18n.locale = locale;
    return true;
  }
  return false;
};

// Get device locale
export const getDeviceLocale = () => {
  const locales = Localization.getLocales();
  return locales[0]?.languageCode ?? "en";
};

// Check if RTL language
export const isRTL = () => {
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  return rtlLanguages.includes(i18n.locale);
};

export default i18n;
