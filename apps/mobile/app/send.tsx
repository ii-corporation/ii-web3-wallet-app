import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { Button, TokenAmountInput } from "../src/components/ui";
import {
  BackIcon,
  HelpIcon,
  QRCodeIcon,
  ChevronDownIcon,
} from "../src/components/icons";
import {
  SelectNetworkSheet,
  ReviewTransactionSheet,
  NETWORKS,
  Network,
} from "../src/components/wallet";

export default function SendScreen() {
  const [network, setNetwork] = useState<Network | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showNetworkSheet, setShowNetworkSheet] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);

  const balance = "2,358";
  const balanceNumber = parseFloat(balance.replace(",", ""));
  const amountNumber = parseFloat(amount) || 0;
  const isOverBalance = amountNumber > balanceNumber;
  const feePercentage = 0.006;
  const feeAmount = amountNumber * feePercentage;
  const youReceive = amountNumber - feeAmount;

  const isValid =
    network !== null &&
    recipientAddress.length > 0 &&
    amount &&
    amountNumber > 0 &&
    !isOverBalance;

  const balanceError = isOverBalance ? "Insufficient balance" : undefined;

  const handleMaxPress = () => {
    setAmount(balanceNumber.toString());
  };

  const handleConfirm = () => {
    if (isValid) {
      setShowReviewSheet(true);
    }
  };

  const handleSend = () => {
    // TODO: Execute send transaction
    console.log("Sending:", {
      network: network?.name,
      to: recipientAddress,
      amount: amountNumber,
    });
    setShowReviewSheet(false);
    // Navigate to success or back
    router.back();
  };

  const getReviewData = useCallback(() => {
    if (!network) return null;
    return {
      amount: amountNumber.toFixed(2),
      network,
      toAddress: recipientAddress.length > 30
        ? `${recipientAddress.slice(0, 20)}.....${recipientAddress.slice(-7)}`
        : recipientAddress,
      fee: `${(feePercentage * 100).toFixed(1)}%`,
      feeAmount: feeAmount.toFixed(2),
      youReceive: youReceive.toFixed(2),
    };
  }, [network, recipientAddress, amountNumber, feeAmount, youReceive]);

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Top App Bar */}
      <BlurView
        intensity={80}
        tint="light"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: "rgba(248, 250, 252, 0.8)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 80,
          elevation: 4,
        }}
      >
        <SafeAreaView edges={["top"]}>
          <View
            className="flex-row items-center"
            style={{ height: 64, paddingHorizontal: 4 }}
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
              Send
            </Text>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 88, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 12 }}>
          {/* Network Selector */}
          <Pressable onPress={() => setShowNetworkSheet(true)}>
            <View
              className="bg-slate-50 rounded-2xl p-4"
              style={{
                borderWidth: 1,
                borderColor: "rgba(226, 232, 240, 0.5)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 20,
                elevation: 2,
                gap: 12,
              }}
            >
              <View className="flex-row items-center" style={{ gap: 2 }}>
                <Text
                  className="text-slate-500"
                  style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
                >
                  Network
                </Text>
                <HelpIcon size={16} color="#64748B" />
              </View>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                {network ? (
                  <>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: network.color,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>
                        {network.initial}
                      </Text>
                    </View>
                    <Text
                      className="flex-1 text-slate-800"
                      style={{ fontSize: 15, lineHeight: 20 }}
                    >
                      {network.name}
                    </Text>
                  </>
                ) : (
                  <Text
                    className="flex-1 text-slate-400"
                    style={{ fontSize: 15, lineHeight: 20 }}
                  >
                    Select the network
                  </Text>
                )}
                <ChevronDownIcon size={24} color="#64748B" />
              </View>
            </View>
          </Pressable>

          {/* Recipient Address */}
          <View
            className="bg-slate-50 rounded-2xl p-4"
            style={{
              borderWidth: 1,
              borderColor: "rgba(226, 232, 240, 0.5)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.03,
              shadowRadius: 20,
              elevation: 2,
              gap: 12,
            }}
          >
            <Text
              className="text-slate-500"
              style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
            >
              Recipient Address
            </Text>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <TextInput
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                placeholder="0x12a3b4..."
                placeholderTextColor="#94A3B8"
                className="flex-1"
                style={{ fontSize: 15, lineHeight: 20, color: "#1E293B" }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable hitSlop={8}>
                <QRCodeIcon size={24} color="#64748B" />
              </Pressable>
            </View>
          </View>

          {/* Amount Input */}
          <TokenAmountInput
            value={amount}
            onChangeValue={setAmount}
            balance={balance}
            showMaxButton={true}
            onMaxPress={handleMaxPress}
            error={balanceError}
          />

          {/* Fee Info */}
          <View className="flex-row items-center" style={{ gap: 4, height: 16 }}>
            <Text
              className="text-slate-500"
              style={{ fontSize: 11, lineHeight: 14, letterSpacing: 0.22 }}
            >
              Fee:
            </Text>
            <Text
              className="font-medium text-slate-800"
              style={{ fontSize: 11, lineHeight: 14 }}
            >
              0.6%
            </Text>
            <HelpIcon size={16} color="#64748B" />
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
              You must select the same network you will be using to deposit your
              ZOOP Tokens. Using the wrong network will result in a loss of funds.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Send Button - Fixed at bottom */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ backgroundColor: "rgba(241, 245, 249, 0.95)" }}
      >
        <Button type="primary" disabled={!isValid} onPress={handleConfirm}>
          Send
        </Button>
      </View>

      {/* Network Selection Sheet */}
      <SelectNetworkSheet
        visible={showNetworkSheet}
        onClose={() => setShowNetworkSheet(false)}
        selectedNetwork={network}
        onSelectNetwork={setNetwork}
      />

      {/* Review Transaction Sheet */}
      <ReviewTransactionSheet
        visible={showReviewSheet}
        onClose={() => setShowReviewSheet(false)}
        onConfirm={handleSend}
        data={getReviewData()}
      />
    </SafeAreaView>
  );
}
