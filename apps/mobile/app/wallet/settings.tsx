import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BackIcon, ChevronRightIcon } from "../../src/components/icons";
import { Card, Button } from "../../src/components/ui";
import { useAuth } from "../../src/hooks";
import { colors } from "../../src/theme";

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function SettingsItem({
  title,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
}: SettingsItemProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        className="flex-row items-center justify-between py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border.subtle }}
      >
        <View className="flex-1">
          <Text
            className={`font-medium ${danger ? "text-red-500" : "text-slate-800"}`}
            style={{ fontSize: 16, lineHeight: 22 }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-slate-500"
              style={{ fontSize: 14, lineHeight: 20, marginTop: 2 }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {showChevron && (
          <ChevronRightIcon size={20} color={danger ? "#EF4444" : colors.icon.default} />
        )}
      </View>
    </Pressable>
  );
}

export default function WalletSettingsPage() {
  const { logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleExportWallet = () => {
    Alert.alert(
      "Export Wallet",
      "This feature will allow you to export your wallet's private key. Coming soon.",
      [{ text: "OK" }]
    );
  };

  const handleBackupRecovery = () => {
    Alert.alert(
      "Backup & Recovery",
      "This feature will allow you to backup and recover your wallet. Coming soon.",
      [{ text: "OK" }]
    );
  };

  const handleConnectedApps = () => {
    Alert.alert(
      "Connected Apps",
      "View and manage apps connected to your wallet. Coming soon.",
      [{ text: "OK" }]
    );
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      "Security Settings",
      "Manage your security preferences. Coming soon.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
      {/* Header */}
      <View
        className="flex-row items-center bg-white"
        style={{ height: 56, paddingHorizontal: 4 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          <BackIcon size={24} color={colors.icon.dark} />
        </Pressable>
        <Text
          className="text-xl font-semibold text-slate-800"
          style={{ lineHeight: 26 }}
        >
          Settings
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-4" style={{ paddingTop: 16 }}>
        {/* Wallet Settings Section */}
        <Card variant="subtle" className="rounded-xl px-4 py-1 mb-4">
          <SettingsItem
            title="Export Wallet"
            subtitle="Export your private key"
            onPress={handleExportWallet}
          />
          <SettingsItem
            title="Backup & Recovery"
            subtitle="Secure your wallet"
            onPress={handleBackupRecovery}
          />
          <SettingsItem
            title="Connected Apps"
            subtitle="Manage connected applications"
            onPress={handleConnectedApps}
          />
          <SettingsItem
            title="Security"
            subtitle="Biometrics, PIN, and more"
            onPress={handleSecuritySettings}
            showChevron
          />
        </Card>

        {/* Account Section */}
        <Card variant="subtle" className="rounded-xl px-4 py-1 mb-4">
          <SettingsItem
            title="Sign Out"
            onPress={handleSignOut}
            showChevron={false}
            danger
          />
        </Card>

        {/* App Info */}
        <View className="items-center" style={{ marginTop: "auto", paddingBottom: 24 }}>
          <Text className="text-slate-400" style={{ fontSize: 12 }}>
            Zoop Mobile App v1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
