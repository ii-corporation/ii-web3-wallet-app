import Svg, { Circle, Path } from "react-native-svg";

interface TokenIconProps {
  size?: number;
}

export function TokenIcon({ size = 24 }: TokenIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill="#8B5CF6" />
      <Path
        d="M12 6V18M8 10H16M8 14H16"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
