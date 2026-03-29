import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { getResortById } from "@/services/resort";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing } from "@/theme/spacing";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Piste map viewer with pinch-to-zoom functionality.
 */
export default function MapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resort = getResortById(id);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      }
      if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!resort) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Resort not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>{resort.name} Map</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {resort.assets.pisteMap ? (
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.mapWrapper, animatedStyle]}>
              <Image
                source={{ uri: resort.assets.pisteMap }}
                style={styles.mapImage}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>
        ) : (
          <View style={styles.noMapContainer}>
            <Text style={styles.noMapEmoji}>🗺️</Text>
            <Text style={styles.noMapText}>Map coming soon</Text>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: colors.terrain.beginner }]}
            />
            <Text style={styles.legendText}>Beginner</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: colors.terrain.intermediate }]}
            />
            <Text style={styles.legendText}>Intermediate</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: colors.terrain.advanced }]}
            />
            <Text style={styles.legendText}>Advanced</Text>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        Pinch to zoom • Double-tap to reset
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    overflow: "hidden",
  },
  mapWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
  noMapContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  noMapEmoji: {
    fontSize: 48,
  },
  noMapText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  legend: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  legendItems: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  instructions: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: "center",
    paddingBottom: spacing.md,
  },
});
