import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@theme/colors";

interface TabIconProps {
  icon: IconName;
  label: string;
  focused: boolean;
}

/**
 * Accessible tab icon component.
 */
function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View accessibilityLabel={label} accessibilityRole="image">
      <Icon
        name={icon}
        size={22}
        color={focused ? colors.brand.primary : colors.ink.muted}
        strokeWidth={focused ? 2 : 1.5}
      />
    </View>
  );
}

const _styles = StyleSheet.create({});

/**
 * Main app layout with bottom tab navigation.
 */
export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.ink.muted,
        tabBarStyle: {
          backgroundColor: colors.canvas.default,
          borderTopColor: colors.border.default,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarAccessibilityLabel: "Discover resorts tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="search" label="Discover" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarAccessibilityLabel: "Saved resorts tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="heart" label="Saved" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile and settings tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="user" label="Profile" focused={focused} />
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
      <Tabs.Screen
        name="complete-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
