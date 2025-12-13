import { View, Text, Image, ImageSourcePropType, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { RewardIcon } from "../icons";
import { GradientText } from "../ui/GradientText";

export interface GiftCardDetails {
  id: string;
  image: ImageSourcePropType;
  name: string;
  description?: string;
  itemsLeft?: number;
  priceOptions: {
    id: string;
    tokenAmount: string;
    dollarValue: string;
  }[];
}

interface GiftCardDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  onCollect?: (selectedOptionId: string) => void;
  giftCard: GiftCardDetails | null;
}

function PriceOption({
  tokenAmount,
  dollarValue,
  selected,
  onPress,
}: {
  tokenAmount: string;
  dollarValue: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="rounded-xl overflow-hidden"
        style={{
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "#AD42FF" : "#E2E8F0",
        }}
      >
        {selected ? (
          <LinearGradient
            colors={["rgba(173, 66, 255, 0.1)", "rgba(95, 137, 247, 0.1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 16, paddingVertical: 12 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <RewardIcon size={18} color="#AD42FF" />
                <GradientText
                  className="font-semibold"
                  style={{ fontSize: 16 }}
                >
                  {tokenAmount}
                </GradientText>
              </View>
              <Text
                className="font-medium text-slate-600"
                style={{ fontSize: 14 }}
              >
                {dollarValue}
              </Text>
            </View>
          </LinearGradient>
        ) : (
          <View
            className="bg-slate-50"
            style={{ paddingHorizontal: 16, paddingVertical: 12 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <RewardIcon size={18} color="#64748B" />
                <Text
                  className="font-semibold text-slate-600"
                  style={{ fontSize: 16 }}
                >
                  {tokenAmount}
                </Text>
              </View>
              <Text
                className="font-medium text-slate-600"
                style={{ fontSize: 14 }}
              >
                {dollarValue}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function GiftCardDetailsSheet({
  visible,
  onClose,
  onCollect,
  giftCard,
}: GiftCardDetailsSheetProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  if (!giftCard) return null;

  const handleCollect = () => {
    if (selectedOptionId && onCollect) {
      onCollect(selectedOptionId);
    }
  };

  const selectedOption = giftCard.priceOptions.find(
    (opt) => opt.id === selectedOptionId
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.75]}>
      <View className="flex-1 px-4" style={{ gap: 24 }}>
        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 20 }}
        >
          {/* Title */}
          <Text
            className="font-semibold text-slate-800"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            Gift Card details
          </Text>

          {/* Gift Card Preview */}
          <View
            className="bg-slate-100 rounded-xl overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Image
              source={giftCard.image}
              style={{ width: "100%", height: 160 }}
              resizeMode="cover"
            />
            <View style={{ padding: 12, gap: 4 }}>
              <View className="flex-row items-center justify-between">
                <Text
                  className="font-semibold text-slate-900"
                  style={{ fontSize: 18, lineHeight: 24 }}
                >
                  {giftCard.name}
                </Text>
                {giftCard.itemsLeft !== undefined && (
                  <LinearGradient
                    colors={["#AD42FF", "#5F89F7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      className="text-white font-semibold uppercase"
                      style={{ fontSize: 10 }}
                    >
                      {giftCard.itemsLeft} LEFT
                    </Text>
                  </LinearGradient>
                )}
              </View>
              {giftCard.description && (
                <Text
                  className="text-slate-600"
                  style={{ fontSize: 14, lineHeight: 20 }}
                >
                  {giftCard.description}
                </Text>
              )}
            </View>
          </View>

          {/* Price Options */}
          <View style={{ gap: 10 }}>
            <Text
              className="font-medium text-slate-600"
              style={{ fontSize: 14 }}
            >
              Select amount
            </Text>
            <View style={{ gap: 8 }}>
              {giftCard.priceOptions.map((option) => (
                <PriceOption
                  key={option.id}
                  tokenAmount={option.tokenAmount}
                  dollarValue={option.dollarValue}
                  selected={selectedOptionId === option.id}
                  onPress={() => setSelectedOptionId(option.id)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={{ marginTop: "auto", paddingBottom: 8 }}>
          <Button
            type="primary"
            disabled={!selectedOptionId}
            onPress={handleCollect}
          >
            {selectedOption
              ? `Collect for ${selectedOption.tokenAmount} tokens`
              : "Select an amount"}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
