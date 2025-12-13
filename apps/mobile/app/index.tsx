import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "../src/hooks/useTranslation";
import { useLoginFlow } from "../src/hooks/useLoginFlow";
import { LanguageSelector } from "../src/components/LanguageSelector";
import {
  WelcomeHeader,
  WelcomeVideo,
  WelcomeFooter,
} from "../src/components/welcome";

/**
 * WelcomeScreen - Main entry point for unauthenticated users
 * Following SOLID principles:
 * - Single Responsibility: Orchestrates welcome screen layout
 * - Open/Closed: Components can be swapped without modifying this file
 * - Liskov Substitution: Components follow consistent interfaces
 * - Interface Segregation: Each component only receives what it needs
 * - Dependency Inversion: Depends on abstractions (hooks) not implementations
 */
export default function WelcomeScreen() {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Translations
  const { t } = useTranslation();

  // Login flow hook handles all auth logic
  const { isLoggingIn, handleLogin } = useLoginFlow({
    errorTitle: t("auth.loginError"),
  });

  return (
    <View className="flex-1">
      {/* Background Gradient - Purple/Violet tones matching Figma */}
      <LinearGradient
        colors={["#7C3AED", "#8B5CF6", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Header with logo, language selector, and welcome text */}
        <WelcomeHeader
          title={t("welcome.title")}
          subtitle={t("welcome.subtitle")}
          languageLabel={t("common.language")}
          onLanguagePress={() => setShowLanguageSelector(true)}
        />

        {/* Video animation */}
        <WelcomeVideo />

        {/* Footer with CTA button and legal text */}
        <WelcomeFooter
          buttonText={t("welcome.continueButton")}
          poweredByText={t("welcome.poweredBy")}
          terms={{
            prefix: t("welcome.terms.prefix"),
            termsAndConditions: t("welcome.terms.termsAndConditions"),
            privacyPolicy: t("welcome.terms.privacyPolicy"),
            communityGuidelines: t("welcome.terms.communityGuidelines"),
          }}
          isLoading={isLoggingIn}
          onContinue={handleLogin}
        />
      </SafeAreaView>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </View>
  );
}
