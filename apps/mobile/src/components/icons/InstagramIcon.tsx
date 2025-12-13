import Svg, { Path, Rect } from "react-native-svg";

interface InstagramIconProps {
  size?: number;
  color?: string;
}

export function InstagramIcon({ size = 24, color = "#1E293B" }: InstagramIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={5}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M17.5 6.5L17.51 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
