import Svg, { Circle, Path } from "react-native-svg";

interface HelpIconProps {
  size?: number;
  color?: string;
}

export function HelpIcon({ size = 16, color = "#64748B" }: HelpIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle
        cx="8"
        cy="8"
        r="6"
        stroke={color}
        strokeWidth={1.2}
      />
      <Path
        d="M8 11.5V11.51"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Path
        d="M8 9.5C8 8 9.5 8 9.5 6.75C9.5 5.92 8.83 5.25 8 5.25C7.17 5.25 6.5 5.92 6.5 6.75"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
