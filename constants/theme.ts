/**
 * Theme configuration for EduSense
 * Colors and typography system
 */

import { Platform, TextStyle } from "react-native";

// Brand Colors
export const Colors = {
  deepBlue: "#0052CC", // Main brand color - trust, education
  teal: "#00BFA6", // Sensory experience, innovation
  brightOrange: "#FFA726", // Engagement, energy, action

  // Semantic Colors
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    border: "#E5E7EB",
    tint: "#0052CC",
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#0052CC",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    background: "#111827",
    backgroundSecondary: "#1F2937",
    border: "#374151",
    tint: "#00BFA6",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#00BFA6",
  },
};

// Typography System
export const Typography = {
  // Headings
  h1: {
    fontFamily: "Poppins_700Bold",
    fontSize: 32,
    lineHeight: 40,
  } as TextStyle,
  h2: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
  } as TextStyle,
  h3: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
  } as TextStyle,

  // Body
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  bodyMedium: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  // UI Elements
  button: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  // Small text
  small: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,
};

// Legacy Fonts (for backward compatibility)
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
