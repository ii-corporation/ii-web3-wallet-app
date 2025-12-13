import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";
import {
  HomeIcon,
  StakingIcon,
  ConvertIcon,
  RewardsIcon,
  WalletIcon,
} from "../../src/components/icons";
import { TabBarIcon } from "../../src/components/layouts/navigation";
import { GradientIcon, GradientText } from "../../src/components/ui";

// Custom label component for tab bar with extra bold on active
function TabLabel({
  focused,
  children,
}: {
  focused: boolean;
  children: string;
}) {
  if (focused) {
    return (
      <GradientText style={styles.labelActive}>{children}</GradientText>
    );
  }
  return <Text style={styles.labelInactive}>{children}</Text>;
}

const styles = StyleSheet.create({
  labelActive: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 8,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  labelInactive: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 8,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: "#475569",
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#F8FAFC",
          borderTopColor: "#F1F5F9",
          borderTopWidth: 1,
          height: 60,
          paddingTop: 0,
          paddingBottom: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 80,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {focused ? (
                <GradientIcon size={24}>
                  <HomeIcon size={24} color="#000" filled />
                </GradientIcon>
              ) : (
                <HomeIcon size={24} />
              )}
            </TabBarIcon>
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused}>HOME</TabLabel>
          ),
        }}
      />
      <Tabs.Screen
        name="staking"
        options={{
          title: "STAKING",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {focused ? (
                <GradientIcon size={24}>
                  <StakingIcon size={24} color="#000" filled />
                </GradientIcon>
              ) : (
                <StakingIcon size={24} />
              )}
            </TabBarIcon>
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused}>STAKING</TabLabel>
          ),
        }}
      />
      <Tabs.Screen
        name="convert"
        options={{
          title: "CONVERT",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {focused ? (
                <GradientIcon size={24}>
                  <ConvertIcon size={24} color="#000" />
                </GradientIcon>
              ) : (
                <ConvertIcon size={24} />
              )}
            </TabBarIcon>
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused}>CONVERT</TabLabel>
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "REWARDS",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {focused ? (
                <GradientIcon size={24}>
                  <RewardsIcon size={24} color="#000" filled />
                </GradientIcon>
              ) : (
                <RewardsIcon size={24} />
              )}
            </TabBarIcon>
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused}>REWARDS</TabLabel>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "WALLET",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {focused ? (
                <GradientIcon size={24}>
                  <WalletIcon size={24} color="#000" filled />
                </GradientIcon>
              ) : (
                <WalletIcon size={24} />
              )}
            </TabBarIcon>
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused}>WALLET</TabLabel>
          ),
        }}
      />
      {/* Hide profile from tab bar but keep the screen */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
