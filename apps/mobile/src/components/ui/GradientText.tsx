import { Text } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../../lib/cn";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: [string, string, ...string[]];
}

export function GradientText({
  children,
  className,
  colors = ["#9c2cf3", "#3a6ff9"],
}: GradientTextProps) {
  return (
    <MaskedView
      maskElement={
        <Text className={cn("font-bold", className)}>{children}</Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className={cn("opacity-0 font-bold", className)}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
