import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, router } from "expo-router";
import {
  CategoryChip,
  CATEGORIES,
  CategoryType,
  InfluencerCard,
  StakingTabs,
  StakeStatCard,
  StakeItem,
  StakeItemState,
  CreatorDetailsModal,
  StakeDetailsSheet,
  StakeDetails,
} from "../../src/components/staking";
import { SearchIcon } from "../../src/components/icons";

// Placeholder influencer images
const INFLUENCER_IMAGES = {
  arleneMccoy: require("../../assets/influencers/arlene-mccoy.png"),
  dianneRussell: require("../../assets/influencers/dianne-russell.png"),
  estherHoward: require("../../assets/influencers/esther-howard.png"),
  courtneyHenry: require("../../assets/influencers/courtney-henry.png"),
  cameronWilliamson: require("../../assets/influencers/cameron-williamson.png"),
  darrellSteward: require("../../assets/influencers/darrell-steward.png"),
  devonLane: require("../../assets/influencers/devon-lane.png"),
  wadeWarren: require("../../assets/influencers/wade-warren.png"),
};

// Mock stake data for My Stakes tab (with full details for StakeDetailsSheet)
const MY_STAKES: StakeDetails[] = [
  {
    id: "1",
    name: "Carmelita Rose",
    image: INFLUENCER_IMAGES.arleneMccoy,
    stakedAmount: "1,200",
    lockPeriod: "90 days",
    startDate: "September 1, 2024",
    estimatedZPY: "3.67% - 7.20%",
    endDate: "November 29, 2024",
    hash: "0x1a2b3c4d5e6f7890...",
    stakeReward: "87.60",
    state: "claimable" as StakeItemState,
  },
  {
    id: "2",
    name: "Julian Winters",
    image: INFLUENCER_IMAGES.dianneRussell,
    stakedAmount: "3,500",
    lockPeriod: "180 days",
    startDate: "June 15, 2024",
    estimatedZPY: "4.50% - 8.75%",
    endDate: "December 12, 2024",
    hash: "0x9f8e7d6c5b4a3210...",
    stakeReward: "306.25",
    state: "claimable" as StakeItemState,
  },
  {
    id: "3",
    name: "Samantha Lee",
    image: INFLUENCER_IMAGES.estherHoward,
    stakedAmount: "500",
    lockPeriod: "90 days",
    startDate: "November 29, 2024",
    estimatedZPY: "3.67% - 7.20%",
    endDate: "February 27, 2025",
    hash: "0x2b3c4d5e6f7a8901...",
    daysLeft: 15,
    state: "locked" as StakeItemState,
  },
  {
    id: "4",
    name: "Marcus Holt",
    image: INFLUENCER_IMAGES.courtneyHenry,
    stakedAmount: "4,000",
    lockPeriod: "180 days",
    startDate: "October 30, 2024",
    estimatedZPY: "4.50% - 8.75%",
    endDate: "April 28, 2025",
    hash: "0x3c4d5e6f7a8b9012...",
    daysLeft: 45,
    state: "locked" as StakeItemState,
  },
  {
    id: "5",
    name: "Ava Chen",
    image: INFLUENCER_IMAGES.cameronWilliamson,
    stakedAmount: "900",
    lockPeriod: "30 days",
    startDate: "December 4, 2024",
    estimatedZPY: "2.50% - 4.00%",
    endDate: "January 3, 2025",
    hash: "0x4d5e6f7a8b9c0123...",
    daysLeft: 10,
    state: "locked" as StakeItemState,
  },
  {
    id: "6",
    name: "Oliver Smith",
    image: INFLUENCER_IMAGES.darrellSteward,
    stakedAmount: "1,500",
    lockPeriod: "150 days",
    startDate: "November 14, 2024",
    estimatedZPY: "4.00% - 7.50%",
    endDate: "April 13, 2025",
    hash: "0x5e6f7a8b9c0d1234...",
    daysLeft: 20,
    state: "locked" as StakeItemState,
  },
];

// Shared creator details for testing
const SHARED_CREATOR_DETAILS = {
  age: 25,
  location: "Manila, Philippines",
  description: "Digital content creator, gaming enthusiast, and internet personality. My life revolves around immersing myself in various characters, bringing them to life through creative costumes",
  hasStaked: true,
  stakedAmount: "250.00",
  estimatedZPY: "3.67% - 7.20%",
  totalStakedUsers: "463,059",
  totalStaked: "253,632",
  smartContract: "0.0.1128347",
  stakingRewards: [
    "Behind-the-Scenes Content: See what goes on beyond and no one sees.",
    "Exclusive Updates: Projects, plans, and stories I don't share anywhere else.",
    "Member Specials: Discounts, giveaways, or little surprises – just for you!",
  ],
  socials: { instagram: "@creator", tiktok: "@creator", twitter: "@creator" },
};

