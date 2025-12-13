import {
  View,
  Text,
  Pressable,
  Image,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Button, BottomSheet, GradientText, TokenAmountInput } from "../../src/components/ui";
import { BackIcon, HelpIcon } from "../../src/components/icons";
import { CategoryType } from "../../src/components/staking";

// Lock period options
const LOCK_PERIODS = [30, 90, 180, 360];

// Percentage shortcuts
const PERCENTAGE_SHORTCUTS = ["10%", "25%", "50%", "All"];

// Numpad keys
const NUMPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "back"],
];

// Mock creator data (would come from API/store in real app)
const MOCK_CREATOR = {
  id: "1",
  name: "Carmelita Rose",
  image: require("../../assets/influencers/arlene-mccoy.png"),
  category: "entertainment" as CategoryType,
};

const CATEGORY_LABELS: Record<CategoryType, string> = {
  entertainment: "Entertainment",
  tech: "Tech & Gaming",
  music: "Music",
  social: "Social Figure",
  fashion: "Fashion",
  sports: "Sports",
  health: "Health & Fitness",
  travel: "Travel",
  beauty: "Beauty",
  business: "Business",
};

interface StakeReviewData {
  creatorName: string;
  creatorImage: ImageSourcePropType;
  category?: CategoryType;
  amount: string;
  lockPeriod: number;
  estimatedZPY: string;
  estimatedReward: string;
  unlockDate: string;
  fee: string;
  feeAmount: string;
  total: string;
}

// Review Staking Modal
function ReviewStakingModal({
  visible,
  onClose,
  onConfirm,
  data,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: StakeReviewData;
}) {
  const categoryLabel = data.category ? CATEGORY_LABELS[data.category] : undefined;

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.75]}>
      <View className="flex-1 px-4" style={{ gap: 24 }}>
        {/* Title */}
        <Text
          className="text-xl font-semibold text-slate-800"
          style={{ lineHeight: 26 }}
        >
          Review staking
        </Text>

        {/* Creator Info */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <Image
            source={data.creatorImage}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
          <View style={{ gap: 4 }}>
            <Text
              className="font-medium text-slate-800"
              style={{ fontSize: 14, lineHeight: 18 }}
            >
              {data.creatorName}
            </Text>
            {categoryLabel && (
              <View
                className="self-start rounded-lg px-[6px] py-[4px]"
                style={{ backgroundColor: "rgba(221, 214, 254, 0.5)" }}
              >
                <Text
                  className="font-medium text-primary-500 uppercase"
                  style={{ fontSize: 10 }}
                >
                  {categoryLabel}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary */}
        <View style={{ gap: 12 }}>
          <SummaryRow label="Staked to:" value={data.creatorName} />
          <SummaryRow label="Amount to stake:" value={`${data.amount} Tokens`} />
          <SummaryRow label="Lock period:" value={`${data.lockPeriod} days`} />
          <SummaryRow label="Estimated ZPY:" value={data.estimatedZPY} />
          <SummaryRow label="Estimated reward:" value={`≈ ${data.estimatedReward} Tokens`} />
          <SummaryRow label="Unlock date:" value={data.unlockDate} />
          <SummaryRow label="Fee:" value={`${data.fee} = ${data.feeAmount} Tokens`} />
        </View>

        {/* Total */}
        <View
          className="pt-4"
          style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0" }}
        >
          <View className="flex-row items-center" style={{ gap: 5 }}>
            <Text className="text-slate-500" style={{ fontSize: 14 }}>
              Total:
            </Text>
            <Text
              className="font-semibold text-slate-800"
              style={{ fontSize: 16 }}
            >
              {data.total} Tokens
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row" style={{ gap: 8, marginTop: "auto" }}>
          <View className="flex-1">
            <Button type="outlined" onPress={onClose}>
              Cancel
            </Button>
          </View>
          <View className="flex-1">
            <Button type="primary" onPress={onConfirm}>
              Stake
            </Button>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 5 }}>
      <Text className="text-slate-500" style={{ fontSize: 14 }}>
        {label}
      </Text>
      <Text className="text-slate-800" style={{ fontSize: 14 }}>
        {value}
      </Text>
    </View>
  );
}

