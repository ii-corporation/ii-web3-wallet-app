import { useState, useCallback } from "react";
import { View, Text, Platform, Alert, ActivityIndicator, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../src/hooks/useAuth";

// Check if Privy is configured
const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "";
const isDevMode = !PRIVY_APP_ID || !PRIVY_CLIENT_ID || Platform.OS === "web";

export default function WelcomeScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Use our unified auth hook
  // Note: AuthGate handles navigation to (tabs) when authenticated
  const { authenticated, loginWithUI } = useAuth();

  // Handle login - opens Privy modal
  // Note: AuthGate handles navigation when authenticated changes
  const handleContinue = useCallback(async () => {
    if (authenticated) {
      console.log("[WelcomeScreen] Already authenticated, AuthGate will redirect");
      return;
    }

    if (isDevMode) {
      console.log("[WelcomeScreen] Dev mode - Privy not configured");
      Alert.alert("Dev Mode", "Privy is not configured. Set EXPO_PUBLIC_PRIVY_APP_ID and EXPO_PUBLIC_PRIVY_CLIENT_ID.");
      return;
    }

    if (!loginWithUI) {
      console.error("[WelcomeScreen] loginWithUI not available");
      Alert.alert("Error", "Login not available");
      return;
    }

    try {
      setIsLoggingIn(true);
      console.log("[WelcomeScreen] Opening Privy login UI...");

      const result = await loginWithUI({
        loginMethods: ["email", "google", "apple"],
      });

      console.log("[WelcomeScreen] Login successful:", result?.user?.id);
      // AuthGate will handle navigation to (tabs) when auth state updates
    } catch (error: any) {
      console.error("[WelcomeScreen] Login error:", error);
      if (error?.message?.includes("already logged in") || error?.code === "user_already_logged_in") {
        console.log("[WelcomeScreen] User already logged in, AuthGate will redirect");
        return;
      }
      if (error?.code !== "login_flow_closed" && error?.code !== "ui_flow_closed") {
        Alert.alert("Login Error", error?.message || "Failed to login");
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [authenticated, loginWithUI]);

  return (
    <LinearGradient
      colors={["#1a0a2e", "#16082a", "#0f0518"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar with Zoop Logo */}
        <View style={styles.topBar}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/zoop-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Content - Positioned at bottom */}
        <View style={styles.content}>
          {/* Header Text */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Continue with ZOOP</Text>
            <Text style={styles.subtitle}>
              Follow your favorite Creators, join Clubs, discover exclusive content and connect with Creators through personalized experiences!
            </Text>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={isLoggingIn}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["rgba(156, 44, 243, 0.2)", "rgba(58, 111, 249, 0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {isLoggingIn ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing up, you acknowledge that you have read, understood, and agree to our{" "}
              <Text style={styles.termsLink}>Terms and Conditions</Text>,{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>,{" "}
              <Text style={styles.termsLink}>Community and Creator Guidelines</Text>.
            </Text>

            {/* Powered by Hedera */}
            <View style={styles.poweredBy}>
              <Text style={styles.poweredByText}>Powered by</Text>
              <Image
                source={require("../assets/images/hedera-logo.png")}
                style={styles.hederaLogo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 68,
    height: 24,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  subtitle: {
    fontSize: 15,
    color: "#E2E8F0",
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  buttonSection: {
    gap: 16,
  },
  continueButton: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
  },
  buttonGradient: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 20,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7C3AED",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  termsText: {
    fontSize: 13,
    color: "#F5F3FF",
    lineHeight: 18,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  termsLink: {
    textDecorationLine: "underline",
  },
  poweredBy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  poweredByText: {
    fontSize: 11,
    color: "#F5F3FF",
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  hederaLogo: {
    width: 80,
    height: 18,
  },
});
