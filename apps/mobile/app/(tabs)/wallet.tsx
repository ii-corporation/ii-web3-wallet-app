import { View, Text, ScrollView, TouchableOpacity, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ArrowIcon,
  StakingIcon,
  ConvertIcon,
  SettingsIcon,
} from "../../src/components/icons";
import { Card, GradientText } from "../../src/components/ui";
import {
  NFTDetailsSheet,
  NFTDetails,
  TransactionDetailsSheet,
  TransactionDetails,
} from "../../src/components/wallet";

// Transaction type
type TransactionType = "received" | "sent" | "staked" | "converted";

// Mock data for transactions with full details
const mockTransactions: TransactionDetails[] = [
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
];

// Mock NFT data
const mockNFTs: NFTDetails[] = [
  {
    id: "1",
    name: "Hedera welcome gift",
    description: "The description for this NFT that users receive as a welcome gift when they signup on Zoop for the first time.",
    image: "https://picsum.photos/200/300",
    mintedOn: "May 14, 2025",
    serialNumber: "21,490",
    tokenId: "0.0.123456",
  },
];

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
    if (transaction.amount > 0) return `+${transaction.amount.toLocaleString()}`;
    return transaction.amount.toLocaleString();
  };

  return (
    <Pressable onPress={onPress}>
      <Card variant="subtle" className="flex-row items-center gap-4 px-4 py-3 rounded-xl mb-1">
        <TransactionIcon type={transaction.type} />
        <View className="flex-1">
          <Text className="text-sm font-medium text-slate-900" numberOfLines={1}>
            {transaction.title}
          </Text>
          <Text className="text-[13px] text-slate-500">{transaction.date}</Text>
        </View>
        <Text className="text-sm font-semibold" style={{ color: getAmountColor() }}>
          {formatAmount()}
        </Text>
      </Card>
    </Pressable>
  );
}

// NFT Card component
function NFTCard({ nft, onPress }: { nft: NFTDetails; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <Card variant="subtle" className="flex-1 p-3 rounded-xl">
        <View className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-slate-200">
          <Image
            source={{ uri: nft.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <Text className="text-sm font-medium text-slate-900" numberOfLines={1}>
          {nft.name}
        </Text>
        <View className="flex-row items-center gap-1 mt-1">
          <Text className="text-[13px] text-slate-600">ID</Text>
          <Text className="text-[13px] text-slate-900">{nft.tokenId}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

export default function WalletScreen() {
  const router = useRouter();
  const balance = 3840;
  const [selectedNFT, setSelectedNFT] = useState<NFTDetails | null>(null);
  const [showNFTDetails, setShowNFTDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  const handleNFTPress = (nft: NFTDetails) => {
    setSelectedNFT(nft);
    setShowNFTDetails(true);
  };

  const handleTransactionPress = (transaction: TransactionDetails) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Top App Bar */}
      <View
        className="flex-row items-center px-4 py-2 h-16"
        style={{
          backgroundColor: "rgba(248, 250, 252, 0.8)",
        }}
      >
        <Text className="flex-1 text-2xl font-semibold text-slate-800">
          Wallet
        </Text>
        <TouchableOpacity className="p-2" onPress={() => router.push("/wallet/settings")}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6">
        {/* Balance Card */}
        <Card variant="subtle" className="rounded-xl py-6 items-center mb-6">
          <Text className="text-[13px] text-slate-500 mb-1">
            Available token balance
          </Text>
          <GradientText className="text-[40px] font-semibold mb-6">
            {balance.toLocaleString()}
          </GradientText>

          {/* Send/Receive Buttons */}
          <View className="flex-row gap-2.5">
            <Card
              onPress={() => router.push("/send")}
              className="flex-row items-center gap-0.5 px-3 py-3 rounded-lg w-[104px] justify-center"
              variant="outlined"
            >
              <ArrowIcon direction="up" color="#334155" />
              <Text className="text-sm font-medium text-slate-700">Send</Text>
            </Card>

            <Card
              onPress={() => router.push("/receive")}
              className="flex-row items-center gap-0.5 px-3 py-3 rounded-lg"
              variant="outlined"
            >
              <ArrowIcon direction="down" color="#334155" />
              <Text className="text-sm font-medium text-slate-700">Receive</Text>
            </Card>
          </View>
        </Card>

        {/* Transactions Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-slate-800">
              Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push("/transactions")}>
              <GradientText className="text-sm font-semibold">
                View all
              </GradientText>
            </TouchableOpacity>
          </View>

          {mockTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction)}
            />
          ))}
        </View>

        {/* My NFTs Section */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-slate-800">My NFTs</Text>
          </View>

          <View className="flex-row gap-2">
            {mockNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} onPress={() => handleNFTPress(nft)} />
            ))}
            {/* Empty placeholder for second NFT slot */}
            <View className="flex-1" />
          </View>
        </View>
      </ScrollView>

      {/* NFT Details Bottom Sheet */}
      <NFTDetailsSheet
        visible={showNFTDetails}
        onClose={() => setShowNFTDetails(false)}
        nft={selectedNFT}
      />

      {/* Transaction Details Bottom Sheet */}
      <TransactionDetailsSheet
        visible={showTransactionDetails}
        onClose={() => setShowTransactionDetails(false)}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
}
