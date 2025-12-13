import { View, Text, Pressable, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PRIMARY_GRADIENT } from "../../theme";
import { GradientText } from "./GradientText";
import { cn } from "../../lib/cn";

interface Tab<T extends string> {
  key: T;
  label: string;
  badge?: number | string;
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md" | "lg";
}

interface TabItemProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  badge?: number | string;
  size: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    height: 40,
    fontSize: 12,
    lineHeight: 16,
    indicatorHeight: 2,
    paddingHorizontal: 8,
  },
  md: {
    height: 48,
    fontSize: 13,
    lineHeight: 18,
    indicatorHeight: 3,
    paddingHorizontal: 8,
  },
  lg: {
    height: 56,
    fontSize: 14,
    lineHeight: 20,
    indicatorHeight: 4,
    paddingHorizontal: 12,
  },
};

function TabItem({ label, isActive, onPress, badge, size }: TabItemProps) {
  const config = sizeConfig[size];

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-end"
      style={{ paddingHorizontal: config.paddingHorizontal, height: config.height }}
    >
      <View className="items-center w-full" style={{ gap: 6 }}>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          {isActive ? (
            <GradientText
              className="font-semibold"
              style={{ fontSize: config.fontSize, lineHeight: config.lineHeight }}
            >
              {label}
            </GradientText>
          ) : (
            <Text
              className="font-normal text-slate-600"
              style={{ fontSize: config.fontSize, lineHeight: config.lineHeight }}
            >
              {label}
            </Text>
          )}
          {badge !== undefined && (
            <View
              className={cn(
                "rounded-full px-1.5 py-0.5",
                isActive ? "bg-primary-100" : "bg-slate-200"
              )}
            >
              <Text
                className={cn(
                  "font-medium",
                  isActive ? "text-primary-600" : "text-slate-600"
                )}
                style={{ fontSize: 10, lineHeight: 12 }}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>
        <View className="w-full px-2" style={{ opacity: isActive ? 1 : 0 }}>
          <LinearGradient
            colors={PRIMARY_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: config.indicatorHeight,
              borderRadius: config.indicatorHeight / 2,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}

/**
 * TabBar - A reusable tab navigation component
 *
 * Features:
 * - Gradient active indicator
 * - Gradient text for active tab
 * - Optional badge support
 * - Multiple sizes
 * - Type-safe tab keys
 *
 * @example
 * // Basic usage
 * const tabs = [
 *   { key: "explore", label: "Explore" },
 *   { key: "my-stakes", label: "My Stakes" },
 * ];
 * <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
 *
 * @example
 * // With badges
 * const tabs = [
 *   { key: "discover", label: "Discover", badge: 12 },
 *   { key: "collected", label: "Collected", badge: 3 },
 * ];
 * <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} size="lg" />
 */
export function TabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  style,
  size = "md",
}: TabBarProps<T>) {
  return (
    <View
      className={cn("flex-row items-end", className)}
      style={[{ paddingHorizontal: 4 }, style]}
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.key}
          label={tab.label}
          isActive={activeTab === tab.key}
          onPress={() => onTabChange(tab.key)}
          badge={tab.badge}
          size={size}
        />
      ))}
    </View>
  );
}
