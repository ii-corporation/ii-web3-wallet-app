import { StyleSheet, ViewStyle } from "react-native";

// Shared shadow configurations - single source of truth
// These can't be expressed in NativeWind/Tailwind for React Native

export const shadows = {
  // Subtle shadow for cards and containers
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 1,
  } as ViewStyle,

  // Small shadow for buttons and interactive elements
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,

  // Medium shadow for elevated cards
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  } as ViewStyle,

  // Large shadow for modals and overlays
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  } as ViewStyle,

  // Header/AppBar shadow
  header: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 80,
    elevation: 4,
  } as ViewStyle,

  // Bottom sheet shadow (upward)
  bottomSheet: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 56,
    elevation: 20,
  } as ViewStyle,
} as const;

// Pre-created StyleSheet for performance
export const shadowStyles = StyleSheet.create({
  subtle: shadows.subtle,
  small: shadows.small,
  medium: shadows.medium,
  large: shadows.large,
  header: shadows.header,
  bottomSheet: shadows.bottomSheet,
});
