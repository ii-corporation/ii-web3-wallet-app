import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import {
  DealCard,
  ProductItem,
  RewardCard,
  GiftCardDetailsSheet,
  ShopOfferDetailsSheet,
  GiftCardDetails,
  ShopOfferDetails,
} from "../../src/components/rewards";
import { SearchIcon, GiftCardIcon, ShopIcon } from "../../src/components/icons";
import { useBottomSheet } from "../../src/hooks";

// Placeholder images - using influencer images as placeholders
const IMAGES = {
  amazonBg: require("../../assets/influencers/arlene-mccoy.png"),
  hmBg: require("../../assets/influencers/dianne-russell.png"),
  amazonLogo: require("../../assets/influencers/cameron-williamson.png"),
  hmLogo: require("../../assets/influencers/courtney-henry.png"),
  similar1: require("../../assets/influencers/devon-lane.png"),
  similar2: require("../../assets/influencers/esther-howard.png"),
  similar3: require("../../assets/influencers/wade-warren.png"),
};

// Mock data for Top Deals
const TOP_DEALS = [
  {
    id: "1",
    image: IMAGES.amazonBg,
    logo: IMAGES.amazonLogo,
    title: "Amazon",
    category: "Gift Cards",
    itemsLeft: 153,
  },
  {
    id: "2",
    image: IMAGES.hmBg,
    logo: IMAGES.hmLogo,
    title: "H&M",
    category: "Shops",
    itemsLeft: 153,
  },
  {
    id: "3",
    image: IMAGES.amazonBg,
    logo: IMAGES.amazonLogo,
    title: "Amazon",
    category: "Gift Cards",
    itemsLeft: 153,
  },
];

// Mock data for Featured Rewards
const FEATURED_REWARDS = [
  {
    id: "1",
    type: "shop" as const,
    image: IMAGES.hmBg,
    brandLogo: IMAGES.hmLogo,
    brandName: "H&M",
    title: "10% discount at H&M",
    subtitle: "Your top stores",
    price: "50 / $10",
    itemsLeft: 153,
    similarBrands: [
      { image: IMAGES.similar1 },
      { image: IMAGES.similar2 },
      { image: IMAGES.similar3 },
    ],
  },
  {
    id: "2",
    type: "giftcard" as const,
    image: IMAGES.amazonBg,
    brandLogo: IMAGES.amazonLogo,
    brandName: "Amazon",
    title: "Amazon Gift Cards from $50",
    subtitle: "Your top brands",
    price: "50 / $10",
    itemsLeft: 153,
    similarBrands: [
      { image: IMAGES.similar1 },
      { image: IMAGES.similar2 },
      { image: IMAGES.similar3 },
    ],
  },
];

// Detail data for bottom sheets
const GIFT_CARD_DETAILS: Record<string, GiftCardDetails> = {
  amazon: {
    id: "amazon",
    image: IMAGES.amazonBg,
    name: "Amazon Gift Card",
    description: "Shop millions of products on Amazon with this digital gift card.",
    itemsLeft: 153,
    priceOptions: [
      { id: "opt1", tokenAmount: "50", dollarValue: "$10" },
      { id: "opt2", tokenAmount: "100", dollarValue: "$20" },
      { id: "opt3", tokenAmount: "250", dollarValue: "$50" },
      { id: "opt4", tokenAmount: "500", dollarValue: "$100" },
    ],
  },
};

