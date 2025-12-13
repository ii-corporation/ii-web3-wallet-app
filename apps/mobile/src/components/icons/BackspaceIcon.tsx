import Svg, { Path } from "react-native-svg";

interface BackspaceIconProps {
  size?: number;
  color?: string;
}

export function BackspaceIcon({ size = 24, color = "#1E293B" }: BackspaceIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L3 12L9 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 6H9L3 12L9 18H21C21.5523 18 22 17.5523 22 17V7C22 6.44772 21.5523 6 21 6Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 9L12 15M12 9L18 15"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
