import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import {
  ShopOfferItem,
  ShopOfferDetailsSheet,
  ShopOfferDetails,
} from "../../src/components/rewards";
import {
  BackIcon,
  SearchIcon,
  RewardIcon,
} from "../../src/components/icons";
import { GradientText } from "../../src/components/ui";

// Placeholder images
const IMAGES = {
  hm: require("../../assets/influencers/arlene-mccoy.png"),
  zara: require("../../assets/influencers/dianne-russell.png"),
  nike: require("../../assets/influencers/esther-howard.png"),
  adidas: require("../../assets/influencers/courtney-henry.png"),
  uniqlo: require("../../assets/influencers/cameron-williamson.png"),
  gap: require("../../assets/influencers/darrell-steward.png"),
  forever21: require("../../assets/influencers/devon-lane.png"),
  oldnavy: require("../../assets/influencers/wade-warren.png"),
};

// Mock shop offers data
const SHOP_OFFERS = [
  {
    id: "1",
    image: IMAGES.hm,
    logo: IMAGES.hm,
    brandName: "H&M",
    discount: "10% off all items",
    price: "50",
    itemsLeft: 153
  },
  {
    id: "2",
    image: IMAGES.zara,
    logo: IMAGES.zara,
    brandName: "Zara",
    discount: "15% off new arrivals",
    price: "75",
    itemsLeft: 89
  },
  {
    id: "3",
    image: IMAGES.nike,
    logo: IMAGES.nike,
    brandName: "Nike",
    discount: "$20 off $100+",
    price: "100",
    itemsLeft: 67
  },
  {
    id: "4",
    image: IMAGES.adidas,
    logo: IMAGES.adidas,
    brandName: "Adidas",
    discount: "20% off footwear",
    price: "80",
    itemsLeft: 42
  },
  {
    id: "5",
    image: IMAGES.uniqlo,
    logo: IMAGES.uniqlo,
    brandName: "Uniqlo",
    discount: "Free shipping",
    price: "25",
    itemsLeft: 215
  },
  {
    id: "6",
    image: IMAGES.gap,
    logo: IMAGES.gap,
    brandName: "Gap",
    discount: "Buy 2 get 1 free",
    price: "60",
    itemsLeft: 78
  },
  {
    id: "7",
    image: IMAGES.forever21,
    logo: IMAGES.forever21,
    brandName: "Forever 21",
    discount: "25% off everything",
    price: "40",
    itemsLeft: 134
  },
  {
    id: "8",
    image: IMAGES.oldnavy,
    logo: IMAGES.oldnavy,
    brandName: "Old Navy",
    discount: "$15 off $75+",
    price: "35",
    itemsLeft: 94
  },
];

// Mock offer details for the bottom sheet
const OFFER_DETAILS: Record<string, ShopOfferDetails> = {
  "1": {
    id: "1",
    image: IMAGES.hm,
    logo: IMAGES.hm,
    brandName: "H&M",
    discount: "10% off all items",
    description: "Get 10% off your entire purchase at any H&M store or online.",
    price: "50",
    dollarValue: "$5",
    itemsLeft: 153,
    validUntil: "December 31, 2024",
    terms: [
      "Valid for one-time use only",
      "Cannot be combined with other offers",
      "Minimum purchase of $25 required",
      "Valid in-store and online",
    ],
  },
  "2": {
    id: "2",
    image: IMAGES.zara,
    logo: IMAGES.zara,
    brandName: "Zara",
    discount: "15% off new arrivals",
    description: "Save 15% on all new season items at Zara.",
    price: "75",
    dollarValue: "$7.50",
    itemsLeft: 89,
    validUntil: "January 15, 2025",
    terms: [
      "Applies to new arrivals section only",
      "Not valid on sale items",
      "One coupon per transaction",
    ],
  },
  "3": {
    id: "3",
    image: IMAGES.nike,
    logo: IMAGES.nike,
    brandName: "Nike",
    discount: "$20 off $100+",
    description: "Get $20 off when you spend $100 or more at Nike.",
    price: "100",
    dollarValue: "$10",
    itemsLeft: 67,
    validUntil: "February 28, 2025",
    terms: [
      "Minimum spend of $100 required",
      "Excludes clearance items",
      "Valid on full-price items only",
    ],
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 8;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function ShopsPage() {
  const [selectedOffer, setSelectedOffer] = useState<ShopOfferDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const tokenBalance = "2,358";

  const handleOfferPress = (id: string) => {
    const details = OFFER_DETAILS[id];
    if (details) {
      setSelectedOffer(details);
      setShowDetails(true);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const handleRedeem = () => {
    console.log("Redeeming offer:", selectedOffer?.id);
    handleCloseDetails();
    // TODO: Navigate to success screen or show confirmation
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Top App Bar with blur effect */}
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
          {/* Header row */}
          <View
            className="flex-row items-center justify-between"
            style={{ height: 48, paddingLeft: 4, paddingRight: 4 }}
          >
            {/* Left: Back button and title */}
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="items-center justify-center"
                style={{ width: 40, height: 40 }}
              >
                <BackIcon size={24} color="#1E293B" />
              </Pressable>
              <Text
                className="text-xl font-semibold text-slate-800"
                style={{ lineHeight: 26 }}
              >
                Shops
              </Text>
            </View>

            {/* Right: Token balance and search */}
            <View className="flex-row items-center" style={{ gap: 8 }}>
              {/* Token Balance */}
              <View
                className="flex-row items-center bg-slate-100 rounded-full"
                style={{ paddingHorizontal: 10, paddingVertical: 6, gap: 4 }}
              >
                <RewardIcon size={16} color="#AD42FF" />
                <GradientText
                  className="font-semibold"
                  style={{ fontSize: 14, lineHeight: 18 }}
                >
                  {tokenBalance}
                </GradientText>
              </View>
              {/* Search button */}
              <Pressable
                className="items-center justify-center"
                style={{ width: 40, height: 40 }}
                hitSlop={8}
              >
                <SearchIcon size={20} color="#475569" />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Main content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 64,
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 20,
        }}
      >
        {SHOP_OFFERS.length > 0 ? (
          <View
            className="flex-row flex-wrap"
            style={{ marginHorizontal: -CARD_GAP / 2 }}
          >
            {SHOP_OFFERS.map((offer) => (
              <View
                key={offer.id}
                style={{
                  width: CARD_WIDTH,
                  marginHorizontal: CARD_GAP / 2,
                  marginBottom: CARD_GAP,
                }}
              >
                <ShopOfferItem
                  image={offer.image}
                  logo={offer.logo}
                  brandName={offer.brandName}
                  discount={offer.discount}
                  price={offer.price}
                  itemsLeft={offer.itemsLeft}
                  onPress={() => handleOfferPress(offer.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-slate-500" style={{ fontSize: 16 }}>
              No shop offers available
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Shop Offer Details Sheet */}
      <ShopOfferDetailsSheet
        visible={showDetails}
        onClose={handleCloseDetails}
        onRedeem={handleRedeem}
        offer={selectedOffer}
      />
    </SafeAreaView>
  );
}
