import { View, Text, Image, Platform } from "react-native";
import { Button } from "../ui/Button";

interface TermsTranslations {
  prefix: string;
  termsAndConditions: string;
  privacyPolicy: string;
  communityGuidelines: string;
}

interface WelcomeFooterProps {
  buttonText: string;
  poweredByText: string;
  terms: TermsTranslations;
  isLoading: boolean;
  onContinue: () => void;
}

/**
 * WelcomeFooter - Bottom section with CTA button and legal text
 * Single Responsibility: Display action button and footer content
 */
export function WelcomeFooter({
  buttonText,
  poweredByText,
  terms,
  isLoading,
  onContinue,
}: WelcomeFooterProps) {
  return (
    <View
      className={`px-4 gap-4 ${Platform.OS === "ios" ? "pb-2" : "pb-4"}`}
    >
      {/* Continue Button - Secondary style from Figma */}
      <Button
        type="secondary"
        brand="zoop"
        size="large"
        onPress={onContinue}
        disabled={isLoading}
        loading={isLoading}
      >
        {buttonText}
      </Button>

      {/* Footer Section */}
      <View className="gap-4 items-center">
        {/* Terms */}
        <Text className="text-xs text-violet-100 leading-[18px] text-center">
          {terms.prefix}
          <Text className="underline">{terms.termsAndConditions}</Text>
          ,{" "}
          <Text className="underline">{terms.privacyPolicy}</Text>
          ,{" "}
          <Text className="underline">{terms.communityGuidelines}</Text>
          .
        </Text>

        {/* Powered by Hedera */}
        <View className="flex-row items-center justify-center gap-1.5">
          <Text className="text-xs text-violet-100 opacity-80">
            {poweredByText}
          </Text>
          <Image
            source={require("../../../assets/images/hedera-logo.png")}
            className="w-[120px] h-4 opacity-80"
            style={{ tintColor: "#EDE9FE" }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
