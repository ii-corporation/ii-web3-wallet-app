import { Pressable, Text } from "react-native";
import { cn } from "../../lib/cn";
import {
  EntertainmentIcon,
  TechGamingIcon,
  MusicIcon,
  SocialFigureIcon,
  FashionIcon,
  SportsIcon,
  HealthFitnessIcon,
  TravelIcon,
  BeautyIcon,
  BusinessIcon,
} from "../icons";

export type CategoryType =
  | "entertainment"
  | "tech-gaming"
  | "music"
  | "social-figure"
  | "fashion"
  | "sports"
  | "health-fitness"
  | "travel"
  | "beauty"
  | "business";

interface CategoryChipProps {
  category: CategoryType;
  label: string;
  selected?: boolean;
  showIcon?: boolean;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<CategoryType, React.FC<{ size?: number; color?: string }>> = {
  entertainment: EntertainmentIcon,
  "tech-gaming": TechGamingIcon,
  music: MusicIcon,
  "social-figure": SocialFigureIcon,
  fashion: FashionIcon,
  sports: SportsIcon,
  "health-fitness": HealthFitnessIcon,
  travel: TravelIcon,
  beauty: BeautyIcon,
  business: BusinessIcon,
};

export function CategoryChip({
  category,
  label,
  selected = false,
  showIcon = true,
  onPress,
}: CategoryChipProps) {
  const IconComponent = CATEGORY_ICONS[category];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-center rounded-lg border",
        selected
          ? "bg-primary-100 border-primary-300"
          : "bg-slate-50 border-slate-200"
      )}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 6,
      }}
    >
      {showIcon && IconComponent && (
        <IconComponent
          size={20}
          color={selected ? "#8B5CF6" : "#475569"}
        />
      )}
      <Text
        className={cn(
          "text-[13px]",
          selected ? "font-medium text-primary-600" : "font-normal text-slate-800"
        )}
        style={{ lineHeight: 18 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// All available categories with their labels
export const CATEGORIES: { id: CategoryType; label: string }[] = [
  { id: "entertainment", label: "Entertainment" },
  { id: "tech-gaming", label: "Tech & Gaming" },
  { id: "music", label: "Music" },
  { id: "social-figure", label: "Social figure" },
  { id: "fashion", label: "Fashion" },
  { id: "sports", label: "Sport" },
  { id: "health-fitness", label: "Health & Fitness" },
  { id: "travel", label: "Travel" },
  { id: "beauty", label: "Beauty" },
  { id: "business", label: "Business" },
];
