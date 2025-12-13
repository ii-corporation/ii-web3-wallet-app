import { View, Text, ScrollView, Pressable, Image, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { BlurView } from "expo-blur";
import { Button, GradientText } from "../../src/components/ui";
import { StakingIcon, HelpIcon, CloseIcon, ZoopPointsIcon, ZoopTokenIcon } from "../../src/components/icons";
import { ReviewConversionSheet, ConversionCreator } from "../../src/components/convert";

// Mock creator data
const CREATORS = [
  { id: "zoop", name: "ZOOP", image: null, isZoop: true, category: undefined },
  { id: "1", name: "Floyd McCoy", displayName: "Floyd\nMcCoy", image: require("../../assets/avatars/avatar1.png"), category: "entertainment" as const },
  { id: "2", name: "Arlene Freeman", displayName: "Arlene\nFreeman", image: require("../../assets/avatars/avatar2.png"), category: "music" as const },
  { id: "none", name: "None", image: null, isNone: true, category: undefined },
  { id: "3", name: "Wade Robertson", displayName: "Wade\nRobertson", image: require("../../assets/avatars/avatar3.png"), category: "tech-gaming" as const },
];

const LOCK_PERIODS = [30, 90, 180, 360];

// Banner Component
function ConvertBanner({ onClose }: { onClose: () => void }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(221, 214, 254, 0.5)",
        borderWidth: 2,
        borderColor: "#AD42FF",
        borderRadius: 10,
        padding: 12,
        gap: 8,
      }}
    >
      {/* Title Row */}
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <StakingIcon size={17} color="#7C3AED" />
        <Text
          className="flex-1 font-semibold text-primary-600"
          style={{ fontSize: 14, lineHeight: 18 }}
        >
          Convert your ZOOP Token
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={{ position: "absolute", right: -6, top: -6 }}
        >
          <CloseIcon size={24} color="#A78BFA" />
        </Pressable>
      </View>
      {/* Description */}
      <Text
        className="text-slate-900"
        style={{ fontSize: 13, lineHeight: 18 }}
      >
        Convert your ZOOP Points to ZOOP tokens while contributing to boost your favorite creators.
      </Text>
    </View>
  );
}

