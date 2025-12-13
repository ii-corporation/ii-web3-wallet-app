import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import {
  BackIcon,
  HelpIcon,
  CopyIcon,
  ChevronDownIcon,
} from "../src/components/icons";
import {
  SelectNetworkSheet,
  NETWORKS,
  Network,
} from "../src/components/wallet";

export default function ReceiveScreen() {
  const [network, setNetwork] = useState<Network>(NETWORKS[0]); // Default to Hedera
  const [showNetworkSheet, setShowNetworkSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock wallet address - would come from actual wallet
  const walletAddress = "0x1234a1fdc2f345a6b1f2rae1ee12f345adbf0000";

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              Receive
            </Text>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Content */}
      <View
        className="flex-1 items-center"
        style={{ paddingTop: 88, paddingHorizontal: 16, gap: 24 }}
      >
        {/* Cards Container */}
        <View style={{ gap: 8, width: "100%" }}>
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
                <ChevronDownIcon size={24} color="#64748B" />
              </View>
            </View>
          </Pressable>

          {/* Wallet Address */}
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
              Wallet address
            </Text>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <Text
                className="flex-1 text-slate-800"
                style={{ fontSize: 15, lineHeight: 20 }}
                numberOfLines={1}
              >
                {walletAddress}
              </Text>
              <Pressable onPress={handleCopyAddress} hitSlop={8}>
                <CopyIcon size={24} color={copied ? "#7C3AED" : "#64748B"} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* QR Code Placeholder */}
        <View
          style={{
            width: 250,
            height: 250,
            backgroundColor: "#F8FAFC",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(226, 232, 240, 0.5)",
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: "#E2E8F0",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-slate-500" style={{ fontSize: 14 }}>
              QR Code
            </Text>
            <Text className="text-slate-400" style={{ fontSize: 12, marginTop: 4 }}>
              (Placeholder)
            </Text>
          </View>
        </View>

        {/* Warning Banner */}
        <View
          style={{
            backgroundColor: "rgba(238, 82, 97, 0.1)",
            borderWidth: 1,
            borderColor: "#EE5261",
            borderRadius: 10,
            padding: 12,
            width: "100%",
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

      {/* Network Selection Sheet */}
      <SelectNetworkSheet
        visible={showNetworkSheet}
        onClose={() => setShowNetworkSheet(false)}
        selectedNetwork={network}
        onSelectNetwork={setNetwork}
      />
    </SafeAreaView>
  );
}
