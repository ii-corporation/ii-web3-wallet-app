import Svg, { Path, Rect } from "react-native-svg";

interface GiftCardIconProps {
  size?: number;
  color?: string;
}

export function GiftCardIcon({
  size = 44,
  color = "#8B5CF6",
}: GiftCardIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Rect
        x="4"
        y="10"
        width="36"
        height="24"
        rx="3"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M4 18H40"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M22 10V34"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M16 10C16 10 18 6 22 6C26 6 28 10 28 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
