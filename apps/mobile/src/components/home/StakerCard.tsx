import { View, Text, Image, Pressable, ImageSourcePropType } from "react-native";
import { cn } from "../../lib/cn";

interface StakerCardProps {
  name: string;
  tokens: number;
  avatar?: ImageSourcePropType;
  rank?: number;
  onPress?: () => void;
  className?: string;
}

// Badge colors by rank
const RANK_COLORS: Record<number, string> = {
  1: "#6670FF", // Blue-purple
  2: "#F5B35B", // Gold/Orange
  3: "#9B74F6", // Purple
  4: "#EC7490", // Pink
};

function getRankColor(rank: number): string {
  return RANK_COLORS[rank] || "#EC7490"; // Default to pink for rank 5+
}

export function StakerCard({
  name,
  tokens,
  avatar,
  rank,
  onPress,
  className,
}: StakerCardProps) {
  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Split name into parts for two-line display
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "bg-slate-50 rounded-[10px] p-4 border border-slate-200/50 relative gap-2",
        className
      )}
      style={{
        minWidth: 113,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 1,
      }}
    >
      {/* Rank badge - top right corner */}
      {rank && (
        <View
          className="absolute top-0 right-0 items-center justify-center"
          style={{
            backgroundColor: getRankColor(rank),
            borderTopRightRadius: 9,
            borderBottomLeftRadius: 8,
            minWidth: 18,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            className="text-[10px] font-semibold text-slate-50"
            style={{ letterSpacing: 0.6 }}
          >
            {rank}
          </Text>
        </View>
      )}

      {/* Avatar and Name row */}
      <View className="flex-row items-center" style={{ gap: 6 }}>
        {avatar ? (
          <Image
            source={avatar}
            className="w-8 h-8 rounded-lg"
          />
        ) : (
          <View className="w-8 h-8 rounded-lg bg-slate-200 items-center justify-center">
            <Text className="text-xs font-medium text-slate-600">
              {initials}
            </Text>
          </View>
        )}

        {/* Name - two lines */}
        <View>
          <Text
            className="text-[12px] font-medium text-slate-800"
            style={{ letterSpacing: 0.24, lineHeight: 14 }}
            numberOfLines={1}
          >
            {firstName}
          </Text>
          {lastName && (
            <Text
              className="text-[12px] font-medium text-slate-800"
              style={{ letterSpacing: 0.24, lineHeight: 14 }}
              numberOfLines={1}
            >
              {lastName}
            </Text>
          )}
        </View>
      </View>

      {/* Tokens row */}
      <View className="flex-row items-center gap-0.5">
        <Text
          className="text-[14px] font-medium text-slate-800"
          style={{ lineHeight: 18 }}
        >
          {tokens.toLocaleString()}
        </Text>
        <Text
          className="text-[11px] font-normal text-slate-500"
          style={{ letterSpacing: 0.22, lineHeight: 14 }}
        >
          Tokens
        </Text>
      </View>
    </Pressable>
  );
}
