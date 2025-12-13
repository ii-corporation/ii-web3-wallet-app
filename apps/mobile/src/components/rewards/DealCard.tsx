import { View, Text, Image, ImageSourcePropType, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GradientText } from "../ui/GradientText";

interface DealCardProps {
  image: ImageSourcePropType;
  logo: ImageSourcePropType;
  title: string;
  category: string;
  itemsLeft?: number;
  onPress?: () => void;
}

export function DealCard({
  image,
  logo,
  title,
  category,
  itemsLeft,
  onPress,
}: DealCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="bg-white rounded-[10px] overflow-hidden"
        style={{
          width: 149,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 20,
          elevation: 2,
        }}
      >
        {/* Image Section */}
        <View style={{ height: 160 }}>
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Logo overlay */}
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: 10,
            }}
          >
            <View
              style={{
                width: 41,
                height: 41,
                borderRadius: 21,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                backgroundColor: "#FFF",
                overflow: "hidden",
              }}
            >
              <Image
                source={logo}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </View>
          {/* Items left badge */}
          {itemsLeft && (
            <View style={{ position: "absolute", bottom: 13, right: 8 }}>
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
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
          <Text
            className="font-semibold text-slate-900"
            style={{ fontSize: 18, lineHeight: 24 }}
          >
            {title}
          </Text>
          <GradientText style={{ fontSize: 13, lineHeight: 18 }}>
            {category}
          </GradientText>
        </View>
      </View>
    </Pressable>
  );
}
