/**
 * Theme configuration for EduSense
 * Colors and typography system
 */

import { Platform, TextStyle } from "react-native";

export type CognitiveLoadState = "LOW_LOAD" | "OPTIMAL" | "OVERLOAD";

export type SemanticColors = {
  text: string;
  textSecondary: string;
  background: string;
  backgroundSecondary: string;
  border: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

export type CognitiveTheme = {
  key: CognitiveLoadState;
  label: string;
  semantic: SemanticColors;
  brand: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    tabBadge: string;
  };
  gradient: {
    start: string;
    end: string;
  };
  statusBarStyle: "light" | "dark";
};

const cognitiveThemes: Record<CognitiveLoadState, CognitiveTheme> = {
  LOW_LOAD: {
    key: "LOW_LOAD",
    label: "Explore",
    semantic: {
      text: "#0B1E3A",
      textSecondary: "#4B5F86",
      background: "#F4F9FF",
      backgroundSecondary: "#EAF4FF",
      border: "#BFD9FF",
      tint: "#2563EB",
      icon: "#4B5F86",
      tabIconDefault: "#7A8CB3",
      tabIconSelected: "#2563EB",
    },
    brand: {
      primary: "#2563EB",
      secondary: "#06B6D4",
      accent: "#F59E0B",
      glow: "#93C5FD",
      tabBadge: "#38BDF8",
    },
    gradient: {
      start: "#DBEAFE",
      end: "#F0F9FF",
    },
    statusBarStyle: "dark",
  },
  OPTIMAL: {
    key: "OPTIMAL",
    label: "Focus",
    semantic: {
      text: "#1A1A1A",
      textSecondary: "#6B7280",
      background: "#FFFFFF",
      backgroundSecondary: "#F7F9FC",
      border: "#E5E7EB",
      tint: "#0052CC",
      icon: "#6B7280",
      tabIconDefault: "#94A3B8",
      tabIconSelected: "#0052CC",
    },
    brand: {
      primary: "#0052CC",
      secondary: "#00BFA6",
      accent: "#FFA726",
      glow: "#60A5FA",
      tabBadge: "#22C55E",
    },
    gradient: {
      start: "#EAF2FF",
      end: "#F7FCFF",
    },
    statusBarStyle: "dark",
  },
  OVERLOAD: {
    key: "OVERLOAD",
    label: "Calm",
    semantic: {
      text: "#10243D",
      textSecondary: "#5B728A",
      background: "#F3F8F7",
      backgroundSecondary: "#E8F0EF",
      border: "#CDE0DC",
      tint: "#0F766E",
      icon: "#6F8893",
      tabIconDefault: "#8AA3AD",
      tabIconSelected: "#0F766E",
    },
    brand: {
      primary: "#0F766E",
      secondary: "#334155",
      accent: "#14B8A6",
      glow: "#99F6E4",
      tabBadge: "#F97316",
    },
    gradient: {
      start: "#DDF3EF",
      end: "#F3F8F7",
    },
    statusBarStyle: "dark",
  },
};

export const getCognitiveTheme = (
  state?: CognitiveLoadState,
): CognitiveTheme => {
  if (!state) return cognitiveThemes.OPTIMAL;
  return cognitiveThemes[state] || cognitiveThemes.OPTIMAL;
};

// Brand Colors
export const Colors = {
  deepBlue: "#0052CC", // Main brand color - trust, education
  teal: "#00BFA6", // Sensory experience, innovation
  brightOrange: "#FFA726", // Engagement, energy, action

  cognitive: cognitiveThemes,

  // Semantic Colors
  light: {
    text: cognitiveThemes.OPTIMAL.semantic.text,
    textSecondary: cognitiveThemes.OPTIMAL.semantic.textSecondary,
    background: cognitiveThemes.OPTIMAL.semantic.background,
    backgroundSecondary: cognitiveThemes.OPTIMAL.semantic.backgroundSecondary,
    border: cognitiveThemes.OPTIMAL.semantic.border,
    tint: cognitiveThemes.OPTIMAL.semantic.tint,
    icon: cognitiveThemes.OPTIMAL.semantic.icon,
    tabIconDefault: cognitiveThemes.OPTIMAL.semantic.tabIconDefault,
    tabIconSelected: cognitiveThemes.OPTIMAL.semantic.tabIconSelected,
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
