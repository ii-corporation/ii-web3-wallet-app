import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../../lib/cn";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "gradient" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  className,
  textClassName,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: "px-4 py-2",
    md: "px-5 py-3",
    lg: "px-6 py-4",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const baseStyles = cn(
    "rounded-xl flex-row items-center justify-center",
    sizeStyles[size],
    isDisabled && "opacity-50"
  );

  const variantStyles = {
    primary: "bg-primary-600 active:bg-primary-700",
    secondary: "bg-primary-100 active:bg-primary-200",
    outline: "border border-primary-600 bg-transparent active:bg-primary-50",
    ghost: "bg-transparent active:bg-slate-100",
    gradient: "", // Handled separately with LinearGradient
  };

  const textVariantStyles = {
    primary: "text-white",
    secondary: "text-primary-600",
    outline: "text-primary-600",
    ghost: "text-slate-700",
    gradient: "text-white",
  };

  const content = (
    <View className="flex-row items-center justify-center gap-2">
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "gradient" ? "#fff" : "#7c3aed"}
        />
      ) : (
        <>
          {icon}
          <Text
            className={cn(
              "font-semibold text-center",
              textSizeStyles[size],
              textVariantStyles[variant],
              textClassName
            )}
          >
            {children}
          </Text>
        </>
      )}
    </View>
  );

  if (variant === "gradient") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        className={className}
      >
        <LinearGradient
          colors={["#9c2cf3", "#3a6ff9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={cn(baseStyles)}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {content}
    </TouchableOpacity>
  );
}
