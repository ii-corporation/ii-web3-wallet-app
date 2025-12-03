import { View } from "react-native";
import { cn } from "../../lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({
  children,
  className,
  variant = "default",
}: CardProps) {
  const variantStyles = {
    default: "bg-white",
    elevated: "bg-white shadow-lg shadow-black/10",
    outlined: "bg-white border border-slate-200",
  };

  return (
    <View
      className={cn(
        "rounded-2xl p-4",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </View>
  );
}
