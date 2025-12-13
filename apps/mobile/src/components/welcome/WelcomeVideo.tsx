import { View, Image, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const LOGO_SIZE = Math.min(SCREEN_WIDTH * 0.5, 200);

/**
 * WelcomeVideo - Animation component for welcome screen
 *
 * TODO: Replace with animation from design team
 * Options:
 * - Lottie animation (preferred - small, transparent, cross-platform)
 * - Video with transparency
 */
export function WelcomeVideo() {
  return (
    <View className="flex-1 items-center justify-center py-5">
      <Image
        source={require("../../../assets/images/zoop-logo.png")}
        style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
        resizeMode="contain"
      />
    </View>
  );
}
