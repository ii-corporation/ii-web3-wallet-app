import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Button Types
type ButtonType = "primary" | "secondary" | "outlined" | "tertiary" | "action";

// Button Brands (color themes)
type ButtonBrand = "zoop" | "blue" | "black" | "blueAlt" | "purple";

// Button Sizes
type ButtonSize = "default" | "large" | "big";

// Brand color configurations
const BRAND_COLORS = {
  zoop: {
    gradient: ["#ad42ff", "#5f89f7"] as const,
    gradientAngle: 128,
    text: "#7c3aed",
    border: "#ad42ff",
    focusBorder: "#7c3aed",
  },
  blue: {
    gradient: ["#158efd", "#0048b4"] as const,
    gradientAngle: 90,
    text: "#006fe6",
    border: "#158efd",
    focusBorder: "#006fe6",
  },
  black: {
    gradient: ["#000000", "#000000"] as const,
    gradientAngle: 0,
    text: "#000000",
    border: "#000000",
    focusBorder: "#000000",
  },
  blueAlt: {
    gradient: ["#2196f3", "#0060ac"] as const,
    gradientAngle: 128,
    text: "#1167ab",
    border: "#2196f3",
    focusBorder: "#2196f3",
  },
  purple: {
    gradient: ["#9b37f2", "#7a12d4"] as const,
    gradientAngle: 111,
    text: "#9300fe",
    border: "#9b37f2",
    focusBorder: "#9b37f2",
  },
};

// Size configurations
const SIZE_CONFIG = {
  default: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    fontSize: 14,
    height: undefined as number | undefined,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    fontSize: 14,
    height: undefined as number | undefined,
  },
  big: {
    paddingVertical: 22,
    paddingHorizontal: 48,
    fontSize: 16,
    height: 64,
  },
};

interface ButtonProps {
  children: React.ReactNode;
  type?: ButtonType;
  brand?: ButtonBrand;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  children,
  type = "primary",
  brand = "zoop",
  size = "default",
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const colors = BRAND_COLORS[brand];
  const sizeConfig = SIZE_CONFIG[size];
  const isDisabled = disabled || loading;

  // Get text color based on button type
  const getTextColor = () => {
    if (type === "primary") return "#FFFFFF";
    return colors.text;
  };

  // Get button content
  const renderContent = () => {
    const textColor = getTextColor();

    if (loading) {
      return <ActivityIndicator size="small" color={textColor} />;
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === "left" && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        <Text
          style={[
            styles.text,
            { color: textColor, fontSize: sizeConfig.fontSize },
            textStyle,
          ]}
        >
          {children}
        </Text>
        {icon && iconPosition === "right" && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    );
  };

  // Primary button - full gradient background
  if (type === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={colors.gradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.buttonBase,
            {
              paddingVertical: sizeConfig.paddingVertical,
              paddingHorizontal: sizeConfig.paddingHorizontal,
              height: sizeConfig.height,
            },
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary button - white background only (no gradient overlay per Figma)
  if (type === "secondary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <View
          style={[
            styles.buttonBase,
            styles.secondaryButton,
            {
              paddingVertical: sizeConfig.paddingVertical,
              paddingHorizontal: sizeConfig.paddingHorizontal,
              height: sizeConfig.height,
            },
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  // Outlined button - border only
  if (type === "outlined") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <View
          style={[
            styles.buttonBase,
            styles.outlinedButton,
            {
              borderColor: colors.border,
              paddingVertical: sizeConfig.paddingVertical - 2, // Account for border
              paddingHorizontal: sizeConfig.paddingHorizontal,
              height: sizeConfig.height,
            },
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  // Tertiary button - text only
  if (type === "tertiary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.6}
        style={[styles.tertiaryButton, isDisabled && styles.disabled, style]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Action button - white background with border
  if (type === "action") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[style]}
      >
        <View
          style={[
            styles.actionButton,
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  buttonBase: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    lineHeight: 18,
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  // Secondary button styles - white background per Figma
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  // Outlined button styles
  outlinedButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  // Tertiary button styles
  tertiaryButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  // Action button styles
  actionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});

export default Button;

// Export types for consumers
export type { ButtonProps, ButtonType, ButtonBrand, ButtonSize };
