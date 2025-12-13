import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, {
  type SupportedLanguage,
  SUPPORTED_LANGUAGES,
  getDeviceLocale,
} from "../localization/i18n";

interface LanguageState {
  // Current language
  language: SupportedLanguage;
  // Whether user has explicitly set a language (vs using device default)
  isManuallySet: boolean;

  // Actions
  setLanguage: (language: SupportedLanguage) => void;
  resetToDeviceLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: (getDeviceLocale() as SupportedLanguage) || "en",
      isManuallySet: false,

      setLanguage: (language: SupportedLanguage) => {
        if (Object.keys(SUPPORTED_LANGUAGES).includes(language)) {
          i18n.locale = language;
          set({ language, isManuallySet: true });
        }
      },

      resetToDeviceLanguage: () => {
        const deviceLocale = getDeviceLocale();
        const supportedLocale = Object.keys(SUPPORTED_LANGUAGES).includes(
          deviceLocale
        )
          ? (deviceLocale as SupportedLanguage)
          : "en";
        i18n.locale = supportedLocale;
        set({ language: supportedLocale, isManuallySet: false });
      },
    }),
    {
      name: "zoop-language-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When store is rehydrated, sync i18n locale
        if (state?.language) {
          i18n.locale = state.language;
        }
      },
    }
  )
);

// Selectors
export const selectLanguage = (state: LanguageState) => state.language;
export const selectIsManuallySet = (state: LanguageState) => state.isManuallySet;
