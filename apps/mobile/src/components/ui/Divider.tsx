import { View, Text } from "react-native";
import { cn } from "../../lib/cn";

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className }: DividerProps) {
  if (text) {
    return (
      <View className={cn("flex-row items-center gap-4", className)}>
        <View className="flex-1 h-px bg-slate-200" />
        <Text className="text-sm text-slate-400">{text}</Text>
        <View className="flex-1 h-px bg-slate-200" />
      </View>
    );
  }

  return <View className={cn("h-px bg-slate-200", className)} />;
}
