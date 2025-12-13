import { View, Pressable, PressableProps, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { cn } from "../../lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated" | "outlined" | "subtle";
  onPress?: PressableProps["onPress"];
}

// Shared shadow style for subtle variant (can't be expressed in NativeWind)
const subtleStyle = StyleSheet.create({
  shadow: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 1,
  },
});

export function Card({
  children,
  className,
  style,
  variant = "default",
  onPress,
}: CardProps) {
  const variantStyles = {
    default: "bg-white",
    elevated: "bg-white shadow-lg shadow-black/10",
    outlined: "bg-white border border-slate-200",
    subtle: "", // Handled via StyleSheet
  };

  const baseClassName = cn(
    "rounded-2xl p-4",
    variantStyles[variant],
    className
  );

  // Combine variant shadow with custom style
  const combinedStyle = variant === "subtle"
    ? [subtleStyle.shadow, style]
    : style;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={baseClassName} style={combinedStyle}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={baseClassName} style={combinedStyle}>
      {children}
    </View>
  );
}
