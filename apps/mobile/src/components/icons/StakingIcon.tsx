import Svg, { Path } from "react-native-svg";

interface StakingIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

// Outline path (stroke only) - all 3 layers as stroke
const STAKING_OUTLINE_PATH =
  "M1 11L11 16L21 11M1 16L11 21L21 16M11 1L1 6L11 11L21 6L11 1Z";

// Filled version paths:
// Top layer is filled diamond
const STAKING_TOP_DIAMOND = "M11 1L1 6L11 11L21 6L11 1Z";
// Bottom two V shapes are stroke only
const STAKING_BOTTOM_V_SHAPES = "M1 11L11 16L21 11M1 16L11 21L21 16";

export function StakingIcon({
  size = 20,
  color = "#475569",
  filled = false,
}: StakingIconProps) {
  if (filled) {
    // Filled: top diamond filled, bottom V shapes stroked
    return (
      <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        {/* Top diamond - filled */}
        <Path
          d={STAKING_TOP_DIAMOND}
          fill={color}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom V shapes - stroke only */}
        <Path
          d={STAKING_BOTTOM_V_SHAPES}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d={STAKING_OUTLINE_PATH}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
