import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { Platform, StatusBar as RNStatusBar, View } from "react-native";
import "react-native-reanimated";

import "@/global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { AuthProvider } from "@/contexts/AuthContext";
import { NeuroStateProvider } from "@/context/NeuroStateContext";
import { AnalyticsLoggerProvider } from "@/context/AnalyticsLoggerContext";
import { useCognitiveTheme } from "@/hooks/use-cognitive-theme";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppShell() {
  const colorScheme = useColorScheme();
  const { theme: cognitiveTheme } = useCognitiveTheme();

  const navigationTheme = useMemo(() => {
    const baseTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: cognitiveTheme.semantic.tint,
        background: cognitiveTheme.semantic.backgroundSecondary,
        card: cognitiveTheme.semantic.background,
        text: cognitiveTheme.semantic.text,
        border: cognitiveTheme.semantic.border,
        notification: cognitiveTheme.brand.accent,
      },
    };
  }, [colorScheme, cognitiveTheme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <View
        style={{
          flex: 1,
          backgroundColor: cognitiveTheme.semantic.backgroundSecondary,
          paddingTop:
            Platform.OS === "android" ? (RNStatusBar.currentHeight ?? 0) : 0,
        }}
      >
        <Stack initialRouteName="splash">
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="calibration/index"
            options={{ headerShown: false, title: "Brain Sync" }}
          />
          <Stack.Screen
            name="calibration/task-reading"
            options={{ headerShown: false, title: "Reading Center" }}
          />
          <Stack.Screen
            name="calibration/task-visual"
            options={{ headerShown: false, title: "Visual Lab" }}
          />
          <Stack.Screen
            name="calibration/task-pulse"
            options={{ headerShown: false, title: "Pulse Match" }}
          />
          <Stack.Screen
            name="lessons/new-lesson"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="lessons/lesson-player"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="lessons/quiz" options={{ headerShown: false }} />
          <Stack.Screen
            name="lessons/quiz-result"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="lessons/quiz-review"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="lessons/quiz-loading"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="lessons/concept-explore"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="lessons/concept-playground"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="lessons/processing"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </View>
      <ExpoStatusBar
        style={cognitiveTheme.statusBarStyle}
        backgroundColor={cognitiveTheme.semantic.backgroundSecondary}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <NeuroStateProvider>
        <AnalyticsLoggerProvider>
          <AppShell />
        </AnalyticsLoggerProvider>
      </NeuroStateProvider>
    </AuthProvider>
  );
}
