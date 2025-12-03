import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { LinearGradient } from "expo-linear-gradient";

export default function StakingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-6">
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-2xl font-bold text-slate-900 mb-1">
            Staking
          </Text>
          <Text className="text-sm text-slate-500">
            Stake ZOOP to earn rewards
          </Text>
        </View>

        {/* APY Banner */}
        <View className="px-5 mb-6">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={["#27e7c4", "#3a6ff9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <Text className="text-white/80 text-sm mb-1">
                Current Base APR
              </Text>
              <Text className="text-white text-4xl font-bold mb-2">
                12%
              </Text>
              <Text className="text-white/80 text-xs">
                Earn bonus APR with longer lock periods
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Staking Pools */}
        <View className="px-5">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Staking Pools
          </Text>

          {/* Flexible Pool */}
          <Card variant="elevated" className="mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-base font-semibold text-slate-900">
                  Flexible
                </Text>
                <Text className="text-sm text-slate-500">No lock period</Text>
              </View>
              <View className="bg-primary-100 px-3 py-1 rounded-full">
                <Text className="text-primary-600 text-sm font-semibold">
                  12% APR
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-slate-400">Total Staked</Text>
                <Text className="text-sm font-medium text-slate-700">
                  1,250,000 ZOOP
                </Text>
              </View>
              <Button variant="primary" size="sm">
                Stake
              </Button>
            </View>
          </Card>

          {/* 30 Day Pool */}
          <Card variant="elevated" className="mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-base font-semibold text-slate-900">
                  30 Day Lock
                </Text>
                <Text className="text-sm text-slate-500">+25% bonus</Text>
              </View>
              <View className="bg-mint/20 px-3 py-1 rounded-full">
                <Text className="text-mint text-sm font-semibold">
                  15% APR
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-slate-400">Total Staked</Text>
                <Text className="text-sm font-medium text-slate-700">
                  3,500,000 ZOOP
                </Text>
              </View>
              <Button variant="primary" size="sm">
                Stake
              </Button>
            </View>
          </Card>

          {/* 90 Day Pool */}
          <Card variant="elevated" className="mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-base font-semibold text-slate-900">
                  90 Day Lock
                </Text>
                <Text className="text-sm text-slate-500">+50% bonus</Text>
              </View>
              <View className="bg-lime/30 px-3 py-1 rounded-full">
                <Text className="text-slate-700 text-sm font-semibold">
                  18% APR
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-slate-400">Total Staked</Text>
                <Text className="text-sm font-medium text-slate-700">
                  5,200,000 ZOOP
                </Text>
              </View>
              <Button variant="primary" size="sm">
                Stake
              </Button>
            </View>
          </Card>
        </View>

        {/* My Stakes */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-slate-900">
              My Stakes
            </Text>
          </View>
          <Card variant="outlined" className="items-center py-8">
            <Text className="text-4xl mb-2">🎯</Text>
            <Text className="text-base font-medium text-slate-900 mb-1">
              No active stakes
            </Text>
            <Text className="text-sm text-slate-500 text-center">
              Choose a pool above to start earning
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
