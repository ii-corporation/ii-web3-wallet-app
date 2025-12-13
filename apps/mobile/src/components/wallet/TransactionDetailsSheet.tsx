import { View, Text, Pressable, Linking } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { ExternalLinkIcon } from "../icons";

export type TransactionType = "received" | "sent" | "staked" | "converted";

export interface TransactionDetails {
  id: string;
  type: TransactionType;
  title: string;
  date: string;
  amount: number;
  status: string;
  from?: string;
  to?: string;
  fee?: string;
  hash?: string;
}

interface TransactionDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  transaction: TransactionDetails | null;
}

function DetailRow({
  label,
  value,
  hasLink,
  onLinkPress,
}: {
  label: string;
  value: string;
  hasLink?: boolean;
  onLinkPress?: () => void;
}) {
  return (
    <View className="flex-row items-center" style={{ gap: 5 }}>
      <Text className="text-slate-500" style={{ fontSize: 16 }}>
        {label}:
      </Text>
      <View className="flex-1 flex-row items-center" style={{ gap: 1 }}>
        <Text className="text-slate-800" style={{ fontSize: 16 }} numberOfLines={1}>
          {value}
        </Text>
        {hasLink && (
          <Pressable onPress={onLinkPress} hitSlop={8}>
            <ExternalLinkIcon size={18} color="#475569" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function TransactionDetailsSheet({
  visible,
  onClose,
  transaction,
}: TransactionDetailsSheetProps) {
  if (!transaction) return null;

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case "received":
        return "Received";
      case "sent":
        return "Sent";
      case "staked":
        return "Staked";
      case "converted":
        return "Converted";
      default:
        return type;
    }
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    return `${absAmount.toLocaleString()} Tokens`;
  };

  const openExplorer = (hash: string) => {
    // Placeholder for explorer link
    Linking.openURL(`https://hashscan.io/mainnet/transaction/${hash}`);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.65]}>
      <View className="px-4 pb-6" style={{ gap: 20 }}>
        {/* Title */}
        <Text
          className="font-semibold text-slate-800"
          style={{ fontSize: 24, lineHeight: 30 }}
        >
          Transaction details
        </Text>

        {/* Details */}
        <View style={{ gap: 16 }}>
          <DetailRow label="Type" value={getTypeLabel(transaction.type)} />
          <DetailRow label="Date" value={transaction.date} />
          <DetailRow label="Amount" value={formatAmount(transaction.amount)} />
          <DetailRow label="Status" value={transaction.status || "Success"} />

          {transaction.from && (
            <DetailRow
              label="From"
              value={transaction.from}
              hasLink
              onLinkPress={() => {}}
            />
          )}

          {transaction.to && (
            <DetailRow
              label="To"
              value={transaction.to}
              hasLink
              onLinkPress={() => {}}
            />
          )}

          {transaction.fee && (
            <DetailRow label="Fee" value={transaction.fee} />
          )}

          {transaction.hash && (
            <DetailRow
              label="Hash"
              value={transaction.hash}
              hasLink
              onLinkPress={() => openExplorer(transaction.hash!)}
            />
          )}
        </View>
      </View>
    </BottomSheet>
  );
}
