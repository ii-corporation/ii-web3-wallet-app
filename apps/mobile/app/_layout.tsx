import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, QueryProvider } from "../src/providers";
import { useAuthGate } from "../src/hooks";

/**
 * Navigator component that uses Stack.Protected for declarative route guards.
 * This is the Expo Router recommended pattern (SDK 53+).
 */
function RootNavigator() {
  const { isAuthenticated, isLoading, isSyncing, syncError } = useAuthGate();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
          animation: "slide_from_right",
        }}
      >
        {/* Protected routes - only accessible when authenticated */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Public routes - only accessible when NOT authenticated */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="index" />
        </Stack.Protected>
      </Stack>

      {/* Loading overlay */}
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#ffffff",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={{ marginTop: 16, color: "#64748b" }}>
            {isSyncing ? "Syncing account..." : "Loading..."}
          </Text>
        </View>
      )}

      {/* Error toast */}
      {syncError && !isLoading && (
        <View
          style={{
            position: "absolute",
            bottom: 100,
            left: 20,
            right: 20,
            backgroundColor: "#dc2626",
            padding: 16,
            borderRadius: 12,
            zIndex: 9999,
          }}
        >
          <Text
            style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}
          >
            {syncError}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
