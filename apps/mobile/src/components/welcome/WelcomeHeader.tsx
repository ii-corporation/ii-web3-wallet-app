import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface WelcomeHeaderProps {
  title: string;
  subtitle: string;
  languageLabel: string;
  onLanguagePress: () => void;
}

/**
 * WelcomeHeader - Top section of the welcome screen
 * Contains logo, language selector, and welcome text
 * Single Responsibility: Display header content and handle language selection trigger
 */
export function WelcomeHeader({
  title,
  subtitle,
  languageLabel,
  onLanguagePress,
}: WelcomeHeaderProps) {
  return (
    <View>
      {/* Top Bar - Logo and Language Selector */}
      <View className="flex-row justify-between items-center px-4 pt-2 pb-4">
        {/* ZOOP Logo */}
        <Image
          source={require("../../../assets/images/zoop-logo.png")}
          className="w-20 h-8"
          style={{ tintColor: "#FFFFFF" }}
          resizeMode="contain"
        />

        {/* Language Selector Button */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5"
          onPress={onLanguagePress}
          activeOpacity={0.7}
        >
          <Feather name="globe" size={18} color="#FFFFFF" />
          <Text className="text-base font-medium text-slate-100">
            {languageLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Text */}
      <View className="px-4 pt-6 gap-2">
        <Text className="text-2xl font-semibold text-slate-50 leading-8">
          {title}
        </Text>
        <Text className="text-base text-slate-200 leading-relaxed">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
