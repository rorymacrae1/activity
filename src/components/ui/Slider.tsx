import {
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { colors } from "@theme/colors";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const THUMB_SIZE = 28;
const HORIZONTAL_PADDING = 32; // left+right screen padding from parent

/**
 * Custom slider component for value selection.
 */
export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  accessibilityLabel = "Slider",
  accessibilityHint,
}: SliderProps) {
  const { width: screenWidth } = useWindowDimensions();
  const trackWidth = screenWidth - HORIZONTAL_PADDING * 2 - THUMB_SIZE;

  const range = maximumValue - minimumValue;
  const normalizedValue = (value - minimumValue) / range;
  const thumbX = useSharedValue(normalizedValue * trackWidth);

  const snapToStep = (rawValue: number): number => {
    const stepped = Math.round(rawValue / step) * step;
    return Math.max(minimumValue, Math.min(maximumValue, stepped));
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(trackWidth, e.x));
      thumbX.value = newX;

      const rawValue = (newX / trackWidth) * range + minimumValue;
      const snappedValue = snapToStep(rawValue);
      onValueChange(snappedValue);
    })
    .onEnd(() => {
      const rawValue = (thumbX.value / trackWidth) * range + minimumValue;
      const snappedValue = snapToStep(rawValue);
      const snappedX = ((snappedValue - minimumValue) / range) * trackWidth;
      thumbX.value = withSpring(snappedX, { damping: 15 });
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_SIZE / 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[styles.container, { width: trackWidth + THUMB_SIZE }]}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityValue={{
          min: minimumValue,
          max: maximumValue,
          now: value,
        }}
      >
        <View style={[styles.track, { width: trackWidth }]}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
    alignSelf: "center",
  },
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginLeft: THUMB_SIZE / 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
