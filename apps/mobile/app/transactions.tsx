import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  BackIcon,
  ArrowIcon,
  StakingIcon,
  ConvertIcon,
} from "../src/components/icons";
import { Card, GradientText } from "../src/components/ui";
import {
  TransactionDetailsSheet,
  TransactionDetails,
  TransactionType,
} from "../src/components/wallet";
import { PRIMARY_GRADIENT } from "../src/theme";

// Extended transaction data for full list
const allTransactions: TransactionDetails[] = [
  {
    id: "1",
    type: "received",
    title: "Received from 0xAc...aeC1d",
    date: "23/12/2024 · 11:44 AM",
    amount: 1250,
    status: "Success",
    from: "0xa3f5c2d4e8f9a0b1c2.....4f5g6h7",
    to: "0x8740b34fb6f09cec.....a6a5e8d",
    fee: "0.6% = 7.50 Tokens",
    hash: "0x9f88460b1734d39d20a.....ef592",
  },
  {
    id: "2",
    type: "staked",
    title: "Staked to Carmelita Rose",
    date: "23/12/2024 · 11:44 AM",
    amount: 500,
    status: "Success",
    hash: "0x8f77350a0623c28c19b.....df481",
  },
  {
    id: "3",
    type: "sent",
    title: "Sent to 0xAc...aeC1d",
    date: "23/12/2024 · 11:44 AM",
    amount: -2500,
    status: "Success",
    from: "0x8740b34fb6f09cec.....a6a5e8d",
    to: "0xa3f5c2d4e8f9a0b1c2.....4f5g6h7",
    fee: "0.6% = 15.00 Tokens",
    hash: "0x7e66240b0512b17b08a.....ce370",
  },
  {
    id: "4",
    type: "converted",
    title: "Converted to Tokens",
    date: "23/12/2024 · 11:44 AM",
    amount: 750,
    status: "Success",
    hash: "0x6d55130a0401a06a07b.....bd259",
  },
  {
    id: "5",
    type: "received",
    title: "Received from 0xBe...cD4f3",
    date: "24/12/2024 · 09:15 AM",
    amount: 3000,
    status: "Success",
    from: "0xb4e6d3f5g7h8i9j0.....5e6f7g8",
    to: "0x8740b34fb6f09cec.....a6a5e8d",
    fee: "0.6% = 18.00 Tokens",
    hash: "0x5c44020b0300a05a06a.....ac148",
  },
  {
    id: "6",
    type: "staked",
    title: "Staked to Benjamin Walsh",
    date: "24/12/2024 · 09:15 AM",
    amount: 1000,
    status: "Success",
    hash: "0x4b33910a0200a04a05a.....9b037",
  },
  {
    id: "7",
    type: "sent",
    title: "Sent to 0xAc...aeC1d",
    date: "23/12/2024 · 11:44 AM",
    amount: -2500,
    status: "Success",
    from: "0x8740b34fb6f09cec.....a6a5e8d",
    to: "0xa3f5c2d4e8f9a0b1c2.....4f5g6h7",
    fee: "0.6% = 15.00 Tokens",
    hash: "0x3a22800b0100a03a04a.....8a926",
  },
  {
    id: "8",
    type: "staked",
    title: "Staked to Benjamin Walsh",
    date: "24/12/2024 · 09:15 AM",
    amount: 1000,
    status: "Success",
    hash: "0x2911700a0000a02a03a.....79815",
  },
  {
    id: "9",
    type: "converted",
    title: "Converted to Tokens",
    date: "23/12/2024 · 11:44 AM",
    amount: 750,
    status: "Success",
    hash: "0x1800600b0f00a01a02a.....68704",
  },
  {
    id: "10",
    type: "received",
    title: "Received from 0xD7...fQ2h9",
    date: "26/12/2024 · 12:00 PM",
    amount: 1800,
    status: "Success",
    from: "0xd7f8g9h0i1j2k3l4.....7f8g9h0",
    to: "0x8740b34fb6f09cec.....a6a5e8d",
    fee: "0.6% = 10.80 Tokens",
    hash: "0x0f00500b0e00a00a01a.....57593",
  },
];

