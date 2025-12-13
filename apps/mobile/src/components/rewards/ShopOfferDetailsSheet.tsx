import { View, Text, Image, ImageSourcePropType, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { RewardIcon } from "../icons";
import { GradientText } from "../ui/GradientText";

export interface ShopOfferDetails {
  id: string;
  image: ImageSourcePropType;
  logo?: ImageSourcePropType;
  brandName: string;
  discount: string;
  description?: string;
  price: string;
  dollarValue?: string;
  itemsLeft?: number;
  validUntil?: string;
  terms?: string[];
}

interface ShopOfferDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  onRedeem?: () => void;
  offer: ShopOfferDetails | null;
}

export function ShopOfferDetailsSheet({
  visible,
  onClose,
  onRedeem,
  offer,
}: ShopOfferDetailsSheetProps) {
  if (!offer) return null;

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
            Offer details
          </Text>

          {/* Offer Preview */}
          <View
            className="bg-slate-100 rounded-xl overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <View style={{ position: "relative" }}>
              <Image
                source={offer.image}
                style={{ width: "100%", height: 160 }}
                resizeMode="cover"
              />
              {/* Brand Logo */}
              {offer.logo && (
                <View
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: 12,
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                  }}
                >
                  <Image
                    source={offer.logo}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              )}
              {/* Badge */}
              {offer.itemsLeft !== undefined && (
                <View style={{ position: "absolute", top: 12, right: 12 }}>
                  <LinearGradient
                    colors={["#AD42FF", "#5F89F7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      className="text-white font-semibold uppercase"
                      style={{ fontSize: 10 }}
                    >
                      {offer.itemsLeft} LEFT
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
            <View style={{ padding: 12, paddingTop: offer.logo ? 24 : 12, gap: 6 }}>
              <Text
                className="text-slate-500"
                style={{ fontSize: 12, lineHeight: 16 }}
              >
                {offer.brandName}
              </Text>
              <Text
                className="font-semibold text-slate-900"
                style={{ fontSize: 18, lineHeight: 24 }}
              >
                {offer.discount}
              </Text>
              {offer.description && (
                <Text
                  className="text-slate-600"
                  style={{ fontSize: 14, lineHeight: 20 }}
                >
                  {offer.description}
                </Text>
              )}
            </View>
          </View>

          {/* Price Section */}
          <View
            className="flex-row items-center justify-between bg-slate-100 rounded-xl"
            style={{ padding: 16 }}
          >
            <Text className="text-slate-600" style={{ fontSize: 14 }}>
              Price
            </Text>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <RewardIcon size={18} color="#AD42FF" />
                <GradientText
                  className="font-semibold"
                  style={{ fontSize: 18 }}
                >
                  {offer.price}
                </GradientText>
              </View>
              {offer.dollarValue && (
                <Text className="text-slate-500" style={{ fontSize: 14 }}>
                  ({offer.dollarValue})
                </Text>
              )}
            </View>
          </View>

          {/* Valid Until */}
          {offer.validUntil && (
            <View style={{ gap: 6 }}>
              <Text
                className="font-medium text-slate-600"
                style={{ fontSize: 14 }}
              >
                Valid until
              </Text>
              <Text
                className="text-slate-800"
                style={{ fontSize: 15, lineHeight: 20 }}
              >
                {offer.validUntil}
              </Text>
            </View>
          )}

          {/* Terms & Conditions */}
          {offer.terms && offer.terms.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text
                className="font-medium text-slate-600"
                style={{ fontSize: 14 }}
              >
                Terms & Conditions
              </Text>
              <View style={{ gap: 4 }}>
                {offer.terms.map((term, index) => (
                  <View key={index} className="flex-row" style={{ gap: 8 }}>
                    <Text className="text-slate-500" style={{ fontSize: 14 }}>
                      •
                    </Text>
                    <Text
                      className="flex-1 text-slate-700"
                      style={{ fontSize: 14, lineHeight: 20 }}
                    >
                      {term}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <View style={{ marginTop: "auto", paddingBottom: 8 }}>
          <Button type="primary" onPress={onRedeem}>
            Redeem for {offer.price} tokens
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
