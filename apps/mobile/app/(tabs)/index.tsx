import { View, Text, ScrollView, RefreshControl, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { useUserStore } from "../../src/stores";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useCallback } from "react";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { GradientText } from "../../src/components/ui/GradientText";

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const isWeb = Platform.OS === "web";

  // Get data from global user store
  const { getDisplayName, getWalletAddress } = useUserStore();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Refresh data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Get wallet address from store (or Privy as fallback)
  const walletAddress = getWalletAddress() || user?.wallet?.address;

  // Get display address (truncated) - mock for web
  const displayAddress = isWeb
    ? "0x1234...abcd"
    : walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "Loading...";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-sm text-slate-500">Welcome back</Text>
              <Text className="text-xl font-bold text-slate-900">
                {getDisplayName()}
              </Text>
              <Text className="text-xs text-slate-400">
                {displayAddress}
              </Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-primary-600 font-bold">
                {isWeb ? "ZP" : (walletAddress?.slice(2, 4).toUpperCase() || "?")}
              </Text>
            </View>
          </View>

          {/* Total Balance Card */}
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={["#9c2cf3", "#3a6ff9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <Text className="text-white/80 text-sm mb-1">Total Balance</Text>
              <Text className="text-white text-4xl font-bold mb-4">
                $0.00
              </Text>
              <View className="flex-row items-center">
                <View className="bg-white/20 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">
                    0 ZOOP
                  </Text>
                </View>
                <Text className="text-white/60 text-xs ml-2">+0% today</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <Card variant="elevated" className="flex-1 items-center py-4">
              <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mb-2">
                <Text className="text-2xl">↗</Text>
              </View>
              <Text className="text-sm font-medium text-slate-900">Send</Text>
            </Card>
            <Card variant="elevated" className="flex-1 items-center py-4">
              <View className="w-12 h-12 rounded-full bg-mint/20 items-center justify-center mb-2">
                <Text className="text-2xl">↙</Text>
              </View>
              <Text className="text-sm font-medium text-slate-900">Receive</Text>
            </Card>
            <Card variant="elevated" className="flex-1 items-center py-4">
              <View className="w-12 h-12 rounded-full bg-lime/30 items-center justify-center mb-2">
                <Text className="text-2xl">📈</Text>
              </View>
              <Text className="text-sm font-medium text-slate-900">Stake</Text>
            </Card>
          </View>
        </View>

        {/* Staking Rewards */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Staking Rewards
          </Text>
          <Card variant="elevated" className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-slate-500 mb-1">
                Available Rewards
              </Text>
              <GradientText className="text-2xl">0 ZOOP</GradientText>
            </View>
            <Button variant="gradient" size="sm">
              Claim
            </Button>
          </Card>
        </View>

        {/* Your Stakes */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-slate-900">
              Your Stakes
            </Text>
            <Text className="text-sm text-primary-600">View All</Text>
          </View>
          <Card variant="outlined" className="items-center py-8">
            <Text className="text-4xl mb-2">🎯</Text>
            <Text className="text-base font-medium text-slate-900 mb-1">
              No active stakes
            </Text>
            <Text className="text-sm text-slate-500 text-center mb-4">
              Start staking ZOOP to earn rewards
            </Text>
            <Button variant="primary" size="sm">
              Start Staking
            </Button>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
