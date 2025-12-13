import { View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { PRIMARY_GRADIENT } from "../../theme";

interface GradientIconProps {
  children: React.ReactNode;
  colors?: [string, string, ...string[]];
  size?: number;
}

/**
 * Wraps an icon component and applies a gradient fill.
 * The icon should render with a solid color (e.g., black) to act as the mask.
 *
 * Usage:
 * <GradientIcon>
 *   <HomeIcon color="#000" />
 * </GradientIcon>
 */
export function GradientIcon({
  children,
  colors = PRIMARY_GRADIENT,
  size = 24,
}: GradientIconProps) {
  return (
    <MaskedView
      style={{ width: size, height: size }}
      maskElement={<View style={{ width: size, height: size }}>{children}</View>}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size }}
      />
    </MaskedView>
  );
}
