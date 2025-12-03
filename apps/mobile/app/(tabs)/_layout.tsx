import { Tabs } from "expo-router";
import { View } from "react-native";

// Tab Bar Icons
function HomeIcon({ focused }: { focused: boolean }) {
  return (
    <View className={`w-6 h-6 items-center justify-center`}>
      <View
        className={`w-5 h-5 rounded-md ${focused ? "bg-primary-600" : "bg-slate-400"}`}
      />
    </View>
  );
}

function WalletIcon({ focused }: { focused: boolean }) {
  return (
    <View className="w-6 h-6 items-center justify-center">
      <View
        style={{
          width: 20,
          height: 14,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: focused ? "#7c3aed" : "#94a3b8",
        }}
      />
    </View>
  );
}

function StakingIcon({ focused }: { focused: boolean }) {
  return (
    <View className="w-6 h-6 items-center justify-center">
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: focused ? "#7c3aed" : "#94a3b8",
        }}
      />
    </View>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  return (
    <View className="w-6 h-6 items-center justify-center">
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: focused ? "#7c3aed" : "#94a3b8",
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 18,
          height: 8,
          borderTopLeftRadius: 9,
          borderTopRightRadius: 9,
          backgroundColor: focused ? "#7c3aed" : "#94a3b8",
        }}
      />
    </View>
  );
}

export default function TabsLayout() {
  // Auth is handled by AuthGate in root _layout.tsx
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: "#7c3aed",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ focused }) => <WalletIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="staking"
        options={{
          title: "Staking",
          tabBarIcon: ({ focused }) => <StakingIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}
