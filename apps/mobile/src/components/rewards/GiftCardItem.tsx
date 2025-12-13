import { View, Text, Image, ImageSourcePropType, Pressable } from "react-native";
import { RewardIcon } from "../icons";
import { GradientText, GradientBadge } from "../ui";
import { shadows, colors } from "../../theme";

interface GiftCardItemProps {
  image: ImageSourcePropType;
  name: string;
  fromPrice: string;
  itemsLeft?: number;
  isCollected?: boolean;
  onPress?: () => void;
}

/**
 * GiftCardItem - A card component for displaying gift cards in a grid
 *
 * Features:
 * - Image with gradient badge overlay
 * - Name and price with token icon
 * - Consistent shadow and border styling
 *
 * @example
 * <GiftCardItem
 *   image={amazonImage}
 *   name="Amazon Gift Card"
 *   fromPrice="50"
 *   itemsLeft={153}
 *   onPress={() => openDetails(id)}
 * />
 */
export function GiftCardItem({
  image,
  name,
  fromPrice,
  itemsLeft,
  isCollected,
  onPress,
}: GiftCardItemProps) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <View
        className="bg-slate-50 rounded-[10px] overflow-hidden"
        style={{
          borderWidth: 1,
          borderColor: colors.border.light,
          ...shadows.medium,
        }}
      >
        {/* Image Section */}
        <View style={{ height: 94 }}>
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Badge */}
          <View style={{ position: "absolute", top: 9, right: 8 }}>
            <GradientBadge size="sm">
              {isCollected ? "COLLECTED" : `${itemsLeft} LEFT`}
            </GradientBadge>
          </View>
        </View>

        {/* Content Section */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 4 }}>
          <Text
            className="font-semibold text-slate-900"
            style={{ fontSize: 14, lineHeight: 18 }}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Text
              className="font-medium text-slate-600"
              style={{ fontSize: 12, lineHeight: 14 }}
            >
              From
            </Text>
            <View className="flex-row items-center" style={{ gap: 2 }}>
              <RewardIcon size={14} color={colors.primary.start} />
              <GradientText
                className="font-medium"
                style={{ fontSize: 12, lineHeight: 14 }}
              >
                {fromPrice}
              </GradientText>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
