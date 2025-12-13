import { useCallback } from "react";
import i18n, { SUPPORTED_LANGUAGES, type SupportedLanguage } from "../localization/i18n";
import { useLanguageStore } from "../stores/languageStore";

/**
 * Hook for using translations in components
 * Automatically re-renders when language changes
 */
export function useTranslation() {
  // Subscribe to language changes to trigger re-renders
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const resetToDeviceLanguage = useLanguageStore(
    (state) => state.resetToDeviceLanguage
  );
  const isManuallySet = useLanguageStore((state) => state.isManuallySet);

  // Translation function
  const t = useCallback(
    (key: string, options?: object): string => {
      return i18n.t(key, options);
    },
    [language] // Re-create when language changes
  );

  // Get available languages
  const getAvailableLanguages = useCallback(() => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
      code: code as SupportedLanguage,
      ...info,
    }));
  }, []);

  // Get current language info
  const getCurrentLanguageInfo = useCallback(() => {
    return {
      code: language,
      ...SUPPORTED_LANGUAGES[language],
    };
  }, [language]);

  return {
    t,
    language,
    setLanguage,
    resetToDeviceLanguage,
    isManuallySet,
    getAvailableLanguages,
    getCurrentLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

export default useTranslation;