// Creator Boost Chip
function CreatorBoostChip({
  name,
  image,
  isZoop,
  isNone,
  selected,
  onPress,
}: {
  name: string;
  image: any;
  isZoop?: boolean;
  isNone?: boolean;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="p-3 rounded-[10px]"
        style={{
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "#AD42FF" : "rgba(226, 232, 240, 0.5)",
          backgroundColor: selected ? "#F5F3FF" : "#F8FAFC",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 20,
          elevation: 1,
        }}
      >
        <View className="flex-row items-center" style={{ gap: 6 }}>
          {isZoop ? (
            <View
              className="items-center justify-center rounded-lg bg-slate-800"
              style={{ width: 32, height: 32 }}
            >
              <Text className="text-white font-bold" style={{ fontSize: 10 }}>
                ZOOP
              </Text>
            </View>
          ) : isNone ? (
            <View
              className="rounded-lg bg-slate-200"
              style={{ width: 32, height: 32 }}
            />
          ) : (
            <Image
              source={image}
              style={{ width: 32, height: 32, borderRadius: 8 }}
            />
          )}
          <Text
            className="font-medium text-slate-800"
            style={{ fontSize: 12, lineHeight: 14, letterSpacing: 0.24 }}
          >
            {name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// Lock Period Chip
function LockPeriodChip({
  days,
  selected,
  onPress,
}: {
  days: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: selected ? "#F5F3FF" : "#F8FAFC",
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "#AD42FF" : "#E2E8F0",
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
  );
}

// Section Header with Help Icon
function SectionHeader({
  title,
  showHelp = true,
  actionLabel,
  onAction,
}: {
  title: string;
  showHelp?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center" style={{ gap: 4 }}>
        <Text
          className="font-medium text-slate-600"
          style={{ fontSize: 14, lineHeight: 18 }}
        >
          {title}
        </Text>
        {showHelp && <HelpIcon size={16} color="#64748B" />}
      </View>
      {actionLabel && (
        <Pressable onPress={onAction}>
          <GradientText
            className="font-semibold"
            style={{ fontSize: 14, lineHeight: 18, letterSpacing: 0.14 }}
          >
            {actionLabel}
          </GradientText>
        </Pressable>
      )}
    </View>
  );
}

export default function ConvertScreen() {
  const [showBanner, setShowBanner] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(90);
  const [showReviewSheet, setShowReviewSheet] = useState(false);

  const balance = "2,358";
  const balanceNumber = parseFloat(balance.replace(",", ""));
  const amountNumber = parseFloat(amount) || 0;
  const isOverBalance = amountNumber > balanceNumber;

  // Fee is 0.6%
  const feePercentage = 0.006;
  const feeAmount = amountNumber * feePercentage;
  const receiveAmount = amountNumber - feeAmount;
  const conversionEstimate = amount && amountNumber > 0
    ? `${receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tokens`
    : "0.00 Tokens";

  const isValid = amount && amountNumber > 0 && !isOverBalance;
  const balanceError = isOverBalance ? "Insufficient balance" : undefined;

  // Get selected creator object
  const selectedCreator = selectedCreatorId
    ? CREATORS.find(c => c.id === selectedCreatorId)
    : null;

  const handleMaxPress = () => {
    setAmount(balanceNumber.toString());
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const filtered = value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = filtered.split(".");
    if (parts.length > 2) {
      setAmount(parts[0] + "." + parts.slice(1).join(""));
    } else {
      setAmount(filtered);
    }
  };

  const handleConfirm = () => {
    if (isValid) {
      setShowReviewSheet(true);
    }
  };

  const handleConvert = () => {
    // TODO: Execute conversion
    console.log("Converting:", {
      amount: amountNumber,
      creator: selectedCreator?.name,
      lockPeriod: selectedPeriod,
      receiveAmount,
    });
    setShowReviewSheet(false);
    // Reset form
    setAmount("");
  };

  const getReviewData = useCallback(() => {
    // Build creator data for review sheet if selected (and not "none")
    let creatorData: ConversionCreator | null = null;
    if (selectedCreator && selectedCreator.id !== "none" && !selectedCreator.isZoop && selectedCreator.image) {
      creatorData = {
        id: selectedCreator.id,
        name: selectedCreator.name,
        image: selectedCreator.image,
        category: selectedCreator.category,
      };
    }

    return {
      amount: amountNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      lockPeriod: selectedPeriod,
      conversionEstimate,
      creator: creatorData,
    };
  }, [amountNumber, selectedPeriod, conversionEstimate, selectedCreator]);

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Top App Bar */}
      <BlurView
        intensity={80}
        tint="light"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: "rgba(248, 250, 252, 0.8)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 80,
          elevation: 4,
        }}
      >
        <SafeAreaView edges={["top"]}>
          <View
            className="flex-row items-center"
            style={{ height: 64, paddingLeft: 16, paddingRight: 4 }}
          >
            <Text
              className="text-2xl font-semibold text-slate-800"
              style={{ lineHeight: 30 }}
            >
              Convert
            </Text>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 88, paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <View style={{ gap: 24 }}>
          {/* Banner */}
          {showBanner && (
            <ConvertBanner onClose={() => setShowBanner(false)} />
          )}

          {/* Convert Input Cards */}
          <View style={{ gap: 12 }}>
            {/* You Convert Card */}
            <View
              className="bg-slate-50 rounded-2xl p-4"
              style={{
                borderWidth: 1,
                borderColor: "rgba(226, 232, 240, 0.5)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 20,
                elevation: 2,
                gap: 12,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-slate-500"
                  style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                >
                  You convert
                </Text>
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <Text
                    className="text-slate-500"
                    style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                  >
                    Balance:
                  </Text>
                  <Text
                    className="font-medium text-slate-800"
                    style={{ fontSize: 11, lineHeight: 14 }}
                  >
                    {balance}
                  </Text>
                  <Pressable onPress={handleMaxPress}>
                    <View
                      className="rounded px-1.5 py-0.5"
                      style={{ backgroundColor: "rgba(173, 66, 255, 0.1)" }}
                    >
                      <GradientText
                        className="font-semibold"
                        style={{ fontSize: 10, lineHeight: 12 }}
                      >
                        Max
                      </GradientText>
                    </View>
                  </Pressable>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <ZoopPointsIcon size={24} />
                  <Text
                    className="font-medium text-slate-800"
                    style={{ fontSize: 13, lineHeight: 18 }}
                  >
                    Points
                  </Text>
                </View>
                <TextInput
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  className="text-right"
                  style={{
                    fontSize: 32,
                    fontWeight: "600",
                    color: amount ? "#AD42FF" : "#94A3B8",
                    minWidth: 80,
                    flex: 1,
                  }}
                />
              </View>
              {balanceError && (
                <Text className="text-red-500" style={{ fontSize: 12, marginTop: -4 }}>
                  {balanceError}
                </Text>
              )}
            </View>

            {/* You Receive Card (readonly) - only show when user has entered an amount */}
            {amount.length > 0 && (
              <View
                className="bg-slate-50 rounded-2xl p-4"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(226, 232, 240, 0.5)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 20,
                  elevation: 2,
                  gap: 12,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-slate-500"
                    style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                  >
                    You receive
                  </Text>
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <Text
                      className="text-slate-500"
                      style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                    >
                      Rate:
                    </Text>
                    <Text
                      className="font-medium text-slate-800"
                      style={{ fontSize: 11, lineHeight: 14 }}
                    >
                      1 Point = 1 Token
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <ZoopTokenIcon size={24} />
                    <Text
                      className="font-medium text-slate-800"
                      style={{ fontSize: 13, lineHeight: 18 }}
                    >
                      Tokens
                    </Text>
                  </View>
                  <GradientText
                    className="font-semibold"
                    style={{ fontSize: 32 }}
                  >
                    {receiveAmount > 0 ? receiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </GradientText>
                </View>
              </View>
            )}

            {/* Exchange Fee */}
            <View className="flex-row items-center" style={{ gap: 4, height: 16 }}>
              <Text
                className="text-slate-500"
                style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
              >
                Exchange fee:
              </Text>
              <Text
                className="font-medium text-slate-800"
                style={{ fontSize: 11, lineHeight: 14 }}
              >
                0.6%
              </Text>
              <HelpIcon size={16} color="#64748B" />
            </View>
          </View>

          {/* Creator Boost Section */}
          <View style={{ gap: 12 }}>
            <SectionHeader
              title="Creator boost"
              actionLabel="View all"
              onAction={() => console.log("View all creators")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CREATORS.map((creator) => (
                <CreatorBoostChip
                  key={creator.id}
                  name={(creator as any).displayName || creator.name}
                  image={creator.image}
                  isZoop={(creator as any).isZoop}
                  isNone={(creator as any).isNone}
                  selected={selectedCreatorId === creator.id}
                  onPress={() => setSelectedCreatorId(creator.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Lock Period Section */}
          <View style={{ gap: 12 }}>
            <SectionHeader title="Lock period (days)" />
            <View className="flex-row" style={{ gap: 8 }}>
              {LOCK_PERIODS.map((days) => (
                <LockPeriodChip
                  key={days}
                  days={days}
                  selected={selectedPeriod === days}
                  onPress={() => setSelectedPeriod(days)}
                />
              ))}
            </View>
            {/* Conversion Estimation */}
            <View className="flex-row items-center" style={{ gap: 4, height: 16 }}>
              <View className="flex-row items-center">
                <Text
                  className="text-slate-500"
                  style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                >
                  Conversion estimation
                </Text>
                <HelpIcon size={16} color="#64748B" />
                <Text
                  className="text-slate-500"
                  style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                >
                  :
                </Text>
              </View>
              <Text
                className="font-medium text-slate-800"
                style={{ fontSize: 11, lineHeight: 14 }}
              >
                {conversionEstimate}
              </Text>
            </View>
          </View>

          {/* Disclaimer and Button */}
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 11, lineHeight: 15.4 }}>
              <Text className="font-medium text-slate-800">Disclaimer: </Text>
              <Text className="text-slate-800">
                Converting ZOOP Points into Tokens and then actively staking them is solely for platform utility, supporting creators and platform growth, without implying monetary returns or profits.
              </Text>
            </Text>
            <Button
              type="primary"
              disabled={!isValid}
              onPress={handleConfirm}
            >
              Confirm
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Review Conversion Sheet */}
      <ReviewConversionSheet
        visible={showReviewSheet}
        onClose={() => setShowReviewSheet(false)}
        onConfirm={handleConvert}
        data={getReviewData()}
      />
    </SafeAreaView>
  );
}
