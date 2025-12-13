import { View, Text, Image, ImageSourcePropType } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { CategoryType } from "../staking/CategoryChip";

const CATEGORY_LABELS: Record<CategoryType, string> = {
  entertainment: "Entertainment",
  "tech-gaming": "Tech & Gaming",
  music: "Music",
  "social-figure": "Social Figure",
  fashion: "Fashion",
  sports: "Sports",
  "health-fitness": "Health & Fitness",
  travel: "Travel",
  beauty: "Beauty",
  business: "Business",
};

export interface ConversionCreator {
  id: string;
  name: string;
  image: ImageSourcePropType;
  category?: CategoryType;
}

interface ReviewConversionData {
  amount: string;
  lockPeriod: number;
  conversionEstimate: string;
  creator?: ConversionCreator | null;
}

interface ReviewConversionSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: ReviewConversionData | null;
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center" style={{ gap: 5 }}>
      <Text className="text-slate-500" style={{ fontSize: 16 }}>
        {label}
      </Text>
      <Text
        className={bold ? "font-semibold text-slate-800" : "text-slate-800"}
        style={{ fontSize: 16 }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function CreatorInfo({ creator }: { creator: ConversionCreator }) {
  const categoryLabel = creator.category
    ? CATEGORY_LABELS[creator.category]
    : undefined;

  return (
    <View className="flex-row items-center" style={{ gap: 10 }}>
      <Image
        source={creator.image}
        style={{ width: 64, height: 64, borderRadius: 8 }}
      />
      <View className="flex-1" style={{ gap: 5 }}>
        <Text
          className="font-medium text-slate-800"
          style={{ fontSize: 16, lineHeight: 22 }}
          numberOfLines={1}
        >
          {creator.name}
        </Text>
        {categoryLabel && (
          <View
            className="self-start rounded-lg px-[6px] py-[5px]"
            style={{ backgroundColor: "rgba(221, 214, 254, 0.5)" }}
          >
            <Text
              className="font-medium text-primary-500 uppercase"
              style={{ fontSize: 11 }}
            >
              {categoryLabel}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function ReviewConversionSheet({
  visible,
  onClose,
  onConfirm,
  data,
}: ReviewConversionSheetProps) {
  if (!data) return null;

  const hasCreator = data.creator && data.creator.id !== "none";
  const boostingValue = hasCreator && data.creator ? data.creator.name : "No boost";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[hasCreator ? 0.58 : 0.48]}
    >
      <View className="flex-1 px-4" style={{ gap: 32 }}>
        {/* Content */}
        <View style={{ gap: 20 }}>
          {/* Title */}
          <Text
            className="font-semibold text-slate-800"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            Review conversion
          </Text>

          {/* Details */}
          <View style={{ gap: 16 }}>
            {/* Creator Info - only if selected */}
            {hasCreator && data.creator && <CreatorInfo creator={data.creator} />}

            <DetailRow label="Amount:" value={`${data.amount} Points`} />
            <DetailRow label="Boosting:" value={boostingValue} />
            <DetailRow label="Lock period:" value={`${data.lockPeriod} days`} />

            {/* Divider */}
            <View className="h-px bg-slate-200" />

            <DetailRow
              label="Conversion estimation:"
              value={data.conversionEstimate}
              bold
            />
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row" style={{ gap: 8, marginTop: "auto" }}>
          <View className="flex-1">
            <Button type="outlined" onPress={onClose}>
              Cancel
            </Button>
          </View>
          <View className="flex-1">
            <Button type="primary" onPress={onConfirm}>
              Convert
            </Button>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