export default function StakePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [amount, setAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(90);
  const [showReview, setShowReview] = useState(false);

  const balance = "2,358";
  const balanceNumber = parseFloat(balance.replace(",", ""));
  const amountNumber = parseFloat(amount) || 0;
  const isOverBalance = amountNumber > balanceNumber;
  const isValid = amount && amountNumber > 0 && !isOverBalance;
  const estimatedZPY = "5.6%";
  const balanceError = isOverBalance ? "Insufficient balance" : undefined;

  // Calculate review data
  const getReviewData = useCallback((): StakeReviewData => {
    const feePercentage = 0.006;
    const feeAmount = amountNumber * feePercentage;
    const total = amountNumber + feeAmount;
    const estimatedReward = amountNumber * 0.056 * (selectedPeriod / 365);
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + selectedPeriod);

    return {
      creatorName: MOCK_CREATOR.name,
      creatorImage: MOCK_CREATOR.image,
      category: MOCK_CREATOR.category,
      amount: amountNumber.toFixed(2),
      lockPeriod: selectedPeriod,
      estimatedZPY,
      estimatedReward: estimatedReward.toFixed(2),
      unlockDate: unlockDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      fee: `${(feePercentage * 100).toFixed(1)}%`,
      feeAmount: feeAmount.toFixed(2),
      total: total.toFixed(2),
    };
  }, [amountNumber, selectedPeriod]);

  const handleNumpadPress = (key: string) => {
    if (key === "back") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".")) {
        setAmount((prev) => (prev === "" ? "0." : prev + "."));
      }
    } else {
      // Limit to 2 decimal places
      if (amount.includes(".")) {
        const parts = amount.split(".");
        if (parts[1].length >= 2) return;
      }
      setAmount((prev) => prev + key);
    }
  };

  const handlePercentagePress = (percentage: string) => {
    if (percentage === "All") {
      setAmount(balanceNumber.toString());
    } else {
      const percent = parseInt(percentage) / 100;
      const value = Math.floor(balanceNumber * percent * 100) / 100;
      setAmount(value.toString());
    }
  };

  const handleConfirm = () => {
    if (isValid) {
      setShowReview(true);
    }
  };

  const handleStake = () => {
    // TODO: Execute staking transaction on blockchain
    console.log("Staking:", {
      creatorId: id,
      amount: amountNumber,
      lockPeriod: selectedPeriod,
    });
    setShowReview(false);
    // Navigate to success page with staking details
    router.replace({
      pathname: "/stake/success",
      params: {
        amount: amountNumber.toFixed(2),
        creator: MOCK_CREATOR.name,
        period: selectedPeriod.toString(),
      },
    });
  };

  const categoryLabel = MOCK_CREATOR.category
    ? CATEGORY_LABELS[MOCK_CREATOR.category]
    : undefined;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Header - White background */}
      <View
        className="flex-row items-center px-4 bg-white"
        style={{ height: 56, gap: 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="items-center justify-center"
          style={{ width: 32, height: 32 }}
        >
          <BackIcon size={24} color="#1E293B" />
        </Pressable>
        <Text
          className="text-xl font-semibold text-slate-800"
          style={{ lineHeight: 26 }}
        >
          Stake
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-4" style={{ gap: 16, paddingTop: 16 }}>
        {/* Creator Info */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <Image
            source={MOCK_CREATOR.image}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
          <View style={{ gap: 4 }}>
            <Text
              className="font-medium text-slate-800"
              style={{ fontSize: 14, lineHeight: 18 }}
            >
              {MOCK_CREATOR.name}
            </Text>
            {categoryLabel && (
              <View
                className="self-start rounded-lg px-[6px] py-[4px]"
                style={{ backgroundColor: "rgba(221, 214, 254, 0.5)" }}
              >
                <Text
                  className="font-medium text-primary-500 uppercase"
                  style={{ fontSize: 10 }}
                >
                  {categoryLabel}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Amount Input */}
        <TokenAmountInput
          value={amount}
          onChangeValue={setAmount}
          balance={balance}
          editable={false}
          error={balanceError}
        />

        {/* Lock Period */}
        <View style={{ gap: 8 }}>
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Text
              className="font-medium text-slate-600"
              style={{ fontSize: 14, lineHeight: 18 }}
            >
              Lock period (days)
            </Text>
            <HelpIcon size={16} color="#64748B" />
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            {LOCK_PERIODS.map((days) => (
              <Pressable
                key={days}
                onPress={() => setSelectedPeriod(days)}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    backgroundColor:
                      selectedPeriod === days ? "#F5F3FF" : "#F8FAFC",
                    borderWidth: selectedPeriod === days ? 2 : 1,
                    borderColor:
                      selectedPeriod === days ? "#AD42FF" : "#E2E8F0",
                    borderRadius: 10,
                    padding: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    className="text-slate-800"
                    style={{ fontSize: 15, lineHeight: 20 }}
                  >
                    {days}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Estimated ZPY */}
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Text
            className="text-slate-500"
            style={{ fontSize: 13, lineHeight: 18 }}
          >
            Estimated ZPY:
          </Text>
          <Text
            className="font-medium text-slate-800"
            style={{ fontSize: 13, lineHeight: 18 }}
          >
            {estimatedZPY}
          </Text>
          <HelpIcon size={16} color="#64748B" />
        </View>

        {/* Confirm Button */}
        <Button type="primary" disabled={!isValid} onPress={handleConfirm}>
          Confirm
        </Button>

        {/* Numpad with Percentage Shortcuts */}
        <View className="flex-1 justify-end pb-4" style={{ gap: 8 }}>
          {/* Percentage Shortcuts - at top of numpad area */}
          <View className="flex-row items-center justify-between px-4 pb-2">
            {PERCENTAGE_SHORTCUTS.map((shortcut) => (
              <Pressable
                key={shortcut}
                onPress={() => handlePercentagePress(shortcut)}
                hitSlop={8}
              >
                <Text
                  className="text-slate-500"
                  style={{ fontSize: 14, lineHeight: 18 }}
                >
                  {shortcut}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Numpad Keys */}
          {NUMPAD_KEYS.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row" style={{ gap: 8 }}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => handleNumpadPress(key)}
                  className="flex-1 items-center justify-center"
                  style={{
                    height: 56,
                    backgroundColor:
                      key === "back" ? "transparent" : "rgba(248, 250, 252, 0.8)",
                    borderRadius: 12,
                  }}
                >
                  {key === "back" ? (
                    <Text
                      className="text-slate-800"
                      style={{ fontSize: 24, fontWeight: "500" }}
                    >
                      ←
                    </Text>
                  ) : (
                    <Text
                      className="text-slate-800"
                      style={{ fontSize: 24, fontWeight: "500" }}
                    >
                      {key}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Review Modal */}
      <ReviewStakingModal
        visible={showReview}
        onClose={() => setShowReview(false)}
        onConfirm={handleStake}
        data={getReviewData()}
      />
    </SafeAreaView>
  );
}