const TABS = ["All", "Staked", "Received", "Sent"] as const;
type TabType = (typeof TABS)[number];

// Transaction Icon based on type
function TransactionIcon({ type }: { type: TransactionType }) {
  const bgColor = "rgba(226, 232, 240, 0.5)";

  if (type === "received") {
    return (
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <ArrowIcon direction="down" color="#009D69" />
      </View>
    );
  }

  if (type === "sent") {
    return (
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <ArrowIcon direction="up" color="#EE5261" />
      </View>
    );
  }

  if (type === "staked") {
    return (
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <StakingIcon size={24} />
      </View>
    );
  }

  if (type === "converted") {
    return (
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <ConvertIcon size={24} />
      </View>
    );
  }

  return null;
}

// Transaction Item component
function TransactionItem({
  transaction,
  onPress,
}: {
  transaction: TransactionDetails;
  onPress: () => void;
}) {
  const getAmountColor = () => {
    if (transaction.amount > 0) return "#009D69";
    if (transaction.amount < 0) return "#EE5261";
    return "#1E293B";
  };

  const formatAmount = () => {
    if (transaction.amount > 0)
      return `+${transaction.amount.toLocaleString()}`;
    return transaction.amount.toLocaleString();
  };

  return (
    <Pressable onPress={onPress}>
      <Card
        variant="subtle"
        className="flex-row items-center gap-4 px-4 py-3 rounded-xl mb-1"
      >
        <TransactionIcon type={transaction.type} />
        <View className="flex-1">
          <Text
            className="text-sm font-medium text-slate-900"
            numberOfLines={1}
          >
            {transaction.title}
          </Text>
          <Text className="text-[13px] text-slate-500">{transaction.date}</Text>
        </View>
        <Text
          className="text-sm font-semibold"
          style={{ color: getAmountColor() }}
        >
          {formatAmount()}
        </Text>
      </Card>
    </Pressable>
  );
}

// Tab component
function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center px-2"
      style={{ height: 28 }}
    >
      <View className="items-center w-full" style={{ gap: 6 }}>
        {active ? (
          <GradientText className="text-[13px] font-semibold">{label}</GradientText>
        ) : (
          <Text className="text-[13px] text-slate-600">{label}</Text>
        )}
        <View className="w-full px-2">
          <LinearGradient
            colors={active ? PRIMARY_GRADIENT : ["transparent", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3, borderRadius: 2 }}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function TransactionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredTransactions = allTransactions.filter((tx) => {
    if (activeTab === "All") return true;
    if (activeTab === "Staked") return tx.type === "staked";
    if (activeTab === "Received") return tx.type === "received";
    if (activeTab === "Sent") return tx.type === "sent";
    return true;
  });

  const handleTransactionPress = (transaction: TransactionDetails) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Top App Bar with Tabs */}
      <BlurView
        intensity={80}
        tint="light"
        style={{
          backgroundColor: "rgba(248, 250, 252, 0.8)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 80,
          elevation: 4,
        }}
      >
        {/* Header Row */}
        <View
          className="flex-row items-center"
          style={{ height: 64, paddingHorizontal: 4, paddingVertical: 8 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="items-center justify-center"
            style={{ width: 48, height: 48 }}
          >
            <BackIcon size={24} color="#475569" />
          </Pressable>
          <Text
            className="flex-1 font-semibold text-slate-800"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            Transactions
          </Text>
        </View>

        {/* Tabs Row */}
        <View
          className="flex-row items-end px-1 pb-4"
          style={{ height: 48 }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab}
              label={tab}
              active={activeTab === tab}
              onPress={() => setActiveTab(tab)}
            />
          ))}
        </View>
      </BlurView>

      {/* Transaction List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 4 }}>
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction)}
            />
          ))}
        </View>

        {filteredTransactions.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text className="text-slate-500 text-base">
              No transactions found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Transaction Details Bottom Sheet */}
      <TransactionDetailsSheet
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
}
