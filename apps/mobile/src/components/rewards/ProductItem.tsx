import { View, Text, Pressable } from "react-native";
import { ReactNode } from "react";
import { ChevronRightIcon } from "../icons";

interface ProductItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  onPress?: () => void;
}

export function ProductItem({
  icon,
  title,
  description,
  onPress,
}: ProductItemProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="flex-row items-center"
        style={{ paddingVertical: 12, gap: 12 }}
      >
        {/* Icon */}
        <View style={{ width: 44, height: 44 }}>{icon}</View>

        {/* Content */}
        <View className="flex-1" style={{ gap: 8 }}>
          <Text
            className="font-semibold text-slate-950"
            style={{ fontSize: 16, lineHeight: 22 }}
          >
            {title}
          </Text>
          <Text
            className="text-slate-500"
            style={{ fontSize: 13, lineHeight: 18 }}
          >
            {description}
          </Text>
        </View>

        {/* Chevron */}
        <ChevronRightIcon size={18} color="#64748B" />
      </View>
    </Pressable>
  );
}
