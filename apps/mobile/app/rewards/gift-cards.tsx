import { View, Text, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  GiftCardItem,
  GiftCardDetailsSheet,
  GiftCardDetails,
} from "../../src/components/rewards";
import { PageHeader, TokenBalance, TabBar } from "../../src/components/ui";
import { useBottomSheet } from "../../src/hooks";
import { componentSpacing } from "../../src/theme";

// Placeholder images
const IMAGES = {
  amazon: require("../../assets/influencers/arlene-mccoy.png"),
  starbucks: require("../../assets/influencers/dianne-russell.png"),
  target: require("../../assets/influencers/esther-howard.png"),
  nike: require("../../assets/influencers/courtney-henry.png"),
  apple: require("../../assets/influencers/cameron-williamson.png"),
  spotify: require("../../assets/influencers/darrell-steward.png"),
  netflix: require("../../assets/influencers/devon-lane.png"),
  uber: require("../../assets/influencers/wade-warren.png"),
};

// Gift card list item type
interface GiftCardListItem {
  id: string;
  image: any;
  name: string;
  fromPrice: string;
  itemsLeft?: number;
  isCollected?: boolean;
}

// Mock gift card data for Discover tab
const DISCOVER_GIFT_CARDS: GiftCardListItem[] = [
  { id: "1", image: IMAGES.amazon, name: "Amazon Gift Card", fromPrice: "50", itemsLeft: 153 },
  { id: "2", image: IMAGES.starbucks, name: "Starbucks", fromPrice: "25", itemsLeft: 89 },
  { id: "3", image: IMAGES.target, name: "Target Gift Card", fromPrice: "50", itemsLeft: 67 },
  { id: "4", image: IMAGES.nike, name: "Nike", fromPrice: "75", itemsLeft: 42 },
  { id: "5", image: IMAGES.apple, name: "Apple Gift Card", fromPrice: "100", itemsLeft: 31 },
  { id: "6", image: IMAGES.spotify, name: "Spotify Premium", fromPrice: "10", itemsLeft: 215 },
  { id: "7", image: IMAGES.netflix, name: "Netflix", fromPrice: "15", itemsLeft: 178 },
  { id: "8", image: IMAGES.uber, name: "Uber Eats", fromPrice: "25", itemsLeft: 94 },
];

// Mock gift card data for Collected tab
const COLLECTED_GIFT_CARDS: GiftCardListItem[] = [
  { id: "c1", image: IMAGES.amazon, name: "Amazon Gift Card", fromPrice: "100", isCollected: true },
  { id: "c2", image: IMAGES.starbucks, name: "Starbucks", fromPrice: "25", isCollected: true },
];

// Mock gift card details for the bottom sheet
const GIFT_CARD_DETAILS: Record<string, GiftCardDetails> = {
  "1": {
    id: "1",
    image: IMAGES.amazon,
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
  "2": {
    id: "2",
    image: IMAGES.starbucks,
    name: "Starbucks Gift Card",
    description: "Enjoy your favorite coffee and snacks at any Starbucks location.",
    itemsLeft: 89,
    priceOptions: [
      { id: "opt1", tokenAmount: "25", dollarValue: "$5" },
      { id: "opt2", tokenAmount: "50", dollarValue: "$10" },
      { id: "opt3", tokenAmount: "125", dollarValue: "$25" },
    ],
  },
  "3": {
    id: "3",
    image: IMAGES.target,
    name: "Target Gift Card",
    description: "Shop everything from groceries to electronics at Target.",
    itemsLeft: 67,
    priceOptions: [
      { id: "opt1", tokenAmount: "50", dollarValue: "$10" },
      { id: "opt2", tokenAmount: "125", dollarValue: "$25" },
      { id: "opt3", tokenAmount: "250", dollarValue: "$50" },
    ],
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 8;
const HORIZONTAL_PADDING = componentSpacing.screen.horizontal;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

type TabType = "discover" | "collected";

// Tab definitions - follows Single Responsibility Principle
const TABS: { key: TabType; label: string }[] = [
  { key: "discover", label: "Discover" },
  { key: "collected", label: "Collected" },
];

export default function GiftCardsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("discover");

  // Use the reusable bottom sheet hook - follows DRY principle
  const detailsSheet = useBottomSheet<GiftCardDetails>();

  const giftCards = activeTab === "discover" ? DISCOVER_GIFT_CARDS : COLLECTED_GIFT_CARDS;
  const tokenBalance = "2,358";

  const handleGiftCardPress = (id: string) => {
    const details = GIFT_CARD_DETAILS[id];
    if (details) {
      detailsSheet.open(details);
    }
  };

  const handleCollect = (optionId: string) => {
    console.log("Collecting gift card with option:", optionId);
    detailsSheet.close();
    // TODO: Navigate to success screen or show confirmation
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Reusable PageHeader with blur variant */}
      <PageHeader
        title="Gift Cards"
        showBack
        showSearch
        variant="blur"
        rightContent={<TokenBalance value={tokenBalance} />}
      >
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </PageHeader>

      {/* Main content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 112,
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 20,
        }}
      >
        {giftCards.length > 0 ? (
          <View
            className="flex-row flex-wrap"
            style={{ marginHorizontal: -CARD_GAP / 2 }}
          >
            {giftCards.map((card) => (
              <View
                key={card.id}
                style={{
                  width: CARD_WIDTH,
                  marginHorizontal: CARD_GAP / 2,
                  marginBottom: CARD_GAP,
                }}
              >
                <GiftCardItem
                  image={card.image}
                  name={card.name}
                  fromPrice={card.fromPrice}
                  itemsLeft={card.itemsLeft}
                  isCollected={card.isCollected}
                  onPress={() => handleGiftCardPress(card.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-slate-500" style={{ fontSize: 16 }}>
              {activeTab === "collected"
                ? "No collected gift cards yet"
                : "No gift cards available"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Gift Card Details Sheet - uses hook state */}
      <GiftCardDetailsSheet
        visible={detailsSheet.isVisible}
        onClose={detailsSheet.close}
        onCollect={handleCollect}
        giftCard={detailsSheet.selectedItem}
      />
    </SafeAreaView>
  );
}
