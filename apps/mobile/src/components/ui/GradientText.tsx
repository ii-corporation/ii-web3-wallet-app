import { Text, TextStyle, StyleProp } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../../lib/cn";
import { PRIMARY_GRADIENT } from "../../theme";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
  colors?: [string, string, ...string[]];
}

export function GradientText({
  children,
  className,
  style,
  colors = PRIMARY_GRADIENT,
}: GradientTextProps) {
  return (
    <MaskedView
      maskElement={
        <Text className={cn("font-bold", className)} style={style}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className={cn("opacity-0 font-bold", className)} style={style}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
