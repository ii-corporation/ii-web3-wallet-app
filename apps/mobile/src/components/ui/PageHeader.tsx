import { View, Text, Pressable, StyleProp, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { BackIcon, SearchIcon } from "../icons";
import { shadows } from "../../theme";
import { cn } from "../../lib/cn";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  rightContent?: ReactNode;
  children?: ReactNode; // For tabs or other content below title
  className?: string;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "blur";
}

/**
 * PageHeader - A reusable page header component
 *
 * Features:
 * - Optional back button
 * - Optional search button
 * - Custom right content (token balance, etc.)
 * - Support for child content (tabs)
 * - Blur variant for floating headers
 *
 * @example
 * // Simple header
 * <PageHeader title="Rewards" showSearch />
 *
 * @example
 * // With back button and custom right content
 * <PageHeader
 *   title="Gift Cards"
 *   showBack
 *   rightContent={<TokenBalance value="2,358" />}
 * />
 *
 * @example
 * // With tabs
 * <PageHeader title="Staking" showSearch variant="blur">
 *   <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
 * </PageHeader>
 */
export function PageHeader({
  title,
  showBack = false,
  showSearch = false,
  onBack,
  onSearch,
  rightContent,
  children,
  className,
  style,
  variant = "default",
}: PageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const content = (
    <>
      {/* Header row */}
      <View
        className="flex-row items-center justify-between"
        style={{
          height: 48,
          paddingLeft: showBack ? 4 : 16,
          paddingRight: rightContent || showSearch ? 4 : 16,
        }}
      >
        {/* Left: Back button and/or title */}
        <View className="flex-row items-center" style={{ gap: showBack ? 4 : 0 }}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              hitSlop={8}
              className="items-center justify-center"
              style={{ width: 40, height: 40 }}
            >
              <BackIcon size={24} color="#1E293B" />
            </Pressable>
          )}
          <Text
            className={cn(
              "font-semibold text-slate-800",
              showBack ? "text-xl" : "text-2xl"
            )}
            style={{ lineHeight: showBack ? 26 : 30 }}
          >
            {title}
          </Text>
        </View>

        {/* Right: Custom content and/or search */}
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {rightContent}
          {showSearch && (
            <Pressable
              onPress={onSearch}
              className="items-center justify-center"
              style={{ width: showBack ? 40 : 48, height: showBack ? 40 : 48 }}
              hitSlop={8}
            >
              <SearchIcon size={20} color="#475569" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Optional child content (tabs, etc.) */}
      {children}
    </>
  );

  if (variant === "blur") {
    return (
      <BlurView
        intensity={80}
        tint="light"
        className={cn(className)}
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: "rgba(248, 250, 252, 0.8)",
            ...shadows.header,
          },
          style,
        ]}
      >
        <SafeAreaView edges={["top"]}>
          {content}
        </SafeAreaView>
      </BlurView>
    );
  }

  return (
    <View
      className={cn("bg-white", className)}
      style={[shadows.header, style]}
    >
      <SafeAreaView edges={["top"]}>
        {content}
      </SafeAreaView>
    </View>
  );
}

/**
 * TokenBalance - A helper component for displaying token balance in header
 */
interface TokenBalanceProps {
  value: string | number;
  icon?: ReactNode;
}

export function TokenBalance({ value, icon }: TokenBalanceProps) {
  const { RewardIcon } = require("../icons");
  const { GradientText } = require("./GradientText");

  return (
    <View
      className="flex-row items-center bg-slate-100 rounded-full"
      style={{ paddingHorizontal: 10, paddingVertical: 6, gap: 4 }}
    >
      {icon || <RewardIcon size={16} color="#AD42FF" />}
      <GradientText
        className="font-semibold"
        style={{ fontSize: 14, lineHeight: 18 }}
      >
        {value}
      </GradientText>
    </View>
  );
}
