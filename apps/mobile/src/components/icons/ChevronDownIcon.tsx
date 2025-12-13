import Svg, { Path } from "react-native-svg";

interface ChevronDownIconProps {
  size?: number;
  color?: string;
}

export function ChevronDownIcon({ size = 24, color = "#64748B" }: ChevronDownIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
