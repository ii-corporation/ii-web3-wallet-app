import Svg, { Path } from "react-native-svg";

interface ArrowIconProps {
  size?: number;
  color?: string;
  direction?: "up" | "down" | "left" | "right";
}

export function ArrowIcon({
  size = 24,
  color = "#475569",
  direction = "up",
}: ArrowIconProps) {
  // Base path pointing up
  const getTransform = () => {
    switch (direction) {
      case "down":
        return "rotate(180 12 12)";
      case "left":
        return "rotate(-90 12 12)";
      case "right":
        return "rotate(90 12 12)";
      default:
        return "";
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19V5M12 5L5 12M12 5L19 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={getTransform()}
      />
    </Svg>
  );
}
