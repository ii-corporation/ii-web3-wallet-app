import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../../src/components/ui";
import { StakingIcon } from "../../src/components/icons";

export default function StakeSuccessPage() {
  const { amount, creator, period } = useLocalSearchParams<{
    amount: string;
    creator: string;
    period: string;
  }>();

  const handleViewStakes = () => {
    router.replace("/(tabs)/staking?tab=my-stakes");
  };

  const handleStakeMore = () => {
    router.back();
  };

  const handleBackHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-8" style={{ gap: 32 }}>
        {/* Success Icon */}
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 120,
            height: 120,
            backgroundColor: "rgba(221, 214, 254, 0.3)",
          }}
        >
          <LinearGradient
            colors={["#AD42FF", "#5F89F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StakingIcon size={40} color="#FFFFFF" filled />
          </LinearGradient>
        </View>

        {/* Success Message */}
        <View className="items-center" style={{ gap: 12 }}>
          <Text
            className="text-2xl font-semibold text-slate-800 text-center"
            style={{ lineHeight: 30 }}
          >
            Staking Successful!
          </Text>
          <Text
            className="text-slate-500 text-center"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            You have successfully staked{" "}
            <Text className="font-medium text-slate-800">{amount || "0"} Tokens</Text>
            {creator && (
              <>
                {" "}to{" "}
                <Text className="font-medium text-slate-800">{creator}</Text>
              </>
            )}
            {period && (
              <>
                {" "}for{" "}
                <Text className="font-medium text-slate-800">{period} days</Text>
              </>
            )}
            .
          </Text>
        </View>

        {/* Summary Card */}
        <View
          className="w-full bg-slate-50 rounded-2xl p-4"
          style={{
            gap: 12,
            borderWidth: 1,
            borderColor: "rgba(226, 232, 240, 0.5)",
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-500" style={{ fontSize: 14 }}>
              Amount staked
            </Text>
            <Text className="font-medium text-slate-800" style={{ fontSize: 14 }}>
              {amount || "0"} Tokens
            </Text>
          </View>
          {creator && (
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-500" style={{ fontSize: 14 }}>
                Staked to
              </Text>
              <Text className="font-medium text-slate-800" style={{ fontSize: 14 }}>
                {creator}
              </Text>
            </View>
          )}
          {period && (
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-500" style={{ fontSize: 14 }}>
                Lock period
              </Text>
              <Text className="font-medium text-slate-800" style={{ fontSize: 14 }}>
                {period} days
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-4 pb-4" style={{ gap: 12 }}>
        <Button type="primary" onPress={handleViewStakes}>
          View My Stakes
        </Button>
        <Button type="outlined" onPress={handleBackHome}>
          Back to Home
        </Button>
      </View>
    </SafeAreaView>
  );
}
