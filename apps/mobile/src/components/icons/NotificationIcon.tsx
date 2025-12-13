import Svg, { Path } from "react-native-svg";

interface NotificationIconProps {
  size?: number;
  color?: string;
}

const NOTIFICATION_PATH =
  "M15.634 18.7692V19.6154C15.634 20.513 15.2512 21.3739 14.5698 22.0087C13.8884 22.6434 12.9643 23 12.0007 23C11.0371 23 10.1129 22.6434 9.43156 22.0087C8.75019 21.3739 8.3674 20.513 8.3674 19.6154V18.7692M21.747 17.0468C20.2891 15.3846 19.2599 14.5385 19.2599 9.95601C19.2599 5.75962 16.9595 4.26457 15.0663 3.53846C14.8148 3.44221 14.578 3.22115 14.5014 2.98053C14.1693 1.9276 13.2383 1 12.0007 1C10.7631 1 9.8315 1.92813 9.5028 2.98159C9.42616 3.22486 9.18943 3.44221 8.93793 3.53846C7.04238 4.26563 4.74433 5.75538 4.74433 9.95601C4.74149 14.5385 3.71225 15.3846 2.2544 17.0468C1.65036 17.7353 2.17946 18.7692 3.23595 18.7692H20.7711C21.8219 18.7692 22.3476 17.7322 21.747 17.0468Z";

export function NotificationIcon({
  size = 24,
  color = "#475569",
}: NotificationIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={NOTIFICATION_PATH}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
