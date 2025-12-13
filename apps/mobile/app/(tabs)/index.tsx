import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { router } from "expo-router";
import {
  AssetCard,
  EarningsStatCard,
  StakeRow,
  StakePieChart,
  StakerCard,
  PIE_CHART_COLORS,
} from "../../src/components/home";
import { GradientText } from "../../src/components/ui";
import { NotificationIcon } from "../../src/components/icons";

// Placeholder avatar images
const AVATARS = {
  floyd: require("../../assets/avatars/avatar1.png"),
  arlene: require("../../assets/avatars/avatar2.png"),
  wade: require("../../assets/avatars/avatar3.png"),
};

// Mock data - replace with real data from stores/API
const MOCK_DATA = {
  zoopPoints: 3320,
  zoopTokens: 6258,
  dailyRewards: 38.06,
  estimatedZPY: "5.75%",
  availableToStake: 220,
  totalStaked: 8300,
  topStakes: [
    { id: "1", name: "Floyd McCoy", tokens: 3320, rank: 1, avatar: AVATARS.floyd },
    { id: "2", name: "Arlene Freeman", tokens: 536, rank: 2, avatar: AVATARS.arlene },
    { id: "3", name: "Wade Robertson", tokens: 130, rank: 3, avatar: AVATARS.wade },
    { id: "4", name: "Jenny Wilson", tokens: 98, rank: 4 },
  ],
  stakeSegments: [
    { value: 3320, color: PIE_CHART_COLORS[0] }, // Purple
    { value: 2100, color: PIE_CHART_COLORS[1] }, // Lime
    { value: 1500, color: PIE_CHART_COLORS[2] }, // Mint
    { value: 800, color: PIE_CHART_COLORS[3] }, // Orange
    { value: 400, color: PIE_CHART_COLORS[4] }, // Pink
    { value: 180, color: PIE_CHART_COLORS[5] }, // Blue
  ],
};

// Section header component
function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-sm font-semibold text-slate-900">{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction}>
          <GradientText
            className="text-sm font-semibold"
            style={{ letterSpacing: 0.14 }}
          >
            {actionLabel}
          </GradientText>
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Refresh data from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleViewWallet = () => {
    router.push("/(tabs)/wallet");
  };

  const handleStake = () => {
    router.push("/(tabs)/staking?tab=explore");
  };

  const handleViewStakes = () => {
    router.push("/(tabs)/staking?tab=my-stakes");
  };

  const handleHelpPress = (topic: string) => {
    // TODO: Show help modal
    console.log(`Help pressed for: ${topic}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Top App Bar */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-semibold text-slate-900">Home</Text>
        <Pressable hitSlop={8}>
          <NotificationIcon color="#0F172A" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Your Assets Section */}
        <View className="px-4 mb-6">
          <SectionHeader
            title="Your assets"
            actionLabel="View wallet"
            onAction={handleViewWallet}
          />
          <View className="flex-row gap-2">
            <AssetCard type="points" value={MOCK_DATA.zoopPoints} />
            <AssetCard type="tokens" value={MOCK_DATA.zoopTokens} />
          </View>
        </View>

        {/* Earnings Section */}
        <View className="px-4 mb-6">
          <SectionHeader
            title="Earnings"
            actionLabel="Stake"
            onAction={handleStake}
          />

          {/* Stats Row */}
          <View className="flex-row gap-2 mb-3">
            <EarningsStatCard
              label="Daily rewards"
              value={MOCK_DATA.dailyRewards}
              onHelpPress={() => handleHelpPress("daily-rewards")}
            />
            <EarningsStatCard
              label="Estimated ZPY"
              value={MOCK_DATA.estimatedZPY}
              onHelpPress={() => handleHelpPress("zpy")}
            />
          </View>

          {/* Available to Stake Row */}
          <StakeRow
            title="Available to stake"
            subtitle="Tokens ready to stake"
            value={MOCK_DATA.availableToStake}
            onPress={handleStake}
          />
        </View>

        {/* Your Top Stakes Section */}
        <View className="px-4">
          <SectionHeader
            title="Your top stakes"
            actionLabel="View stakes"
            onAction={handleViewStakes}
          />

          {/* Pie Chart */}
          <View className="items-center mb-6">
            <StakePieChart
              segments={MOCK_DATA.stakeSegments}
              totalStaked={MOCK_DATA.totalStaked}
              size={180}
            />
          </View>

          {/* Stakers Horizontal List */}
          <View style={{ marginHorizontal: -16 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-4 pb-4"
            >
              {MOCK_DATA.topStakes.map((staker) => (
                <StakerCard
                  key={staker.id}
                  name={staker.name}
                  tokens={staker.tokens}
                  rank={staker.rank}
                  avatar={staker.avatar}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
