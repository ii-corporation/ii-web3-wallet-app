import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface VerifiedIconProps {
  size?: number;
}

export function VerifiedIcon({ size = 16 }: VerifiedIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Defs>
        <LinearGradient
          id="verifiedGradient"
          x1="0"
          y1="0"
          x2="16"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#AD42FF" />
          <Stop offset="1" stopColor="#5F89F7" />
        </LinearGradient>
      </Defs>
      <Circle cx="8" cy="8" r="7" fill="url(#verifiedGradient)" />
      <Path
        d="M5.5 8L7 9.5L10.5 6"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
