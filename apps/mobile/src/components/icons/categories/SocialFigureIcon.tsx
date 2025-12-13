import Svg, { Path } from "react-native-svg";

interface SocialFigureIconProps {
  size?: number;
  color?: string;
}

export function SocialFigureIcon({ size = 20, color = "#1E293B" }: SocialFigureIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4 17.5V15.8333C4 14.9493 4.35119 14.1014 4.97631 13.4763C5.60143 12.8512 6.44928 12.5 7.33333 12.5H12.6667C13.5507 12.5 14.3986 12.8512 15.0237 13.4763C15.6488 14.1014 16 14.9493 16 15.8333V17.5M6.66667 5.83333C6.66667 6.71739 7.01786 7.56523 7.64298 8.19036C8.2681 8.81548 9.11595 9.16667 10 9.16667C10.8841 9.16667 11.7319 8.81548 12.357 8.19036C12.9821 7.56523 13.3333 6.71739 13.3333 5.83333C13.3333 4.94928 12.9821 4.10143 12.357 3.47631C11.7319 2.85119 10.8841 2.5 10 2.5C9.11595 2.5 8.2681 2.85119 7.64298 3.47631C7.01786 4.10143 6.66667 4.94928 6.66667 5.83333Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
