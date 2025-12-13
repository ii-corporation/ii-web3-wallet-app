import { View, Text, Pressable } from "react-native";
import { Card } from "../ui/Card";
import { GradientText } from "../ui/GradientText";
import Svg, { Circle, Path } from "react-native-svg";

interface StakeStatCardProps {
  label: string;
  value: string;
  showHelpIcon?: boolean;
  onHelpPress?: () => void;
}

function HelpIcon({ size = 14, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="5.25" stroke={color} strokeWidth="1.2" />
      <Path
        d="M7 10V10.01"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <Path
        d="M7 8C7 6.5 8.5 6.5 8.5 5.25C8.5 4.42 7.83 3.75 7 3.75C6.17 3.75 5.5 4.42 5.5 5.25"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StakeStatCard({
  label,
  value,
  showHelpIcon = false,
  onHelpPress,
}: StakeStatCardProps) {
  return (
    <Card
      variant="subtle"
      className="flex-1 py-3 px-0 items-center justify-center rounded-lg"
      style={{ gap: 4 }}
    >
      <View className="flex-row items-center" style={{ gap: 2 }}>
        <Text
          className="text-slate-500 font-normal"
          style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
        >
          {label}
        </Text>
        {showHelpIcon && (
          <Pressable onPress={onHelpPress} hitSlop={8}>
            <HelpIcon size={14} />
          </Pressable>
        )}
      </View>
      <GradientText
        className="font-semibold"
        style={{ fontSize: 16, lineHeight: 22 }}
      >
        {value}
      </GradientText>
    </Card>
  );
}
