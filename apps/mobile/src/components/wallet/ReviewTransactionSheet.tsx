import { View, Text, Pressable } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { ExternalLinkIcon } from "../icons";
import { Network } from "./SelectNetworkSheet";

interface ReviewTransactionData {
  amount: string;
  network: Network;
  toAddress: string;
  fee: string;
  feeAmount: string;
  youReceive: string;
}

interface ReviewTransactionSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: ReviewTransactionData | null;
}

function DetailRow({
  label,
  value,
  hasLink,
  bold,
}: {
  label: string;
  value: string;
  hasLink?: boolean;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center" style={{ gap: 5 }}>
      <Text className="text-slate-500" style={{ fontSize: 16 }}>
        {label}
      </Text>
      <View className="flex-1 flex-row items-center" style={{ gap: 2 }}>
        <Text
          className={bold ? "font-semibold text-slate-800" : "text-slate-800"}
          style={{ fontSize: 16 }}
          numberOfLines={1}
        >
          {value}
        </Text>
        {hasLink && (
          <Pressable hitSlop={8}>
            <ExternalLinkIcon size={18} color="#475569" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function ReviewTransactionSheet({
  visible,
  onClose,
  onConfirm,
  data,
}: ReviewTransactionSheetProps) {
  if (!data) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.65]}>
      <View className="flex-1 px-4" style={{ gap: 32 }}>
        {/* Content */}
        <View style={{ gap: 20 }}>
          {/* Title */}
          <Text
            className="font-semibold text-slate-800"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            Review transaction
          </Text>

          {/* Details */}
          <View style={{ gap: 16 }}>
            <DetailRow label="Amount:" value={`${data.amount} Tokens`} />
            <DetailRow label="Network:" value={data.network.name} />
            <DetailRow
              label="To:"
              value={data.toAddress}
              hasLink
            />
            <DetailRow
              label="Fee:"
              value={`${data.fee} = ${data.feeAmount} Tokens`}
            />

            {/* Divider */}
            <View className="h-px bg-slate-200" />

            <DetailRow
              label="You receive:"
              value={`${data.youReceive} Tokens`}
              bold
            />
          </View>

          {/* Warning Banner */}
          <View
            style={{
              backgroundColor: "rgba(238, 82, 97, 0.1)",
              borderWidth: 1,
              borderColor: "#EE5261",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text
              className="text-[#EE5261]"
              style={{ fontSize: 13, lineHeight: 18 }}
            >
              Token transfers are permanent and cannot be undone once submitted.
              Review all details carefully.
            </Text>
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
              Send
            </Button>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
