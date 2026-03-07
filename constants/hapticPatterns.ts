import * as Haptics from "expo-haptics";

/**
 * Mapping from semantic pattern names (used by backend)
 * to concrete Expo Haptics implementations.
 *
 * All functions are async and safe to call frequently.
 */
export const HAPTIC_PATTERNS = {
  tap_soft: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  tap_medium: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  buzz_short: async () => {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning,
    );
  },
  buzz_pulse: async () => {
    // Two quick pulses with a short delay.
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((resolve) => setTimeout(resolve, 120));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
} as const;

export type HapticPatternName = keyof typeof HAPTIC_PATTERNS;

