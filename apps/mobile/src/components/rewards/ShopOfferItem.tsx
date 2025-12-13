import { View, Text, Image, ImageSourcePropType, Pressable } from "react-native";
import { RewardIcon } from "../icons";
import { GradientText, GradientBadge } from "../ui";
import { shadows, colors } from "../../theme";

interface ShopOfferItemProps {
  image: ImageSourcePropType;
  logo?: ImageSourcePropType;
  brandName: string;
  discount: string;
  price: string;
  itemsLeft?: number;
  onPress?: () => void;
}

/**
 * ShopOfferItem - A card component for displaying shop offers in a grid
 *
 * Features:
 * - Image with optional brand logo overlay
 * - Gradient badge for items left
 * - Brand name, discount, and price display
 *
 * @example
 * <ShopOfferItem
 *   image={hmImage}
 *   logo={hmLogo}
 *   brandName="H&M"
 *   discount="10% off all items"
 *   price="50"
 *   itemsLeft={153}
 *   onPress={() => openDetails(id)}
 * />
 */
export function ShopOfferItem({
  image,
  logo,
  brandName,
  discount,
  price,
  itemsLeft,
  onPress,
}: ShopOfferItemProps) {
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
        <View style={{ height: 94, position: "relative" }}>
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Badge - using reusable GradientBadge */}
          {itemsLeft !== undefined && (
            <View style={{ position: "absolute", top: 9, right: 8 }}>
              <GradientBadge size="sm">{itemsLeft} LEFT</GradientBadge>
            </View>
          )}
          {/* Brand Logo */}
          {logo && (
            <View
              className="overflow-hidden"
              style={{
                position: "absolute",
                bottom: -16,
                left: 12,
                width: 32,
                height: 32,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: "#FFFFFF",
              }}
            >
              <Image
                source={logo}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={{ paddingHorizontal: 12, paddingTop: logo ? 20 : 8, paddingBottom: 8, gap: 4 }}>
          <Text
            className="font-medium text-slate-500"
            style={{ fontSize: 11, lineHeight: 14 }}
          >
            {brandName}
          </Text>
          <Text
            className="font-semibold text-slate-900"
            style={{ fontSize: 14, lineHeight: 18 }}
            numberOfLines={1}
          >
            {discount}
          </Text>
          <View className="flex-row items-center" style={{ gap: 2 }}>
            <RewardIcon size={14} color={colors.primary.main} />
            <GradientText
              className="font-medium"
              style={{ fontSize: 12, lineHeight: 14 }}
            >
              {price}
            </GradientText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
