import { View, Text, Image, ImageSourcePropType, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GradientText } from "../ui/GradientText";
import { ChevronRightIcon, RewardIcon } from "../icons";

interface SimilarBrand {
  image: ImageSourcePropType;
}

interface RewardCardProps {
  image: ImageSourcePropType;
  brandLogo: ImageSourcePropType;
  brandName: string;
  title: string;
  subtitle: string;
  price: string;
  itemsLeft?: number;
  similarBrands?: SimilarBrand[];
  onPress?: () => void;
}

export function RewardCard({
  image,
  brandLogo,
  brandName,
  title,
  subtitle,
  price,
  itemsLeft,
  similarBrands = [],
  onPress,
}: RewardCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="bg-slate-50 rounded-[10px] overflow-hidden"
        style={{
          borderWidth: 1,
          borderColor: "#E2E8F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 20,
          elevation: 3,
        }}
      >
        {/* Image Section */}
        <View style={{ height: 160, position: "relative" }}>
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Brand overlay */}
          <LinearGradient
            colors={["#4A4A4A", "rgba(102,102,102,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderRadius: 10,
            }}
          >
            <Image
              source={brandLogo}
              style={{ width: 24, height: 24, borderRadius: 12 }}
            />
            <Text
              className="font-semibold text-slate-50 flex-1"
              style={{ fontSize: 16, lineHeight: 22 }}
            >
              {brandName}
            </Text>
            {itemsLeft && (
              <LinearGradient
                colors={["#AD42FF", "#5F89F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text
                  className="text-slate-50 font-semibold uppercase"
                  style={{ fontSize: 11, letterSpacing: 0.66 }}
                >
                  {itemsLeft} left
                </Text>
              </LinearGradient>
            )}
          </LinearGradient>
        </View>

        {/* Content Section */}
        <View style={{ padding: 16, gap: 16 }}>
          {/* Title & Price */}
          <View style={{ gap: 8 }}>
            <View style={{ gap: 4 }}>
              <Text
                className="font-semibold text-slate-900"
                style={{ fontSize: 18, lineHeight: 24 }}
              >
                {title}
              </Text>
              <Text
                className="text-slate-900"
                style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
              >
                {subtitle}
              </Text>
            </View>
            {/* Price Badge */}
            <LinearGradient
              colors={["#AD42FF", "#5F89F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                paddingLeft: 8,
                paddingRight: 12,
                paddingVertical: 4,
                borderRadius: 100,
              }}
            >
              <RewardIcon size={14} color="#F8FAFC" />
              <Text
                className="text-slate-50 font-semibold uppercase"
                style={{ fontSize: 11, letterSpacing: 0.66 }}
              >
                {price}
              </Text>
            </LinearGradient>
          </View>

          {/* Similar Brands Row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <GradientText style={{ fontSize: 13, lineHeight: 18 }}>
                Similar to {brandName}
              </GradientText>
              <View className="flex-row" style={{ paddingRight: 4 }}>
                {similarBrands.slice(0, 3).map((brand, index) => (
                  <Image
                    key={index}
                    source={brand.image}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      marginLeft: index > 0 ? -4 : 0,
                    }}
                  />
                ))}
              </View>
            </View>
            <ChevronRightIcon size={18} color="#64748B" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
