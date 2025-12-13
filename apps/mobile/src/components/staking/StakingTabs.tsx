import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PRIMARY_GRADIENT } from "../../theme";
import { GradientText } from "../ui";

type TabType = "explore" | "my-stakes";

interface StakingTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function TabItem({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-end"
      style={{ paddingHorizontal: 8, height: 48 }}
    >
      <View className="items-center w-full" style={{ gap: 6 }}>
        {isActive ? (
          <GradientText
            className="text-[13px] font-semibold"
            style={{ lineHeight: 18 }}
          >
            {label}
          </GradientText>
        ) : (
          <Text
            className="text-[13px] font-normal text-slate-600"
            style={{ lineHeight: 18 }}
          >
            {label}
          </Text>
        )}
        <View className="w-full px-2" style={{ opacity: isActive ? 1 : 0 }}>
          <LinearGradient
            colors={PRIMARY_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 3,
              borderRadius: 2,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}

export function StakingTabs({ activeTab, onTabChange }: StakingTabsProps) {
  return (
    <View className="flex-row items-end" style={{ paddingHorizontal: 4 }}>
      <TabItem
        label="Explore"
        isActive={activeTab === "explore"}
        onPress={() => onTabChange("explore")}
      />
      <TabItem
        label="My stakes"
        isActive={activeTab === "my-stakes"}
        onPress={() => onTabChange("my-stakes")}
      />
    </View>
  );
}
