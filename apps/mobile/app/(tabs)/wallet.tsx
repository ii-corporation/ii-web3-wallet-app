import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/ui/Card";

export default function WalletScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-6">
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-2xl font-bold text-slate-900 mb-1">
            Wallet
          </Text>
          <Text className="text-sm text-slate-500">
            Manage your assets across chains
          </Text>
        </View>

        {/* Assets */}
        <View className="px-5">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Assets
          </Text>

          {/* ZOOP Token */}
          <Card variant="elevated" className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
              <Text className="text-primary-600 font-bold">Z</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-slate-900">ZOOP</Text>
              <Text className="text-sm text-slate-500">Hedera</Text>
            </View>
            <View className="items-end">
              <Text className="text-base font-semibold text-slate-900">0</Text>
              <Text className="text-sm text-slate-500">$0.00</Text>
            </View>
          </Card>

          {/* HBAR */}
          <Card variant="elevated" className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-3">
              <Text className="text-white font-bold text-xs">ℏ</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-slate-900">HBAR</Text>
              <Text className="text-sm text-slate-500">Hedera</Text>
            </View>
            <View className="items-end">
              <Text className="text-base font-semibold text-slate-900">0</Text>
              <Text className="text-sm text-slate-500">$0.00</Text>
            </View>
          </Card>
        </View>

        {/* NFTs Section */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            NFTs
          </Text>
          <Card variant="outlined" className="items-center py-8">
            <Text className="text-4xl mb-2">🖼️</Text>
            <Text className="text-base font-medium text-slate-900 mb-1">
              No NFTs yet
            </Text>
            <Text className="text-sm text-slate-500 text-center">
              Your NFT collection will appear here
            </Text>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-slate-900">
              Recent Transactions
            </Text>
            <Text className="text-sm text-primary-600">View All</Text>
          </View>
          <Card variant="outlined" className="items-center py-8">
            <Text className="text-4xl mb-2">📝</Text>
            <Text className="text-base font-medium text-slate-900 mb-1">
              No transactions
            </Text>
            <Text className="text-sm text-slate-500 text-center">
              Your transaction history will appear here
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
