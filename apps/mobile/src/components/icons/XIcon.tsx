import Svg, { Path } from "react-native-svg";

interface XIconProps {
  size?: number;
  color?: string;
}

export function XIcon({ size = 24, color = "#1E293B" }: XIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4L10.5 12.5M20 20L13.5 11.5M10.5 12.5L4 20M10.5 12.5L13.5 11.5M13.5 11.5L20 4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