const SHOP_OFFER_DETAILS: Record<string, ShopOfferDetails> = {
  hm: {
    id: "hm",
    image: IMAGES.hmBg,
    logo: IMAGES.hmLogo,
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
};

export default function RewardsScreen() {
  // Bottom sheet state management using reusable hooks
  const giftCardSheet = useBottomSheet<GiftCardDetails>();
  const shopOfferSheet = useBottomSheet<ShopOfferDetails>();

  // Handle deal card press - determine type and open appropriate sheet
  const handleDealPress = (deal: typeof TOP_DEALS[0]) => {
    if (deal.category === "Gift Cards") {
      const details = GIFT_CARD_DETAILS.amazon; // Map deal to details
      if (details) giftCardSheet.open(details);
    } else if (deal.category === "Shops") {
      const details = SHOP_OFFER_DETAILS.hm;
      if (details) shopOfferSheet.open(details);
    }
  };

  // Handle featured reward press
  const handleRewardPress = (reward: typeof FEATURED_REWARDS[0]) => {
    if (reward.type === "giftcard") {
      const details = GIFT_CARD_DETAILS.amazon;
      if (details) giftCardSheet.open(details);
    } else if (reward.type === "shop") {
      const details = SHOP_OFFER_DETAILS.hm;
      if (details) shopOfferSheet.open(details);
    }
  };

  // Handle collect/redeem actions
  const handleCollectGiftCard = (optionId: string) => {
    console.log("Collecting gift card with option:", optionId);
    giftCardSheet.close();
  };

  const handleRedeemOffer = () => {
    console.log("Redeeming offer:", shopOfferSheet.selectedItem?.id);
    shopOfferSheet.close();
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
          <View
            className="flex-row items-center justify-between"
            style={{ height: 48, paddingLeft: 16, paddingRight: 4 }}
          >
            <Text className="text-2xl font-semibold text-slate-800" style={{ lineHeight: 30 }}>
              Rewards
            </Text>
            <Pressable
              className="items-center justify-center"
              style={{ width: 48, height: 48 }}
              hitSlop={8}
            >
              <SearchIcon size={20} color="#475569" />
            </Pressable>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 20 }}
      >
        <View className="px-4" style={{ gap: 12 }}>
          {/* Top Deals Section */}
          <View
            className="bg-slate-50 rounded-[10px]"
            style={{
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.03,
              shadowRadius: 20,
              elevation: 2,
            }}
          >
            <Text
              className="font-semibold text-slate-600"
              style={{ fontSize: 16, lineHeight: 22, marginBottom: 8 }}
            >
              Top deals
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {TOP_DEALS.map((deal) => (
                <DealCard
                  key={deal.id}
                  image={deal.image}
                  logo={deal.logo}
                  title={deal.title}
                  category={deal.category}
                  itemsLeft={deal.itemsLeft}
                  onPress={() => handleDealPress(deal)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Products Section */}
          <View
            className="bg-slate-50 rounded-[16px]"
            style={{
              borderWidth: 1,
              borderColor: "#E2E8F0",
              padding: 12,
            }}
          >
            <View style={{ gap: 4, marginBottom: 12 }}>
              <Text
                className="font-semibold text-slate-950"
                style={{ fontSize: 20, lineHeight: 24 }}
              >
                Products
              </Text>
              <Text
                className="text-slate-600"
                style={{ fontSize: 13, lineHeight: 18 }}
              >
                Explore the many options available
              </Text>
            </View>
            <View>
              <ProductItem
                icon={<GiftCardIcon size={44} color="#8B5CF6" />}
                title="Gift Cards"
                description="Convert your tokens into amazing gift cards that you can use later."
                onPress={() => router.push("/rewards/gift-cards")}
              />
              <ProductItem
                icon={<ShopIcon size={44} color="#8B5CF6" />}
                title="Shops"
                description="Get access to exclusive discounts and coupon codes to save cash."
                onPress={() => router.push("/rewards/shops")}
              />
            </View>
          </View>

          {/* Featured Rewards */}
          {FEATURED_REWARDS.map((reward) => (
            <RewardCard
              key={reward.id}
              image={reward.image}
              brandLogo={reward.brandLogo}
              brandName={reward.brandName}
              title={reward.title}
              subtitle={reward.subtitle}
              price={reward.price}
              itemsLeft={reward.itemsLeft}
              similarBrands={reward.similarBrands}
              onPress={() => handleRewardPress(reward)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Gift Card Details Bottom Sheet */}
      <GiftCardDetailsSheet
        visible={giftCardSheet.isVisible}
        onClose={giftCardSheet.close}
        onCollect={handleCollectGiftCard}
        giftCard={giftCardSheet.selectedItem}
      />

      {/* Shop Offer Details Bottom Sheet */}
      <ShopOfferDetailsSheet
        visible={shopOfferSheet.isVisible}
        onClose={shopOfferSheet.close}
        onRedeem={handleRedeemOffer}
        offer={shopOfferSheet.selectedItem}
      />
    </SafeAreaView>
  );
}
