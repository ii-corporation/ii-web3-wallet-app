import Svg, { Path, Rect } from "react-native-svg";

interface ShopIconProps {
  size?: number;
  color?: string;
}

export function ShopIcon({
  size = 44,
  color = "#8B5CF6",
}: ShopIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Path
        d="M8 16L11 6H33L36 16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="6"
        y="16"
        width="32"
        height="22"
        rx="2"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M6 22H38"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M18 28H26V38H18V28Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
