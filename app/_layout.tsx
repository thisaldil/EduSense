import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect } from "react";
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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View
          style={{
            flex: 1,
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
            <Stack.Screen name="welcome" options={{ headerShown: true }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: true }} />
            <Stack.Screen name="auth/signin" options={{ headerShown: true }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
            <Stack.Screen
              name="lessons/new-lesson"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="lessons/lesson-player"
              options={{ headerShown: true }}
            />
            <Stack.Screen name="lessons/quiz" options={{ headerShown: true }} />
            <Stack.Screen
              name="lessons/quiz-result"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="lessons/quiz-review"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="lessons/quiz-loading"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="lessons/concept-explore"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="lessons/concept-playground"
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="lessons/processing"
              options={{ headerShown: true }}
            />
            <Stack.Screen name="settings" options={{ headerShown: true }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: true }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
        </View>
        <ExpoStatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
