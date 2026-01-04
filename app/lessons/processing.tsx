import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

const STAGES = [
  { text: "Analyzing content...", emoji: "🔍" },
  { text: "Extracting key concepts...", emoji: "🎯" },
  { text: "Generating visuals...", emoji: "🎨" },
  { text: "Creating audio...", emoji: "🎵" },
  { text: "Designing haptics...", emoji: "✨" },
] as const;

const FUN_FACTS = [
  "🧠 Active recall can boost memory retention by up to 50%!",
  "👀 Switching between visual and audio keeps your brain engaged.",
  "🗣️ Teaching others what you learned is a powerful memory hack!",
  "🎮 Learning through play makes concepts stick longer.",
  "🌈 Using multiple senses together helps you learn faster!",
] as const;

type Stage = (typeof STAGES)[number];

export default function ProcessingScreen() {
  const params = useLocalSearchParams<{ lesson_id?: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const pulseAnim = new Animated.Value(1);

  const progressPercent = useMemo(
    () => Math.round(((currentIndex + 1) / STAGES.length) * 100),
    [currentIndex]
  );

  // Pulse animation for the central icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 3500);

    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 6000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(factInterval);
    };
  }, []);

  useEffect(() => {
    if (currentIndex === STAGES.length - 1) {
      const timeout = setTimeout(() => {
        router.push({
          pathname: "/lessons/lesson-player",
          params: { lesson_id: params.lesson_id },
        });
      }, 1200);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, params.lesson_id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Hero Section with Animation */}
          <View style={styles.heroSection}>
            <View style={styles.animationContainer}>
              {/* Outer glow rings */}
              <View style={[styles.glowRing, styles.glowRingOuter]} />
              <View style={[styles.glowRing, styles.glowRingMiddle]} />

              {/* Central animated icon */}
              <Animated.View
                style={[
                  styles.centralIcon,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="planet" size={56} color="#FFFFFF" />
                </View>
              </Animated.View>

              {/* Optional: Add your GIF here */}
              {/* <Image
              source={require("@/assets/images/processing-orb.gif")}
              style={styles.processingGif}
              resizeMode="contain"
            /> */}
            </View>

            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Creating Your Lesson ✨</Text>
              <Text style={styles.heroSubtitle}>
                Mixing audio, visuals, and magic to make learning awesome!
              </Text>
            </View>
          </View>

          {/* Progress Overview */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressIconCircle}>
                <Ionicons name="rocket" size={24} color={Colors.deepBlue} />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Processing</Text>
                <Text style={styles.progressSubtitle}>Almost there!</Text>
              </View>
              <Text style={styles.progressPercentLarge}>
                {progressPercent}%
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.etaText}>⏱️ About 30 seconds remaining</Text>
          </View>

          {/* Stages List */}
          <View style={styles.stagesSection}>
            <Text style={styles.stagesTitle}>What's Happening</Text>
            <View style={styles.stagesCard}>
              {STAGES.map((stage, index) => {
                const isCurrent = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                  <View
                    key={stage.text}
                    style={[
                      styles.stageRow,
                      isCurrent && styles.stageRowActive,
                    ]}
                  >
                    <View style={styles.stageLeft}>
                      <View
                        style={[
                          styles.stageIndicator,
                          isCompleted && styles.stageIndicatorCompleted,
                          isCurrent && styles.stageIndicatorActive,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        ) : (
                          <Text style={styles.stageEmoji}>{stage.emoji}</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stageText,
                          isCurrent && styles.stageTextActive,
                          isCompleted && styles.stageTextCompleted,
                        ]}
                      >
                        {stage.text}
                      </Text>
                    </View>
                    {isCurrent && (
                      <View style={styles.loadingDots}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Cancel Button */}
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F7FF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  animationContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  glowRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
  },
  glowRingOuter: {
    width: 180,
    height: 180,
    borderColor: `${Colors.teal}30`,
  },
  glowRingMiddle: {
    width: 140,
    height: 140,
    borderColor: `${Colors.deepBlue}20`,
  },
  centralIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  processingGif: {
    width: 200,
    height: 200,
    position: "absolute",
  },
  heroText: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Progress Card
  progressCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  progressIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.deepBlue}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  progressSubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  progressPercentLarge: {
    ...Typography.h2,
    color: Colors.deepBlue,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: `${Colors.deepBlue}15`,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: Colors.teal,
  },
  etaText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },

  // Stages Section
  stagesSection: {
    marginBottom: 24,
  },
  stagesTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stagesCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  stageRowActive: {
    backgroundColor: `${Colors.teal}10`,
  },
  stageLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  stageIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stageIndicatorCompleted: {
    backgroundColor: Colors.teal,
  },
  stageIndicatorActive: {
    backgroundColor: Colors.deepBlue,
  },
  stageEmoji: {
    fontSize: 16,
  },
  stageText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  stageTextActive: {
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
  },
  stageTextCompleted: {
    color: Colors.light.textSecondary,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.teal,
  },

  // Fact Card
  factCard: {
    backgroundColor: `${Colors.brightOrange}15`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${Colors.brightOrange}25`,
  },
  factHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  factIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  factTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  factText: {
    ...Typography.body,
    color: Colors.light.text,
    lineHeight: 22,
  },

  // Cancel Button
  cancelButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButtonText: {
    ...Typography.button,
    color: Colors.light.textSecondary,
  },
});
