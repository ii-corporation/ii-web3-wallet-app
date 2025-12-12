import "../global.css";
import { Stack, useSegments, useRouter, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/providers";
import { QueryProvider } from "../src/providers/QueryProvider";
import { useAuth } from "../src/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { syncUser } from "../src/services/api";
import { useAuthFlowStore } from "../src/stores/authStore";
import { useUserStore } from "../src/stores/userStore";

// Auth gate component that handles routing based on auth state
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, authenticated, getAccessToken, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [isSyncing, setIsSyncing] = useState(false);

  // Track if we've already navigated this session to prevent double navigation
  const hasNavigatedRef = useRef(false);
  const lastAuthenticatedRef = useRef<boolean | null>(null);

  // Zustand store for auth flow state (persists across remounts)
  const {
    hasSyncedUser,
    setHasSyncedUser,
    resetAuthFlow,
  } = useAuthFlowStore();

  // Global user store for user data across the app
  const {
    login: storeLogin,
    updateProfile,
    logout: storeLogout,
  } = useUserStore();

  // Check if navigation is ready
  const navigationReady = rootNavigationState?.key != null;

  // Sync user with backend and populate user store when authenticated
  // Backend handles wallet creation if user doesn't have one
  useEffect(() => {
    if (!isReady || !authenticated || hasSyncedUser) {
      console.log("[AuthGate] Sync skip:", { isReady, authenticated, hasSyncedUser });
      return;
    }

    const doSync = async () => {
      if (!getAccessToken) {
        console.log("[AuthGate] No getAccessToken function");
        return;
      }

      setIsSyncing(true);
      console.log("[AuthGate] Starting user sync...");

      try {
        // Get access token first
        const token = await getAccessToken();
        console.log("[AuthGate] Got token:", token ? `${token.length} chars` : "null");

        if (!token) {
          console.error("[AuthGate] No token available");
          setHasSyncedUser(true);
          return;
        }

        // Extract linked accounts from Privy user
        const linkedAccounts = {
          email: user?.email?.address,
          google: user?.google ? { email: user.google.email, name: user.google.name } : undefined,
          apple: user?.apple ? { email: user.apple.email } : undefined,
          discord: user?.discord ? { username: user.discord.username } : undefined,
          twitter: user?.twitter ? { username: user.twitter.username } : undefined,
        };

        // Sync with backend - backend will create wallet if needed
        const result = await syncUser(getAccessToken);
        console.log("[AuthGate] Backend sync result:", result ? {
          userId: result.user?.id,
          isNew: result.isNewUser,
          walletsCount: result.user?.wallets?.length,
        } : "null");

        if (result?.user) {
          // Get primary wallet from backend response (backend creates it if needed)
          const backendWallet = result.user.wallets?.find(w => w.isPrimary) || result.user.wallets?.[0];
          const walletForStore = backendWallet ? {
            address: backendWallet.address,
            type: "embedded" as const,
          } : undefined;

          // Populate user store with combined data
          storeLogin({
            privyUserId: user?.id || "",
            accessToken: token,
            wallet: walletForStore,
            linkedAccounts,
          });

          // Update profile with backend user data
          updateProfile({
            id: result.user.id,
            privyUserId: user?.id || "",
            privyEoaAddress: walletForStore?.address || "",
            hederaAccountId: null,
            safeWalletAddress: null,
            accountStatus: "active",
            createdAt: result.user.createdAt,
            updatedAt: result.user.createdAt,
          });

          console.log("[AuthGate] User store populated with wallet:", walletForStore?.address?.slice(0, 10) || "none");
        } else {
          // Backend sync failed - store Privy data only
          storeLogin({
            privyUserId: user?.id || "",
            accessToken: token,
            wallet: undefined,
            linkedAccounts,
          });
          console.warn("[AuthGate] Backend sync failed, using Privy data only");
        }

        setHasSyncedUser(true);
      } catch (error: any) {
        console.error("[AuthGate] Sync error:", error.message);
        setHasSyncedUser(true);
      } finally {
        setIsSyncing(false);
      }
    };

    doSync();
  }, [isReady, authenticated, getAccessToken, hasSyncedUser, setHasSyncedUser, user, storeLogin, updateProfile]);

  // Reset auth flow when user becomes unauthenticated (logout)
  useEffect(() => {
    if (isReady && !authenticated && hasSyncedUser) {
      console.log("[AuthGate] User logged out, resetting auth flow state");
      resetAuthFlow();
      storeLogout();
    }
  }, [isReady, authenticated, hasSyncedUser, resetAuthFlow, storeLogout]);

  // Handle navigation based on auth state changes
  useEffect(() => {
    // Wait for everything to be ready
    if (!isReady || !navigationReady) {
      console.log("[AuthGate] Not ready yet:", { isReady, navigationReady });
      return;
    }

    const inTabsGroup = segments[0] === "(tabs)";
    const currentSegment = segments[0] || "index";

    // Detect if auth state actually changed
    const authStateChanged = lastAuthenticatedRef.current !== null &&
                            lastAuthenticatedRef.current !== authenticated;
    const isFirstRun = lastAuthenticatedRef.current === null;

    console.log("[AuthGate] Navigation check:", {
      authenticated,
      inTabsGroup,
      currentSegment,
      isFirstRun,
      authStateChanged,
      hasNavigated: hasNavigatedRef.current,
    });

    // Update ref
    lastAuthenticatedRef.current = authenticated;

    // Authenticated user not in tabs - redirect to tabs
    if (authenticated && !inTabsGroup) {
      // Only navigate if we haven't already or if auth state just changed
      if (!hasNavigatedRef.current || authStateChanged) {
        console.log("[AuthGate] Redirecting authenticated user to tabs");
        hasNavigatedRef.current = true;

        // Use setTimeout(0) to avoid navigation during render
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 0);
      }
      return;
    }

    // Unauthenticated user in tabs - redirect to welcome
    // This should trigger on auth state change OR on first run (component remounted after logout)
    if (!authenticated && inTabsGroup) {
      if (authStateChanged || isFirstRun) {
        console.log("[AuthGate] Redirecting unauthenticated user to welcome (authStateChanged:", authStateChanged, ", isFirstRun:", isFirstRun, ")");
        hasNavigatedRef.current = false;

        setTimeout(() => {
          router.replace("/");
        }, 0);
      }
      return;
    }

    // Reset navigation flag when on correct screen
    if (authenticated && inTabsGroup) {
      hasNavigatedRef.current = true;
    } else if (!authenticated && !inTabsGroup) {
      hasNavigatedRef.current = false;
    }
  }, [isReady, authenticated, segments, navigationReady, router]);

  // IMPORTANT: Always render children to preserve navigation state
  // Show loading overlay instead of replacing content
  const showLoading = !isReady;

  return (
    <View style={{ flex: 1 }}>
      {children}

      {/* Loading overlay - preserves navigation state underneath */}
      {showLoading && (
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={{ marginTop: 16, color: "#64748b" }}>
            {isSyncing ? "Syncing account..." : "Loading..."}
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
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
