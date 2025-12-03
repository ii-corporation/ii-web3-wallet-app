import "../global.css";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/providers";
import { useAuth } from "../src/hooks/useAuth";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { syncUser } from "../src/services/api";
import { useAuthFlowStore } from "../src/stores/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
    },
  },
});

// Auth gate component that handles routing based on auth state
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, authenticated, getAccessToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  // Zustand store for auth flow state (persists across remounts)
  const {
    hasSyncedUser,
    isNavigating,
    lastAuthState,
    setHasSyncedUser,
    setIsNavigating,
    setLastAuthState,
    resetAuthFlow,
  } = useAuthFlowStore();

  // Sync user with backend when authenticated
  useEffect(() => {
    if (!isReady || !authenticated || hasSyncedUser) {
      return;
    }

    const doSync = async () => {
      if (!getAccessToken) return;

      setIsSyncing(true);
      console.log("[AuthGate] Syncing user with backend...");

      try {
        const result = await syncUser(getAccessToken);
        if (result) {
          console.log("[AuthGate] User synced successfully:", result.user?.id);
          setHasSyncedUser(true);
        } else {
          console.warn("[AuthGate] User sync returned null");
        }
      } catch (error: any) {
        console.error("[AuthGate] User sync failed:", error.message);
      } finally {
        setIsSyncing(false);
      }
    };

    doSync();
  }, [isReady, authenticated, getAccessToken, hasSyncedUser, setHasSyncedUser]);

  // Handle navigation based on auth state changes
  useEffect(() => {
    if (!isReady || isNavigating) {
      return;
    }

    const inTabsGroup = segments[0] === "(tabs)";

    // Only navigate when auth state actually changes (not on every render)
    const authChanged = lastAuthState !== null && lastAuthState !== authenticated;
    const isInitialLoad = lastAuthState === null;

    // Update last auth state
    if (lastAuthState !== authenticated) {
      setLastAuthState(authenticated);
    }

    // Authenticated user not in tabs - redirect to tabs
    if (authenticated && !inTabsGroup && (isInitialLoad || authChanged)) {
      console.log("[AuthGate] Redirecting authenticated user to tabs");
      setIsNavigating(true);

      setTimeout(() => {
        router.replace("/(tabs)");
        setTimeout(() => setIsNavigating(false), 1000);
      }, 150);
      return;
    }

    // Unauthenticated user in tabs - redirect to welcome (only on auth change)
    if (!authenticated && inTabsGroup && authChanged) {
      console.log("[AuthGate] Redirecting unauthenticated user to welcome");
      setIsNavigating(true);

      setTimeout(() => {
        router.replace("/");
        // Reset auth flow after navigation
        setTimeout(() => resetAuthFlow(), 500);
      }, 150);
      return;
    }
  }, [isReady, authenticated, segments, lastAuthState, isNavigating]);

  // Show loading screen while Privy initializes or syncing
  if (!isReady || isSyncing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ marginTop: 16, color: "#64748b" }}>
          {isSyncing ? "Syncing account..." : "Loading..."}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGate>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#ffffff" },
                  animation: "slide_from_right",
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </AuthGate>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
