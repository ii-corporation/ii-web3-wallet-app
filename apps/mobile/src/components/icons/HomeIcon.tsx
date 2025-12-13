import Svg, { Path } from "react-native-svg";

interface HomeIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

const HOME_PATH =
  "M7.66932 15.8584L7.6672 19.9724C7.6669 20.54 7.16953 21 6.55609 21H3.22222C1.99492 21 1 20.0794 1 18.9438V8.72957C1 8.09977 1.31193 7.50471 1.84647 7.1148L9.62422 1.44143C10.4311 0.852858 11.5689 0.852858 12.3758 1.44143L20.1536 7.1148C20.6881 7.50471 21 8.09978 21 8.72957V18.9438C21 20.0794 20.0051 21 18.7778 21H15.4444C14.8308 21 14.3333 20.5397 14.3333 19.9719V15.8595C14.3333 14.7238 13.3384 13.8033 12.1111 13.8033H9.89156C8.66467 13.8033 7.66991 14.7232 7.66932 15.8584Z";

export function HomeIcon({
  size = 20,
  color = "#475569",
  filled = false,
}: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d={HOME_PATH}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </Svg>
  );
}
