import { View, Text, Pressable, ImageBackground, ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { VerifiedIcon } from "../icons";

interface InfluencerCardProps {
  name: string;
  image: ImageSourcePropType;
  verified?: boolean;
  onPress?: () => void;
  size?: "single" | "double";
}

export function InfluencerCard({
  name,
  image,
  verified = true,
  onPress,
  size = "single",
}: InfluencerCardProps) {
  const isDouble = size === "double";

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        aspectRatio: isDouble ? 0.5 : 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 1,
      }}
    >
      <ImageBackground
        source={image}
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
        imageStyle={{
          resizeMode: "cover",
        }}
      >
        {/* Gradient overlay at bottom */}
        <LinearGradient
          colors={["transparent", "rgba(15, 23, 42, 0.6)"]}
          locations={[0.5575, 0.7825]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          }}
        />

        {/* Name and verified badge */}
        <View
          className="flex-row items-center justify-center p-4"
          style={{ gap: 2 }}
        >
          <Text
            className="text-[14px] font-medium text-slate-50"
            numberOfLines={1}
          >
            {name}
          </Text>
          {verified && <VerifiedIcon size={16} />}
        </View>
      </ImageBackground>
    </Pressable>
  );
}
