/**
 * API Configuration
 *
 * For development on physical devices:
 * - iOS Simulator: Use http://localhost:8000
 * - Android Emulator: Use http://10.0.2.2:8000
 * - Physical Device: Use your computer's local IP (e.g., http://192.168.1.100:8000)
 *
 * To find your local IP:
 * - Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
 * - Windows: ipconfig
 */

import Constants from "expo-constants";

// Get the base URL from environment variables or use default
const getApiBaseUrl = (): string => {
  // EXPO_PUBLIC_API_URL (Expo env) or apiUrl in app config
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }

  // Default configuration based on platform
  const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

  if (isDev) {
    // Development mode
    const platform = Constants.platform;

    if (platform?.ios) {
      // iOS Simulator can use localhost or 127.0.0.1
      return "http://127.0.0.1:8000";
    } else if (platform?.android) {
      // For Android devices (physical or emulator):
      // - Emulator: Use 10.0.2.2 to access host machine's localhost
      // - Physical device: Use your computer's local IP address
      // Change this to your local IP if testing on a physical device
      // Find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1
      return "http://192.168.1.166:8000"; // Update this to your local IP for physical devices
      // return "http://10.0.2.2:8000"; // Use this for Android Emulator
    }
    // Default for web or unknown platforms
    return "http://127.0.0.1:8000";
  }

  // Production - update this with your production API URL
  return "http://127.0.0.1:8000";
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },
  USERS: "/api/users",
  LESSONS: "/api/lessons",
  CONTENT: "/api/content",
  QUIZZES: "/api/quizzes",
  PROGRESS: "/api/progress",
  UPLOADS: "/api/uploads",
  ACTIVITIES: "/api/activities",
  ANIMATION_NEURO_ADAPTIVE: "/api/animation/neuro-adaptive",
  SENSORY_OVERLAY: "/api/sensory/overlay",
  TTS_SYNTHESIZE: "/api/tts/synthesize",
  VISION_NOTES_ANALYZE: "/api/vision/notes/analyze",
} as const;
