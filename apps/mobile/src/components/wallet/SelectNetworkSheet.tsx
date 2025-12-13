import { View, Text, Pressable } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { LinearGradient } from "expo-linear-gradient";
import { PRIMARY_GRADIENT } from "../../theme";

export interface Network {
  id: string;
  name: string;
  color: string;
  initial: string;
}

export const NETWORKS: Network[] = [
  {
    id: "hedera",
    name: "Hedera",
    color: "#000000",
    initial: "H",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    color: "#627EEA",
    initial: "E",
  },
  {
    id: "bnb",
    name: "BNB",
    color: "#F3BA2F",
    initial: "B",
  },
];

function NetworkIcon({ network }: { network: Network }) {
  return (
    <View
      style={{
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: network.color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "600" }}>
        {network.initial}
      </Text>
    </View>
  );
}

interface SelectNetworkSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedNetwork: Network | null;
  onSelectNetwork: (network: Network) => void;
}

function RadioButton({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <LinearGradient
        colors={PRIMARY_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#F5FAFF",
          }}
        />
      </LinearGradient>
    );
  }

  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#7681A3",
      }}
    />
  );
}

export function SelectNetworkSheet({
  visible,
  onClose,
  selectedNetwork,
  onSelectNetwork,
}: SelectNetworkSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.45]}>
      <View className="px-4 pb-6" style={{ gap: 20 }}>
        {/* Title */}
        <Text
          className="font-semibold text-slate-800"
          style={{ fontSize: 24, lineHeight: 30 }}
        >
          Select network
        </Text>

        {/* Network List */}
        <View style={{ gap: 8 }}>
          {NETWORKS.map((network) => (
            <Pressable
              key={network.id}
              onPress={() => {
                onSelectNetwork(network);
                onClose();
              }}
              className="flex-row items-center py-2"
              style={{ gap: 10 }}
            >
              <NetworkIcon network={network} />
              <Text
                className="flex-1 text-slate-800"
                style={{ fontSize: 17, lineHeight: 22 }}
              >
                {network.name}
              </Text>
              <RadioButton selected={selectedNetwork?.id === network.id} />
            </Pressable>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
}
