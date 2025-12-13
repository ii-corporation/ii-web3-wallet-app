import Svg, { Path } from "react-native-svg";

interface TikTokIconProps {
  size?: number;
  color?: string;
}

export function TikTokIcon({ size = 24, color = "#1E293B" }: TikTokIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 12C6.79086 12 5 13.7909 5 16C5 18.2091 6.79086 20 9 20C11.2091 20 13 18.2091 13 16V4C13.3333 5.33333 14.6 8 17 8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
