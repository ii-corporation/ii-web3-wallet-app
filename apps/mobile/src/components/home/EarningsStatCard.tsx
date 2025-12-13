import { View, Text, Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Card, GradientText } from "../ui";

interface EarningsStatCardProps {
  label: string;
  value: string | number;
  showHelp?: boolean;
  onHelpPress?: () => void;
  className?: string;
}

function HelpIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" stroke="#64748B" strokeWidth="1.5" />
      <Path
        d="M6.5 6.5C6.5 5.67 7.17 5 8 5C8.83 5 9.5 5.67 9.5 6.5C9.5 7.17 9.06 7.74 8.45 7.93C8.18 8.01 8 8.26 8 8.54V9"
        stroke="#64748B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="8" cy="11" r="0.75" fill="#64748B" />
    </Svg>
  );
}

export function EarningsStatCard({
  label,
  value,
  showHelp = true,
  onHelpPress,
  className,
}: EarningsStatCardProps) {
  return (
    <Card
      variant="subtle"
      className={`flex-1 py-5 px-3 items-center rounded-lg gap-1 ${className ?? ""}`}
    >
      <View className="flex-row items-center gap-0.5">
        <Text className="text-[13px] font-normal text-slate-500">{label}</Text>
        {showHelp && (
          <Pressable onPress={onHelpPress} hitSlop={8}>
            <HelpIcon />
          </Pressable>
        )}
      </View>
      <GradientText className="text-2xl font-semibold">{value}</GradientText>
    </Card>
  );
}
