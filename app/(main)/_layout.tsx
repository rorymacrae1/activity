import { Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

/**
 * Accessible tab icon component.
 */
function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View accessibilityLabel={label} accessibilityRole="image">
      <Text
        style={[styles.tabEmoji, focused ? styles.focused : styles.unfocused]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabEmoji: {
    fontSize: 20,
  },
  focused: {
    opacity: 1,
  },
  unfocused: {
    opacity: 0.5,
  },
});

/**
 * Main app layout with bottom tab navigation.
 */
export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarAccessibilityLabel: "Discover resorts tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏔️" label="Discover" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarAccessibilityLabel: "Saved resorts tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="❤️" label="Saved" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile and settings tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
      {/* Hide resort detail from tabs */}
      <Tabs.Screen
        name="resort/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="map/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
