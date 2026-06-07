import { View, Pressable, Platform } from "react-native";
import { Text } from "./Text";
import { webStyles } from "@theme";

interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional eyebrow text above title */
  eyebrow?: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Section header with refined typography hierarchy.
 *
 * @example
 * <SectionHeader title="Your Matches" />
 * <SectionHeader
 *   eyebrow="Featured"
 *   title="Top Picks"
 *   subtitle="Based on your preferences"
 *   action={{ label: "See all", onPress: handleSeeAll }}
 * />
 */
export function SectionHeader({
  title,
  eyebrow,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between items-start py-3">
      <View className="flex-1 gap-0.5">
        {eyebrow ? (
          <Text variant="overline" color="muted" className="mb-0.5">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="h2" color="rich">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" color="muted" className="mt-1">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [
            pressed && { opacity: 0.7 },
            Platform.OS === "web" && webStyles.clickable,
          ]}
          className="py-1 px-2 ml-3"
        >
          <Text variant="label" color="brand">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
