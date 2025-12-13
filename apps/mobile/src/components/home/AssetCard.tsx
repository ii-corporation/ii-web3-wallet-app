import { View, Text } from "react-native";
import { ZoopPointsIcon } from "../icons";
import { Card, GradientText } from "../ui";

interface AssetCardProps {
  type: "points" | "tokens";
  value: number;
  onPress?: () => void;
  className?: string;
}

export function AssetCard({ type, value, onPress, className }: AssetCardProps) {
  const label = type === "points" ? "ZOOP Points" : "ZOOP Tokens";

  // Format number with commas
  const formattedValue = value.toLocaleString();

  return (
    <Card
      variant="subtle"
      onPress={onPress}
      className={`flex-1 p-3 items-end rounded-[10px] ${className ?? ""}`}
    >
      <View className="flex-row items-center gap-2 w-full">
        <View
          className="rounded-full bg-primary-100 items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          <ZoopPointsIcon size={24} />
        </View>
        <Text className="text-sm font-medium text-slate-800">{label}</Text>
      </View>
      <View className="pr-2">
        <GradientText className="text-2xl font-semibold">
          {formattedValue}
        </GradientText>
      </View>
    </Card>
  );
}