// Mock influencer data with extended info for details modal
const INFLUENCERS = [
  { id: "1", name: "Dianne Russell", image: INFLUENCER_IMAGES.dianneRussell, verified: true, size: "double" as const, category: "entertainment" as CategoryType, ...SHARED_CREATOR_DETAILS },
  { id: "2", name: "Arlene McCoy", image: INFLUENCER_IMAGES.arleneMccoy, verified: true, size: "single" as const, category: "music" as CategoryType, ...SHARED_CREATOR_DETAILS },
  { id: "3", name: "Esther Howard", image: INFLUENCER_IMAGES.estherHoward, verified: true, size: "single" as const, category: "fashion" as CategoryType, ...SHARED_CREATOR_DETAILS },
  { id: "4", name: "Devon Lane", image: INFLUENCER_IMAGES.devonLane, verified: true, size: "single" as const, category: "tech-gaming" as CategoryType, ...SHARED_CREATOR_DETAILS },
  { id: "5", name: "Wade Warren", image: INFLUENCER_IMAGES.wadeWarren, verified: true, size: "single" as const, category: "sports" as CategoryType, ...SHARED_CREATOR_DETAILS },
  { id: "6", name: "Courtney Henry", image: INFLUENCER_IMAGES.courtneyHenry, verified: true, size: "single" as const, category: "beauty" as CategoryType, ...SHARED_CREATOR_DETAILS },
  { id: "7", name: "Darrell Steward", image: INFLUENCER_IMAGES.darrellSteward, verified: true, size: "double" as const, category: "social-figure" as CategoryType, ...SHARED_CREATOR_DETAILS },
  { id: "8", name: "Cameron Williamson", image: INFLUENCER_IMAGES.cameronWilliamson, verified: true, size: "single" as const, category: "health-fitness" as CategoryType, ...SHARED_CREATOR_DETAILS },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 1;
const COLUMN_WIDTH = (SCREEN_WIDTH - GRID_GAP) / 2;

export default function StakingScreen() {
  const { tab } = useLocalSearchParams<{ tab?: "explore" | "my-stakes" }>();
  const [activeTab, setActiveTab] = useState<"explore" | "my-stakes">("explore");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<typeof INFLUENCERS[0] | null>(null);
  const [showCreatorDetails, setShowCreatorDetails] = useState(false);
  const [selectedStake, setSelectedStake] = useState<StakeDetails | null>(null);
  const [showStakeDetails, setShowStakeDetails] = useState(false);

  // Handle tab param from navigation
  useEffect(() => {
    if (tab === "explore" || tab === "my-stakes") {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleInfluencerPress = (id: string) => {
    const creator = INFLUENCERS.find((inf) => inf.id === id);
    if (creator) {
      setSelectedCreator(creator);
      setShowCreatorDetails(true);
    }
  };

  const handleCloseCreatorDetails = () => {
    setShowCreatorDetails(false);
    // Don't set selectedCreator to null - let it persist so modal can animate out properly
  };

  const handleStake = () => {
    if (selectedCreator) {
      handleCloseCreatorDetails();
      router.push(`/stake/${selectedCreator.id}`);
    }
  };

  const handleViewClub = () => {
    // TODO: Navigate to creator's club
    console.log("View club for:", selectedCreator?.name);
  };

  const handleCategoryPress = (category: CategoryType) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleStakePress = (stake: StakeDetails) => {
    setSelectedStake(stake);
    setShowStakeDetails(true);
  };

  const handleCloseStakeDetails = () => {
    setShowStakeDetails(false);
  };

  const handleClaimReward = () => {
    // TODO: Implement claim reward logic
    console.log("Claim reward for:", selectedStake?.name);
    handleCloseStakeDetails();
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
          {/* Header row - 48px effective height (64px - 16px overlap) */}
          <View
            className="flex-row items-center justify-between"
            style={{ height: 48, paddingLeft: 16, paddingRight: 4 }}
          >
            <Text className="text-2xl font-semibold text-slate-800" style={{ lineHeight: 30 }}>
              Staking
            </Text>
            <Pressable
              className="items-center justify-center"
              style={{ width: 48, height: 48 }}
              hitSlop={8}
            >
              <SearchIcon size={20} color="#475569" />
            </Pressable>
          </View>

          {/* Tabs */}
          <StakingTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </SafeAreaView>
      </BlurView>

      {/* Main content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 96 }}
      >
        {activeTab === "explore" ? (
          <>
            {/* Category Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 6,
              }}
            >
              {CATEGORIES.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  category={cat.id}
                  label={cat.label}
                  selected={selectedCategory === cat.id}
                  onPress={() => handleCategoryPress(cat.id)}
                />
              ))}
            </ScrollView>

            {/* Masonry Grid */}
            <View className="flex-row" style={{ gap: GRID_GAP }}>
              {/* Left Column */}
              <View style={{ width: COLUMN_WIDTH, gap: GRID_GAP }}>
                {/* Dianne Russell - Double height */}
                <View style={{ height: COLUMN_WIDTH * 2 + GRID_GAP }}>
                  <InfluencerCard
                    name="Dianne Russell"
                    image={INFLUENCER_IMAGES.dianneRussell}
                    verified={true}
                    size="double"
                    onPress={() => handleInfluencerPress("1")}
                  />
                </View>
                {/* Devon Lane */}
                <View style={{ height: COLUMN_WIDTH }}>
                  <InfluencerCard
                    name="Devon Lane"
                    image={INFLUENCER_IMAGES.devonLane}
                    verified={true}
                    onPress={() => handleInfluencerPress("4")}
                  />
                </View>
                {/* Courtney Henry */}
                <View style={{ height: COLUMN_WIDTH }}>
                  <InfluencerCard
                    name="Courtney Henry"
                    image={INFLUENCER_IMAGES.courtneyHenry}
                    verified={true}
                    onPress={() => handleInfluencerPress("6")}
                  />
                </View>
                {/* Cameron Williamson */}
                <View style={{ height: COLUMN_WIDTH }}>
                  <InfluencerCard
                    name="Cameron Williamson"
                    image={INFLUENCER_IMAGES.cameronWilliamson}
                    verified={true}
                    onPress={() => handleInfluencerPress("8")}
                  />
                </View>
              </View>

              {/* Right Column */}
              <View style={{ width: COLUMN_WIDTH, gap: GRID_GAP }}>
                {/* Arlene McCoy */}
                <View style={{ height: COLUMN_WIDTH }}>
                  <InfluencerCard
                    name="Arlene McCoy"
                    image={INFLUENCER_IMAGES.arleneMccoy}
                    verified={true}
                    onPress={() => handleInfluencerPress("2")}
                  />
                </View>
                {/* Esther Howard */}
                <View style={{ height: COLUMN_WIDTH }}>
                  <InfluencerCard
                    name="Esther Howard"
                    image={INFLUENCER_IMAGES.estherHoward}
                    verified={true}
                    onPress={() => handleInfluencerPress("3")}
                  />
                </View>
                {/* Wade Warren */}
                <View style={{ height: COLUMN_WIDTH }}>
                  <InfluencerCard
                    name="Wade Warren"
                    image={INFLUENCER_IMAGES.wadeWarren}
                    verified={true}
                    onPress={() => handleInfluencerPress("5")}
                  />
                </View>
                {/* Darrell Steward - Double height */}
                <View style={{ height: COLUMN_WIDTH * 2 + GRID_GAP }}>
                  <InfluencerCard
                    name="Darrell Steward"
                    image={INFLUENCER_IMAGES.darrellSteward}
                    verified={true}
                    size="double"
                    onPress={() => handleInfluencerPress("7")}
                  />
                </View>
              </View>
            </View>
          </>
        ) : (
          /* My Stakes Tab Content */
          <View className="px-4" style={{ gap: 12, paddingTop: 12 }}>
            {/* Stats Row */}
            <View className="flex-row" style={{ gap: 8 }}>
              <StakeStatCard label="Total staked" value="8,300" />
              <StakeStatCard
                label="Total earned"
                value="430"
                showHelpIcon
                onHelpPress={() => console.log("Help: Total earned")}
              />
              <StakeStatCard
                label="Estimated ZPY"
                value="5.75%"
                showHelpIcon
                onHelpPress={() => console.log("Help: Estimated ZPY")}
              />
            </View>

            {/* Stake Items List */}
            <View style={{ gap: 4 }}>
              {MY_STAKES.map((stake) => (
                <StakeItem
                  key={stake.id}
                  name={stake.name}
                  image={stake.image}
                  stakedAmount={stake.stakedAmount}
                  lockPeriod={stake.lockPeriod}
                  daysLeft={stake.daysLeft ? `${stake.daysLeft} days` : undefined}
                  state={stake.state}
                  onPress={() => handleStakePress(stake)}
                  onClaim={() => handleStakePress(stake)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Creator Details Modal */}
      {selectedCreator && (
        <CreatorDetailsModal
          visible={showCreatorDetails}
          onClose={handleCloseCreatorDetails}
          creator={selectedCreator}
          onStake={handleStake}
          onViewClub={handleViewClub}
        />
      )}

      {/* Stake Details Sheet */}
      <StakeDetailsSheet
        visible={showStakeDetails}
        onClose={handleCloseStakeDetails}
        onClaim={handleClaimReward}
        stake={selectedStake}
      />
    </SafeAreaView>
  );
}
