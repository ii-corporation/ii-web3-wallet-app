import { View, Text, Image, Pressable, ImageSourcePropType } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { ExternalLinkIcon } from "../icons";
import { StakeItemState } from "./StakeItem";

export interface StakeDetails {
  id: string;
  name: string;
  image: ImageSourcePropType;
  stakedAmount: string;
  startDate: string;
  lockPeriod: string;
  estimatedZPY: string;
  endDate: string;
  hash: string;
  daysLeft?: number;
  stakeReward?: string;
  state: StakeItemState;
}

interface StakeDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  onClaim?: () => void;
  stake: StakeDetails | null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 5 }}>
      <Text className="text-slate-500" style={{ fontSize: 16 }}>
        {label}
      </Text>
      <Text className="flex-1 text-slate-800" style={{ fontSize: 16 }}>
        {value}
      </Text>
    </View>
  );
}

function HashRow({ hash }: { hash: string }) {
  return (
    <View className="flex-row items-start" style={{ gap: 5 }}>
      <Text className="text-slate-500" style={{ fontSize: 16 }}>
        Hash:
      </Text>
      <Pressable className="flex-row items-center flex-1" style={{ gap: 1 }}>
        <Text
          className="text-slate-800"
          style={{ fontSize: 16 }}
          numberOfLines={1}
        >
          {hash}
        </Text>
        <ExternalLinkIcon size={18} color="#475569" />
      </Pressable>
    </View>
  );
}

export function StakeDetailsSheet({
  visible,
  onClose,
  onClaim,
  stake,
}: StakeDetailsSheetProps) {
  if (!stake) return null;

  const isClaimable = stake.state === "claimable";
  const badgeText = isClaimable ? "Claimable" : `${stake.daysLeft} days left`;
  const buttonText = isClaimable
    ? "Claim reward"
    : `Claimable in ${stake.daysLeft} days`;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[isClaimable ? 0.72 : 0.68]}
    >
      <View className="flex-1 px-4" style={{ gap: 32 }}>
        {/* Content */}
        <View style={{ gap: 20 }}>
          {/* Title */}
          <Text
            className="font-semibold text-slate-800"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            Stake details
          </Text>

          {/* Creator Info */}
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <Image
              source={stake.image}
              style={{ width: 64, height: 64, borderRadius: 8 }}
            />
            <View className="flex-1" style={{ gap: 5 }}>
              <Text
                className="font-medium text-slate-800"
                style={{ fontSize: 16, lineHeight: 22 }}
                numberOfLines={1}
              >
                {stake.name}
              </Text>
              <View
                className="self-start rounded-lg px-[6px] py-[5px]"
                style={{ backgroundColor: "rgba(221, 214, 254, 0.5)" }}
              >
                <Text
                  className="font-medium text-primary-500 uppercase"
                  style={{ fontSize: 11 }}
                >
                  {badgeText}
                </Text>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={{ gap: 16 }}>
            <DetailRow label="You staked:" value={`${stake.stakedAmount} Tokens`} />
            <DetailRow label="Start date:" value={stake.startDate} />
            <DetailRow label="Lock period:" value={stake.lockPeriod} />
            <DetailRow label="Estimated ZPY:" value={stake.estimatedZPY} />
            <DetailRow label="End date:" value={stake.endDate} />
            {isClaimable && stake.stakeReward && (
              <DetailRow label="Stake reward:" value={`${stake.stakeReward} Tokens`} />
            )}
            <HashRow hash={stake.hash} />
          </View>
        </View>

        {/* Action Button */}
        <View style={{ marginTop: "auto" }}>
          <Button
            type="primary"
            disabled={!isClaimable}
            onPress={isClaimable ? onClaim : undefined}
          >
            {buttonText}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
