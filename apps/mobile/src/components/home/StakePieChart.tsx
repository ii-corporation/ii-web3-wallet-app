import { View, Text } from "react-native";
import Svg, { Path, G } from "react-native-svg";

interface StakeSegment {
  value: number;
  color: string;
}

interface StakePieChartProps {
  segments: StakeSegment[];
  totalStaked: number;
  size?: number;
}

// Pie chart colors from Figma design
export const PIE_CHART_COLORS = [
  "#7C3AED", // Primary purple
  "#F1FC70", // Lime
  "#27E7C4", // Mint/Teal
  "#F97316", // Orange
  "#EC4899", // Pink
  "#3B82F6", // Blue
  "#10B981", // Green
];

// Helper function to create an arc path
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export function StakePieChart({
  segments,
  totalStaked,
  size = 180,
}: StakePieChartProps) {
  const strokeWidth = 24;
  const borderWidth = 3; // White border around segments
  // Account for border width extending beyond the stroke
  const totalStrokeWidth = strokeWidth + borderWidth * 2;
  const radius = (size - totalStrokeWidth) / 2;
  const center = size / 2;

  // Calculate total value
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  // Gap between segments in degrees
  const gapDegrees = 1;

  // Calculate arcs for each segment
  let currentAngle = 0;
  const arcs = segments.map((segment, index) => {
    const percentage = total > 0 ? segment.value / total : 0;
    const segmentDegrees = percentage * 360;

    // Apply gap (half on each side of segment)
    const startAngle = currentAngle + gapDegrees / 2;
    const endAngle = currentAngle + segmentDegrees - gapDegrees / 2;

    currentAngle += segmentDegrees;

    // Only render if segment is big enough
    if (segmentDegrees < gapDegrees) {
      return null;
    }

    return {
      path: describeArc(center, center, radius, startAngle, endAngle),
      color: segment.color,
    };
  }).filter(Boolean);

  // Format total with commas
  const formattedTotal = totalStaked.toLocaleString();

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Path
          d={describeArc(center, center, radius, 0, 359.99)}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* White border for segments (drawn first, underneath) */}
        {arcs.map((arc, index) => (
          <Path
            key={`border-${index}`}
            d={arc!.path}
            stroke="#FFFFFF"
            strokeWidth={strokeWidth + borderWidth * 2}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {/* Colored segment arcs */}
        {arcs.map((arc, index) => (
          <Path
            key={index}
            d={arc!.path}
            stroke={arc!.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            fill="none"
          />
        ))}
      </Svg>

      {/* Center content */}
      <View
        className="absolute items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Text className="text-2xl font-bold text-slate-900">
          {formattedTotal}
        </Text>
        <Text className="text-xs text-slate-500">Total staked</Text>
      </View>
    </View>
  );
}
