import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { useUserStore, selectIsAuthenticated, selectAccessToken, selectProfile } from "../../src/stores";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 border-b border-slate-100"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
        <Text className="text-lg">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-slate-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-slate-500">{subtitle}</Text>
        )}
      </View>
      {showArrow && (
        <Text className="text-slate-400 text-lg">›</Text>
      )}
    </TouchableOpacity>
  );
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ProfileScreen() {
  const { user, logout, authenticated, getAccessToken } = useAuth();
  const isWeb = Platform.OS === "web";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Get data from global user store
  const isStoreAuthenticated = useUserStore(selectIsAuthenticated);
  const storedToken = useUserStore(selectAccessToken);
  const userProfile = useUserStore(selectProfile);
  const { getDisplayName, getPrimaryEmail, getWalletAddress } = useUserStore();

  // Use combined auth state (Privy + store)
  const isConnected = authenticated || isStoreAuthenticated;

  // Get display address from store or Privy
  const walletAddress = getWalletAddress();
  const displayAddress = isWeb
    ? "0x1234...abcd"
    : walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "Not connected";

  // Get user email from store or Privy
  const userEmail = getPrimaryEmail() || user?.email?.address || user?.google?.email || null;

  const handleLogout = () => {
    // Prevent double-tap
    if (isLoggingOut) {
      console.log("[Profile] Logout already in progress");
      return;
    }

    if (isWeb) {
      // On web, just call logout - AuthGate will handle redirect
      console.log("[Profile] Web logout");
      logout?.();
      return;
    }

    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            // Double-check we're not already logging out
            if (isLoggingOut) return;

            try {
              setIsLoggingOut(true);
              console.log("[Profile] Starting logout...");

              if (logout) {
                await logout();
                console.log("[Profile] Privy logout completed");
              } else {
                console.warn("[Profile] Logout function not available");
              }
            } catch (error: any) {
              console.error("[Profile] Logout error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
              setIsLoggingOut(false);
            }
            // Don't reset isLoggingOut - component will unmount after redirect
          },
        },
      ]
    );
  };

  const handleCopyAddress = () => {
    // TODO: Implement clipboard copy
    Alert.alert("Copied", "Address copied to clipboard");
  };

  // Test API connection with JWT token
  const handleTestApi = async () => {
    try {
      setIsTestingApi(true);
      setApiStatus("Testing...");
      console.log("[Profile] Testing API connection...");

      // Try to get token from store first, then from Privy
      let token = storedToken;
      if (!token) {
        token = await getAccessToken?.();
      }

      if (!token) {
        setApiStatus("No token available");
        console.error("[Profile] No access token available");
        return;
      }

      console.log("[Profile] Got token, length:", token.length);

      // Call the API auth verify endpoint
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("[Profile] API response:", data);

      if (data.authenticated) {
        setApiStatus(`Connected! Token: ${token.length} chars`);
      } else {
        setApiStatus(`Error: ${data.message}`);
      }
    } catch (error: any) {
      console.error("[Profile] API test error:", error);
      setApiStatus(`Error: ${error.message}`);
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-6">
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-2xl font-bold text-slate-900">
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View className="px-5 mb-6">
          <Card variant="elevated" className="items-center py-6">
            <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
              <Text className="text-primary-600 text-2xl font-bold">
                {isWeb ? "ZP" : (userEmail ? userEmail.charAt(0).toUpperCase() : (walletAddress?.slice(2, 4).toUpperCase() || "?"))}
              </Text>
            </View>
            <Text className="text-lg font-semibold text-slate-900 mb-1">
              {getDisplayName()}
            </Text>
            {userEmail && (
              <Text className="text-sm text-slate-500 mb-1">
                {userEmail}
              </Text>
            )}
            <Text className="text-sm text-slate-500 mb-1">
              {displayAddress}
            </Text>
            <TouchableOpacity
              onPress={handleCopyAddress}
              className="bg-slate-100 px-3 py-1 rounded-full"
            >
              <Text className="text-sm text-slate-600">
                Tap to copy full address
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Account Status */}
        <View className="px-5 mb-6">
          <Card variant="outlined">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-slate-500">Account Status</Text>
                <Text className={`text-base font-semibold ${isConnected ? 'text-success' : 'text-error'}`}>
                  {isConnected ? (userProfile?.accountStatus === 'active' ? 'Active' : 'Pending Setup') : 'Not Connected'}
                </Text>
              </View>
              <View className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`} />
            </View>
          </Card>
        </View>

        {/* Debug / API Test */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Debug
          </Text>
          <Card variant="outlined">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-sm text-slate-500">API Connection</Text>
                <Text className="text-base font-medium text-slate-900">
                  {apiStatus || "Not tested"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleTestApi}
                disabled={isTestingApi}
                className="bg-primary-600 px-3 py-2 rounded-lg"
              >
                {isTestingApi ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-sm font-medium">Test API</Text>
                )}
              </TouchableOpacity>
            </View>
            <View className="mt-2 pt-2 border-t border-slate-100">
              <Text className="text-xs text-slate-400">
                Endpoint: {API_URL}/auth/verify
              </Text>
              <Text className="text-xs text-slate-400 mt-1">
                Stored Token: {storedToken ? `${storedToken.length} chars` : 'None'}
              </Text>
              <Text className="text-xs text-slate-400 mt-1">
                Privy Auth: {authenticated ? 'Yes' : 'No'} | Store Auth: {isStoreAuthenticated ? 'Yes' : 'No'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Settings
          </Text>
          <Card variant="elevated">
            <SettingsItem
              icon="🔔"
              title="Notifications"
              subtitle="Manage push notifications"
            />
            <SettingsItem
              icon="🌐"
              title="Network"
              subtitle="Hedera Testnet"
            />
            <SettingsItem
              icon="🔒"
              title="Security"
              subtitle="Biometrics, PIN"
            />
            <SettingsItem
              icon="💱"
              title="Currency"
              subtitle="USD"
            />
            <SettingsItem
              icon="🌙"
              title="Appearance"
              subtitle="Light mode"
              showArrow={false}
            />
          </Card>
        </View>

        {/* Support */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Support
          </Text>
          <Card variant="elevated">
            <SettingsItem
              icon="❓"
              title="Help Center"
            />
            <SettingsItem
              icon="💬"
              title="Contact Support"
            />
            <SettingsItem
              icon="📄"
              title="Terms of Service"
            />
            <SettingsItem
              icon="🔐"
              title="Privacy Policy"
              showArrow={false}
            />
          </Card>
        </View>

        {/* Sign Out */}
        <View className="px-5">
          <Button
            type="outlined"
            size="large"
            onPress={handleLogout}
            disabled={isLoggingOut}
            loading={isLoggingOut}
            style={{ borderColor: "#ef4444" }}
            textStyle={{ color: "#ef4444" }}
          >
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </Button>
        </View>

        {/* Version */}
        <View className="items-center mt-6">
          <Text className="text-xs text-slate-400">
            Zoop Wallet v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
