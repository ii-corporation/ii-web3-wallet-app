import { useState, useCallback } from "react";
import { Alert, Platform } from "react-native";
import { useAuth } from "./useAuth";

// Check if Privy is configured
const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "";
const isDevMode = !PRIVY_APP_ID || !PRIVY_CLIENT_ID || Platform.OS === "web";

interface UseLoginFlowOptions {
  onError?: (error: Error) => void;
  errorTitle?: string;
}

/**
 * useLoginFlow - Handles login flow logic
 * Single Responsibility: Manage login state and handle login process
 * Open/Closed: Can be extended with different login methods without modification
 */
export function useLoginFlow(options?: UseLoginFlowOptions) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { authenticated, loginWithUI } = useAuth();

  const handleLogin = useCallback(async () => {
    if (authenticated) {
      console.log("[useLoginFlow] Already authenticated, AuthGate will redirect");
      return;
    }

    if (isDevMode) {
      console.log("[useLoginFlow] Dev mode - Privy not configured");
      Alert.alert(
        "Dev Mode",
        "Privy is not configured. Set EXPO_PUBLIC_PRIVY_APP_ID and EXPO_PUBLIC_PRIVY_CLIENT_ID."
      );
      return;
    }

    if (!loginWithUI) {
      console.error("[useLoginFlow] loginWithUI not available");
      Alert.alert(options?.errorTitle || "Error", "Login not available");
      return;
    }

    try {
      setIsLoggingIn(true);
      console.log("[useLoginFlow] Opening Privy login UI...");

      const result = await loginWithUI();

      console.log("[useLoginFlow] Login successful:", result?.user?.id);
      // Small delay to allow state to propagate
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error: any) {
      const errorMessage = error?.message || "";
      const errorCode = error?.code || "";

      // Ignore "already logged in" errors
      if (
        errorMessage.includes("already logged in") ||
        errorCode === "user_already_logged_in"
      ) {
        console.log("[useLoginFlow] Already logged in");
        return;
      }

      // Ignore user-cancelled/closed flows (not an error)
      if (
        errorMessage.includes("login flow was closed") ||
        errorMessage.includes("flow was closed") ||
        errorCode === "login_flow_closed" ||
        errorCode === "ui_flow_closed"
      ) {
        console.log("[useLoginFlow] Login flow cancelled by user");
        return;
      }

      // Real error - log and show alert
      console.error("[useLoginFlow] Login error:", error);
      options?.onError?.(error);
      Alert.alert(
        options?.errorTitle || "Login Error",
        errorMessage || "Failed to login"
      );
    } finally {
      setIsLoggingIn(false);
    }
  }, [authenticated, loginWithUI, options]);

  return {
    isLoggingIn,
    isAuthenticated: authenticated,
    handleLogin,
  };
}
