import { View } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { colors } from "@theme/colors";

interface EmptyStateProps {
  /** Icon name from the Icon registry */
  icon: IconName;
  /** Primary message */
  title: string;
  /** Supporting message */
  message: string;
  /** Optional call-to-action */
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Refined empty state with generous whitespace.
 *
 * Uses calm, luxury aesthetic — not sad or apologetic.
 *
 * @example
 * <EmptyState
 *   icon="bookmark"
 *   title="No saved resorts yet"
 *   message="Resorts you save will appear here for easy access."
 *   action={{ label: "Explore resorts", onPress: () => router.push("/(main)") }}
 * />
 */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-12 gap-3">
      <View className="mb-5">
        <Icon
          name={icon}
          size={48}
          color={colors.ink.muted}
          strokeWidth={1.25}
        />
      </View>
      <Text variant="h2" align="center" color="rich" className="mb-1">
        {title}
      </Text>
      <Text variant="body" align="center" color="muted" className="max-w-[280px]">
        {message}
      </Text>
      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="primary"
          size="standard"
          className="mt-6 self-center"
        />
      ) : null}
    </View>
  );
}
