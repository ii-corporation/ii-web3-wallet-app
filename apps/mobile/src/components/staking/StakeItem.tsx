import { View, Text, Image, Pressable, ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import Svg, { Path } from "react-native-svg";
import { PRIMARY_GRADIENT } from "../../theme";

export type StakeItemState = "locked" | "claimable";

interface StakeItemProps {
  name: string;
  image: ImageSourcePropType;
  stakedAmount: string;
  lockPeriod: string;
  daysLeft?: string;
  state: StakeItemState;
  onPress?: () => void;
  onClaim?: () => void;
}

function StakesIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M1 6V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V6"
        stroke="#AD42FF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 6V2C1 1.44772 1.44772 1 2 1H10C10.5523 1 11 1.44772 11 2V6"
        stroke="#5F89F7"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StakeItem({
  name,
  image,
  stakedAmount,
  lockPeriod,
  daysLeft,
  state,
  onPress,
  onClaim,
}: StakeItemProps) {
  const isClaimable = state === "claimable";

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        borderWidth: isClaimable ? 1.6 : 1,
        borderColor: isClaimable ? "#AD42FF" : "rgba(226, 232, 240, 0.5)",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 2,
      }}
    >
      {/* Influencer Image */}
      <Image
        source={image}
        style={{
          width: 104,
          height: 104,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        }}
        resizeMode="cover"
      />

      {/* Content */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 10,
          gap: 6,
          justifyContent: "center",
        }}
      >
        {/* Name */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text
            className="font-medium text-slate-800"
            style={{ fontSize: 16, lineHeight: 22 }}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>

        {/* Details */}
        <View style={{ gap: 4 }}>
          {/* Staked amount */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text className="text-slate-500" style={{ fontSize: 12 }}>
              You staked:
            </Text>
            <Text className="text-slate-800" style={{ fontSize: 14 }}>
              {stakedAmount}
            </Text>
          </View>

          {/* Lock period */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text className="text-slate-500" style={{ fontSize: 12 }}>
              Lock period
            </Text>
            <Text className="text-slate-800" style={{ fontSize: 14 }}>
              {lockPeriod}
            </Text>
          </View>

          {/* Days left or Claim action */}
          {isClaimable ? (
            <Pressable
              onPress={onClaim}
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              hitSlop={8}
            >
              <StakesIcon size={12} />
              <MaskedView
                maskElement={
                  <Text className="font-medium" style={{ fontSize: 14 }}>
                    Claim token rewards
                  </Text>
                }
              >
                <LinearGradient
                  colors={PRIMARY_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text
                    className="font-medium opacity-0"
                    style={{ fontSize: 14 }}
                  >
                    Claim token rewards
                  </Text>
                </LinearGradient>
              </MaskedView>
            </Pressable>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text className="text-slate-500" style={{ fontSize: 12 }}>
                Days left
              </Text>
              <Text className="text-slate-800" style={{ fontSize: 14 }}>
                {daysLeft}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
