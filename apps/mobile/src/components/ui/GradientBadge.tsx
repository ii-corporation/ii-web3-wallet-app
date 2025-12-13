import { Text, StyleProp, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { PRIMARY_GRADIENT } from "../../theme";
import { cn } from "../../lib/cn";

type BadgeSize = "sm" | "md" | "lg";
type BadgeVariant = "filled" | "subtle";

interface GradientBadgeProps {
  children: ReactNode;
  size?: BadgeSize;
  variant?: BadgeVariant;
  colors?: readonly [string, string, ...string[]];
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  uppercase?: boolean;
}

const sizeConfig: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number; lineHeight: number; borderRadius: number }> = {
  sm: { paddingH: 6, paddingV: 4, fontSize: 9, lineHeight: 12, borderRadius: 6 },
  md: { paddingH: 8, paddingV: 6, fontSize: 10, lineHeight: 14, borderRadius: 8 },
  lg: { paddingH: 10, paddingV: 8, fontSize: 11, lineHeight: 16, borderRadius: 10 },
};

/**
 * GradientBadge - A reusable badge component with gradient background
 *
 * Used for:
 * - "X LEFT" badges on cards
 * - "COLLECTED" badges
 * - Category badges
 * - Status indicators
 *
 * @example
 * // Basic usage
 * <GradientBadge>153 LEFT</GradientBadge>
 *
 * @example
 * // Custom size and colors
 * <GradientBadge size="lg" colors={["#FF6B6B", "#4ECDC4"]}>
 *   PREMIUM
 * </GradientBadge>
 *
 * @example
 * // Subtle variant (for light backgrounds)
 * <GradientBadge variant="subtle">
 *   Entertainment
 * </GradientBadge>
 */
export function GradientBadge({
  children,
  size = "md",
  variant = "filled",
  colors = PRIMARY_GRADIENT,
  className,
  textClassName,
  style,
  textStyle,
  uppercase = true,
}: GradientBadgeProps) {
  const config = sizeConfig[size];

  if (variant === "subtle") {
    return (
      <LinearGradient
        colors={[`${colors[0]}15`, `${colors[1]}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={cn("self-start", className)}
        style={[
          {
            paddingHorizontal: config.paddingH,
            paddingVertical: config.paddingV,
            borderRadius: config.borderRadius,
          },
          style,
        ]}
      >
        <Text
          className={cn(
            "font-medium text-primary-500",
            textClassName
          )}
          style={[
            {
              fontSize: config.fontSize,
              lineHeight: config.lineHeight,
              textTransform: uppercase ? "uppercase" : "none",
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={cn("self-start", className)}
      style={[
        {
          paddingHorizontal: config.paddingH,
          paddingVertical: config.paddingV,
          borderRadius: config.borderRadius,
        },
        style,
      ]}
    >
      <Text
        className={cn(
          "font-semibold text-white",
          textClassName
        )}
        style={[
          {
            fontSize: config.fontSize,
            lineHeight: config.lineHeight,
            textTransform: uppercase ? "uppercase" : "none",
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </LinearGradient>
  );
}
