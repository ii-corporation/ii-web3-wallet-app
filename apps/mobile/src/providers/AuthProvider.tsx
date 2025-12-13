import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import { useEffect, useRef } from "react";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "";

// Log once at module level, not on every render
let hasLoggedConfig = false;
if (__DEV__ && !hasLoggedConfig) {
  hasLoggedConfig = true;
  console.log("[AuthProvider] PRIVY_APP_ID:", PRIVY_APP_ID ? `${PRIVY_APP_ID.slice(0, 8)}...` : "NOT SET");
  console.log("[AuthProvider] PRIVY_CLIENT_ID:", PRIVY_CLIENT_ID ? `${PRIVY_CLIENT_ID.slice(0, 15)}...` : "NOT SET");
}

/**
 * AuthProvider wraps the app with Privy authentication.
 *
 * IMPORTANT: This component NEVER conditionally renders children.
 * The children (navigation stack) must stay mounted to preserve navigation state.
 * We overlay a loading screen instead of replacing children.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Load Inter fonts required by PrivyElements
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Track if fonts have ever loaded (never goes back to false)
  const fontsEverLoaded = useRef(false);
  if (fontsLoaded) {
    fontsEverLoaded.current = true;
  }

  useEffect(() => {
    if (fontsLoaded && __DEV__) {
      console.log("[AuthProvider] Fonts loaded");
    }
  }, [fontsLoaded]);

  // Dev mode fallback - no Privy configured
  if (!PRIVY_APP_ID || !PRIVY_CLIENT_ID) {
    if (__DEV__) {
      console.warn("[AuthProvider] Missing PRIVY_APP_ID or PRIVY_CLIENT_ID - running without Privy");
    }
    return <>{children}</>;
  }

  // CRITICAL: Always render PrivyProvider and children to maintain state
  // Only show loading overlay while fonts are loading for the first time
  const showLoading = !fontsLoaded && !fontsEverLoaded.current;

  return (
    <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
      {/* Children are ALWAYS rendered to preserve navigation state */}
      <View style={styles.container}>
        {children}
      </View>

      {/* PrivyElements must be mounted once, outside conditional rendering */}
      <PrivyElements />

      {/* Loading overlay - only on initial font load */}
      {showLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </PrivyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
  },
});
