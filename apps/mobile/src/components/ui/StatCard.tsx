import { View, Text, Pressable, StyleProp, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { Card } from "./Card";
import { GradientText } from "./GradientText";
import { HelpIcon } from "../icons";
import { cn } from "../../lib/cn";

type StatCardSize = "sm" | "md" | "lg";
type StatCardLayout = "vertical" | "horizontal";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  size?: StatCardSize;
  layout?: StatCardLayout;
  showHelpIcon?: boolean;
  onHelpPress?: () => void;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  formatValue?: boolean;
}

const sizeConfig: Record<StatCardSize, {
  labelSize: number;
  labelLineHeight: number;
  valueSize: number;
  valueLineHeight: number;
  padding: { vertical: number; horizontal: number };
  gap: number;
  helpIconSize: number;
}> = {
  sm: {
    labelSize: 11,
    labelLineHeight: 14,
    valueSize: 16,
    valueLineHeight: 22,
    padding: { vertical: 12, horizontal: 0 },
    gap: 4,
    helpIconSize: 14,
  },
  md: {
    labelSize: 13,
    labelLineHeight: 18,
    valueSize: 20,
    valueLineHeight: 26,
    padding: { vertical: 16, horizontal: 12 },
    gap: 4,
    helpIconSize: 16,
  },
  lg: {
    labelSize: 14,
    labelLineHeight: 18,
    valueSize: 24,
    valueLineHeight: 30,
    padding: { vertical: 20, horizontal: 12 },
    gap: 4,
    helpIconSize: 16,
  },
};

/**
 * StatCard - A unified component for displaying statistics
 *
 * Replaces:
 * - EarningsStatCard
 * - StakeStatCard
 * - Similar stat display patterns
 *
 * @example
 * // Basic usage
 * <StatCard label="Total staked" value="8,300" />
 *
 * @example
 * // With help icon
 * <StatCard
 *   label="Estimated ZPY"
 *   value="5.75%"
 *   showHelpIcon
 *   onHelpPress={() => showTooltip()}
 * />
 *
 * @example
 * // With custom icon
 * <StatCard
 *   label="ZOOP Points"
 *   value={2358}
 *   icon={<ZoopPointsIcon size={24} />}
 *   layout="horizontal"
 *   size="lg"
 * />
 */
export function StatCard({
  label,
  value,
  icon,
  size = "md",
  layout = "vertical",
  showHelpIcon = false,
  onHelpPress,
  onPress,
  className,
  style,
  formatValue = false,
}: StatCardProps) {
  const config = sizeConfig[size];

  // Format number with commas if requested
  const displayValue = formatValue && typeof value === "number"
    ? value.toLocaleString()
    : String(value);

  const content = (
    <View
      className={cn(
        "items-center justify-center",
        layout === "horizontal" && "flex-row"
      )}
      style={{ gap: config.gap }}
    >
      {/* Icon (for horizontal layout) */}
      {icon && layout === "horizontal" && (
        <View
          className="rounded-full bg-primary-100 items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          {icon}
        </View>
      )}

      {/* Label row */}
      <View className="flex-row items-center" style={{ gap: 2 }}>
        {icon && layout === "vertical" && icon}
        <Text
          className="text-slate-500 font-normal"
          style={{
            fontSize: config.labelSize,
            lineHeight: config.labelLineHeight,
          }}
        >
          {label}
        </Text>
        {showHelpIcon && (
          <Pressable onPress={onHelpPress} hitSlop={8}>
            <HelpIcon size={config.helpIconSize} color="#64748B" />
          </Pressable>
        )}
      </View>

      {/* Value */}
      <GradientText
        className="font-semibold"
        style={{
          fontSize: config.valueSize,
          lineHeight: config.valueLineHeight,
        }}
      >
        {displayValue}
      </GradientText>
    </View>
  );

  return (
    <Card
      variant="subtle"
      onPress={onPress}
      className={cn("flex-1 rounded-lg", className)}
      style={[
        {
          paddingVertical: config.padding.vertical,
          paddingHorizontal: config.padding.horizontal,
        },
        style,
      ]}
    >
      {content}
    </Card>
  );
}
