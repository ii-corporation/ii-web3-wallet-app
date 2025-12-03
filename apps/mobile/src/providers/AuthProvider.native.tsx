import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import { useEffect } from "react";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { View, Text, ActivityIndicator } from "react-native";

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "";

console.log("[AuthProvider] PRIVY_APP_ID:", PRIVY_APP_ID ? `${PRIVY_APP_ID.slice(0, 8)}...` : "NOT SET");
console.log("[AuthProvider] PRIVY_CLIENT_ID:", PRIVY_CLIENT_ID ? `${PRIVY_CLIENT_ID.slice(0, 15)}...` : "NOT SET");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Load Inter fonts required by PrivyElements
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    console.log("[AuthProvider] Mounted, Privy configured:", {
      appId: !!PRIVY_APP_ID,
      clientId: !!PRIVY_CLIENT_ID,
      fontsLoaded,
    });
  }, [fontsLoaded]);

  // Wait for fonts to load
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>Loading fonts...</Text>
      </View>
    );
  }

  // Skip Privy if not configured
  if (!PRIVY_APP_ID || !PRIVY_CLIENT_ID) {
    console.warn("[AuthProvider] Missing PRIVY_APP_ID or PRIVY_CLIENT_ID - running in dev mode");
    return <>{children}</>;
  }

  console.log("[AuthProvider] Initializing PrivyProvider with App ID and Client ID");
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      onError={(error) => {
        console.error("[AuthProvider] Privy error:", error);
      }}
    >
      {children}
      <PrivyElements />
    </PrivyProvider>
  );
}
