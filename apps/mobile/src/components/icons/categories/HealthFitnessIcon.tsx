import Svg, { Path } from "react-native-svg";

interface HealthFitnessIconProps {
  size?: number;
  color?: string;
}

export function HealthFitnessIcon({ size = 20, color = "#1E293B" }: HealthFitnessIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3.33319 14.1667L7.49986 15L8.12486 13.75M12.4999 17.5V14.1667L9.16652 11.6667L9.99986 6.66667M9.99986 6.66667L5.83319 7.5V10M9.99986 6.66667L12.4999 9.16667L14.9999 10M9.99986 3.33333C9.99986 3.55435 10.0877 3.76631 10.2439 3.92259C10.4002 4.07887 10.6122 4.16667 10.8332 4.16667C11.0542 4.16667 11.2662 4.07887 11.4224 3.92259C11.5787 3.76631 11.6665 3.55435 11.6665 3.33333C11.6665 3.11232 11.5787 2.90036 11.4224 2.74408C11.2662 2.5878 11.0542 2.5 10.8332 2.5C10.6122 2.5 10.4002 2.5878 10.2439 2.74408C10.0877 2.90036 9.99986 3.11232 9.99986 3.33333Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
