import Svg, { Path } from "react-native-svg";

interface EntertainmentIconProps {
  size?: number;
  color?: string;
}

export function EntertainmentIcon({ size = 20, color = "#1E293B" }: EntertainmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5.83333 16.6667H14.1667M7.5 13.3333V16.6667M12.5 13.3333V16.6667M2.5 4.16667C2.5 3.94565 2.5878 3.73369 2.74408 3.57741C2.90036 3.42113 3.11232 3.33333 3.33333 3.33333H16.6667C16.8877 3.33333 17.0996 3.42113 17.2559 3.57741C17.4122 3.73369 17.5 3.94565 17.5 4.16667V12.5C17.5 12.721 17.4122 12.933 17.2559 13.0893C17.0996 13.2455 16.8877 13.3333 16.6667 13.3333H3.33333C3.11232 13.3333 2.90036 13.2455 2.74408 13.0893C2.5878 12.933 2.5 12.721 2.5 12.5V4.16667Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
