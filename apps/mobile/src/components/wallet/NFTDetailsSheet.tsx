import { View, Text, Pressable, Image, Linking, ScrollView } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { ExternalLinkIcon } from "../icons";

export interface NFTDetails {
  id: string;
  name: string;
  description?: string;
  image: string;
  mintedOn?: string;
  serialNumber?: string;
  tokenId?: string;
}

interface NFTDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  nft: NFTDetails | null;
}

function DetailRow({
  label,
  value,
  hasLink,
  onLinkPress,
  multiline,
}: {
  label: string;
  value: string;
  hasLink?: boolean;
  onLinkPress?: () => void;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <View style={{ gap: 0 }}>
        <View className="flex-row items-start" style={{ gap: 5 }}>
          <Text className="text-slate-500" style={{ fontSize: 16 }}>
            {label}:
          </Text>
          <Text
            className="flex-1 text-slate-800"
            style={{ fontSize: 16, lineHeight: 22 }}
          >
            {value}
          </Text>
        </View>
      </View>
    );
  }

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

export function NFTDetailsSheet({
  visible,
  onClose,
  nft,
}: NFTDetailsSheetProps) {
  if (!nft) return null;

  const openExplorer = (tokenId: string) => {
    Linking.openURL(`https://hashscan.io/mainnet/token/${tokenId}`);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.85]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <View style={{ gap: 20 }}>
          {/* Title */}
          <Text
            className="font-semibold text-slate-800"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            NFT details
          </Text>

          {/* NFT Image */}
          <View
            className="rounded-xl overflow-hidden bg-slate-200"
            style={{ aspectRatio: 190.5 / 270 }}
          >
            <Image
              source={{ uri: nft.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Details */}
          <View style={{ gap: 16 }}>
            <DetailRow label="Name" value={nft.name} />

            {nft.description && (
              <DetailRow
                label="Description"
                value={nft.description}
                multiline
              />
            )}

            {nft.mintedOn && (
              <DetailRow label="Minted on" value={nft.mintedOn} />
            )}

            {nft.serialNumber && (
              <DetailRow label="Serial Number" value={nft.serialNumber} />
            )}

            {nft.tokenId && (
              <DetailRow
                label="ID"
                value={nft.tokenId}
                hasLink
                onLinkPress={() => openExplorer(nft.tokenId!)}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
