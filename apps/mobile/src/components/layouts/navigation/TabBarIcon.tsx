import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { PRIMARY_GRADIENT } from "../../../theme";

interface TabBarIconProps {
  focused: boolean;
  children: ReactNode;
}

/**
 * Wrapper component for tab bar icons that shows the
 * focused indicator bar at the top of the navbar.
 *
 * Based on Figma: Items container has pt-12px, pb-4px.
 * Indicator positioned at top: -4px to account for navbar's internal spacing.
 */
export function TabBarIcon({ focused, children }: TabBarIconProps) {
  return (
    <View className="items-center pt-3">
      {focused && (
        <LinearGradient
          colors={PRIMARY_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            top: -4,
            width: 54,
            height: 4,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            shadowColor: "#488DC4",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 2,
          }}
        />
      )}
      {children}
    </View>
  );
}
