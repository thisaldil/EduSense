import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { useEffect } from "react";

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const playTapFeedback = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore haptic error
    }
  };

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.welcomeContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeContainer}>
          {/* Logo */}
          <View style={styles.welcomeLogoContainer}>
            <View style={styles.welcomeLogoCircle}>
              <Image
                source={require("@/assets/images/splash-icon.png")}
                style={styles.welcomeLogo}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome to EduSense</Text>
            <Text style={styles.welcomeSubtitle}>
              Transform your learning experience with multisensory content
              designed just for you
            </Text>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color={Colors.teal}
                />
              </View>
              <Text style={styles.featureText}>Visual Learning</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name="volume-high-outline"
                  size={24}
                  color={Colors.brightOrange}
                />
              </View>
              <Text style={styles.featureText}>Audio Narration</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name="pulse-outline"
                  size={24}
                  color={Colors.deepBlue}
                />
              </View>
              <Text style={styles.featureText}>Haptic Feedback</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.welcomeActions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryWelcomeButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={async () => {
                await playTapFeedback();
                router.push("/auth/signin");
              }}
            >
              <Text style={styles.primaryWelcomeButtonText}>Sign In</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryWelcomeButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={async () => {
                await playTapFeedback();
                router.push("/auth/signup");
              }}
            >
              <Text style={styles.secondaryWelcomeButtonText}>
                Create Account
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryWelcomeButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={async () => {
                await playTapFeedback();
                router.push("/haptics-test");
              }}
            >
              <Text style={styles.secondaryWelcomeButtonText}>
                Test Haptics
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  scroll: {
    flex: 1,
  },
  welcomeContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  welcomeContainer: {
    alignItems: "center",
    gap: 32,
  },
  welcomeLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  welcomeLogoCircle: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: `${Colors.deepBlue}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeLogo: {
    width: 80,
    height: 80,
  },
  welcomeTextContainer: {
    alignItems: "center",
    gap: 12,
    maxWidth: 320,
  },
  welcomeTitle: {
    ...Typography.h1,
    color: Colors.light.text,
    textAlign: "center",
  },
  welcomeSubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 8,
    flexWrap: "wrap",
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
    minWidth: 100,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  featureText: {
    ...Typography.caption,
    color: Colors.light.text,
    fontFamily: "Inter_500Medium",
  },
  welcomeActions: {
    width: "100%",
    gap: 16,
    marginTop: 16,
    maxWidth: 400,
  },
  primaryWelcomeButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryWelcomeButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  secondaryWelcomeButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryWelcomeButtonText: {
    ...Typography.button,
    color: Colors.deepBlue,
    fontFamily: "Inter_600SemiBold",
  },
});
