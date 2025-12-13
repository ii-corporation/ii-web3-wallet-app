import { View, Text } from "react-native";
import { StakingIcon } from "../icons";
import { Card, GradientIcon } from "../ui";

interface StakeRowProps {
  title: string;
  subtitle: string;
  value: string | number;
  onPress?: () => void;
  className?: string;
}

export function StakeRow({
  title,
  subtitle,
  value,
  onPress,
  className,
}: StakeRowProps) {
  return (
    <Card
      variant="subtle"
      onPress={onPress}
      className={`flex-row items-center p-3 rounded-[10px] ${className ?? ""} gap-3`}
    >
      {/* Icon Container - 40x40 */}
      <View
        className="rounded-full bg-primary-100 items-center justify-center"
        style={{ width: 40, height: 40, padding: 5 }}
      >
        <GradientIcon>
          <StakingIcon size={24} color="#000" />
        </GradientIcon>
      </View>

      {/* Text Content */}
      <View className="flex-1" style={{ gap: 2 }}>
        <Text
          className="font-medium text-slate-800"
          style={{ fontSize: 14, lineHeight: 18 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="text-slate-500"
          style={{ fontSize: 13, lineHeight: 18 }}
        >
          {subtitle}
        </Text>
      </View>

      {/* Value */}
      <Text
        className="font-medium text-slate-800"
        style={{ fontSize: 14, lineHeight: 18 }}
      >
        {value}
      </Text>
    </Card>
  );
}
