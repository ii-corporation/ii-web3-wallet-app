import { View, Text, ScrollView, Image, Pressable, ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../ui/Button";
import { BottomSheet } from "../ui/BottomSheet";
import { GradientText } from "../ui/GradientText";
import {
  StakingIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  ExternalLinkIcon,
  LinkIcon,
} from "../icons";
import { CategoryType } from "./CategoryChip";

interface CreatorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  creator: {
    id: string;
    name: string;
    image: ImageSourcePropType;
    category?: CategoryType;
    description?: string;
    age?: number;
    location?: string;
    hasStaked?: boolean;
    stakedAmount?: string;
    estimatedZPY?: string;
    totalStakedUsers?: string;
    totalStaked?: string;
    smartContract?: string;
    stakingRewards?: string[];
    socials?: {
      instagram?: string;
      tiktok?: string;
      twitter?: string;
    };
  };
  onStake: () => void;
  onViewClub?: () => void;
}

const CATEGORY_LABELS: Record<CategoryType, string> = {
  entertainment: "Entertainment",
  "tech-gaming": "Tech & Gaming",
  music: "Music",
  "social-figure": "Social Figure",
  fashion: "Fashion",
  sports: "Sports",
  "health-fitness": "Health & Fitness",
  travel: "Travel",
  beauty: "Beauty",
  business: "Business",
};

export function CreatorDetailsModal({
  visible,
  onClose,
  creator,
  onStake,
  onViewClub,
}: CreatorDetailsModalProps) {
  const categoryLabel = creator.category ? CATEGORY_LABELS[creator.category] : undefined;

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.92]}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
              <View style={{ gap: 24 }}>
                {/* Title */}
                <Text
                  className="text-2xl font-semibold text-slate-800"
                  style={{ lineHeight: 30 }}
                >
                  Stake details
                </Text>

                {/* Creator Info Row */}
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <Image
                    source={creator.image}
                    style={{ width: 64, height: 64, borderRadius: 8 }}
                  />
                  <View className="flex-1" style={{ gap: 5 }}>
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="font-medium text-slate-800"
                        style={{ fontSize: 16, lineHeight: 22 }}
                        numberOfLines={1}
                      >
                        {creator.name}
                      </Text>
                      {creator.hasStaked && (
                        <View className="flex-row items-center" style={{ gap: 2 }}>
                          <StakingIcon size={14} color="#AD42FF" />
                          <GradientText
                            className="font-medium"
                            style={{ fontSize: 12 }}
                          >
                            You staked
                          </GradientText>
                        </View>
                      )}
                    </View>
                    {categoryLabel && (
                      <View
                        className="self-start rounded-lg px-[6px] py-[5px]"
                        style={{ backgroundColor: "rgba(221, 214, 254, 0.5)" }}
                      >
                        <Text
                          className="font-medium text-primary-500 uppercase"
                          style={{ fontSize: 11 }}
                        >
                          {categoryLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Description Section */}
                <View style={{ gap: 6 }}>
                  <Text className="text-slate-500" style={{ fontSize: 16 }}>
                    Description
                  </Text>
                  <View style={{ gap: 2 }}>
                    {creator.age && creator.location && (
                      <Text
                        className="text-slate-800"
                        style={{ fontSize: 15, lineHeight: 20 }}
                      >
                        {creator.age} | Based in {creator.location}
                      </Text>
                    )}
                    {creator.description && (
                      <Text
                        className="text-slate-800"
                        style={{ fontSize: 15, lineHeight: 20 }}
                      >
                        {creator.description}
                        <Text className="text-slate-500"> …more</Text>
                      </Text>
                    )}
                  </View>
                </View>

                {/* Social Links */}
                <View className="flex-row items-center" style={{ gap: 16 }}>
                  {creator.socials?.instagram && (
                    <Pressable hitSlop={8}>
                      <InstagramIcon size={24} color="#1E293B" />
                    </Pressable>
                  )}
                  {creator.socials?.tiktok && (
                    <Pressable hitSlop={8}>
                      <TikTokIcon size={24} color="#1E293B" />
                    </Pressable>
                  )}
                  {creator.socials?.twitter && (
                    <Pressable hitSlop={8}>
                      <XIcon size={24} color="#1E293B" />
                    </Pressable>
                  )}
                </View>

                {/* Staking Rewards Section */}
                {creator.stakingRewards && creator.stakingRewards.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text className="text-slate-500" style={{ fontSize: 16 }}>
                      Staking rewards
                    </Text>
                    <View>
                      {creator.stakingRewards.map((reward, index) => (
                        <Text
                          key={index}
                          className="text-slate-800"
                          style={{ fontSize: 15, lineHeight: 20, marginBottom: 4 }}
                        >
                          {reward}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Stats Section */}
                <View style={{ gap: 16 }}>
                  {creator.stakedAmount && (
                    <View className="flex-row items-center" style={{ gap: 5 }}>
                      <Text className="text-slate-500" style={{ fontSize: 16 }}>
                        You staked:
                      </Text>
                      <Text className="flex-1 text-slate-800" style={{ fontSize: 16 }}>
                        {creator.stakedAmount} Tokens
                      </Text>
                    </View>
                  )}
                  {creator.estimatedZPY && (
                    <View className="flex-row items-center" style={{ gap: 5 }}>
                      <Text className="text-slate-500" style={{ fontSize: 16 }}>
                        Estimated ZPY:
                      </Text>
                      <Text className="flex-1 text-slate-800" style={{ fontSize: 16 }}>
                        {creator.estimatedZPY}
                      </Text>
                    </View>
                  )}
                  {creator.totalStakedUsers && (
                    <View className="flex-row items-center" style={{ gap: 5 }}>
                      <Text className="text-slate-500" style={{ fontSize: 16 }}>
                        Total Staked Users:
                      </Text>
                      <Text className="flex-1 text-slate-800" style={{ fontSize: 16 }}>
                        {creator.totalStakedUsers}
                      </Text>
                    </View>
                  )}
                  {creator.totalStaked && (
                    <View className="flex-row items-center" style={{ gap: 5 }}>
                      <Text className="text-slate-500" style={{ fontSize: 16 }}>
                        Total staked:
                      </Text>
                      <Text className="flex-1 text-slate-800" style={{ fontSize: 16 }}>
                        {creator.totalStaked} Tokens
                      </Text>
                    </View>
                  )}
                  {creator.smartContract && (
                    <View className="flex-row items-start" style={{ gap: 5 }}>
                      <Text className="text-slate-500" style={{ fontSize: 16 }}>
                        Smart contract:
                      </Text>
                      <Pressable className="flex-row items-center" style={{ gap: 1 }}>
                        <Text className="text-slate-800" style={{ fontSize: 16 }}>
                          {creator.smartContract}
                        </Text>
                        <ExternalLinkIcon size={18} color="#1E293B" />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
        </ScrollView>

        {/* Action Buttons - Fixed at bottom */}
        <View className="px-4 pt-2 pb-2 bg-slate-50">
          <View className="flex-row" style={{ gap: 8 }}>
            {onViewClub && (
              <View className="flex-1">
                <Button type="outlined" onPress={onViewClub}>
                  <View className="flex-row items-center" style={{ gap: 2 }}>
                    <GradientText className="font-medium" style={{ fontSize: 14 }}>
                      View Club
                    </GradientText>
                    <LinkIcon size={20} color="#AD42FF" />
                  </View>
                </Button>
              </View>
            )}
            <View className="flex-1">
              <Button type="primary" onPress={onStake}>
                Stake
              </Button>
            </View>
          </View>
        </View>
    </BottomSheet>
  );
}
