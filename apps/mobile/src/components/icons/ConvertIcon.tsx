import Svg, { Path } from "react-native-svg";

interface ConvertIconProps {
  size?: number;
  color?: string;
}

export function ConvertIcon({
  size = 20,
  color = "#475569",
}: ConvertIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Up arrow on left side */}
      <Path
        d="M1.5 7L6.5 2L11.5 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vertical line from up arrow */}
      <Path
        d="M6.5 2V15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Down arrow on right side */}
      <Path
        d="M12.5 17L17.5 22L22.5 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vertical line from down arrow */}
      <Path
        d="M17.5 8V22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
