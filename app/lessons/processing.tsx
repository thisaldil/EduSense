import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useNeuroState } from "@/context/NeuroStateContext";
import { neuroApi } from "@/services/api";

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

export default function ProcessingScreen() {
  const params = useLocalSearchParams<{
    lesson_id?: string;
    raw_text?: string;
    session_id?: string;
  }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  // FIX 1: useRef for pulseAnim to avoid re-creating on every render
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { state: neuroState } = useNeuroState();

  // FIX 2: Use a ref to guard against double-execution (StrictMode / re-renders)
  const hasStarted = useRef(false);
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [transmuteError, setTransmuteError] = useState<string | null>(null);
  const [transmuteResult, setTransmuteResult] =
    useState<neuroApi.TransmuteResponse | null>(null);

  const progressPercent = useMemo(
    () => Math.round(((currentIndex + 1) / STAGES.length) * 100),
    [currentIndex],
  );

  // Animate progress bar smoothly
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  // Pulse animation — stable ref, no re-creation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Stage + fact cycling
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

  // Guard transmutation with a ref so it only fires once
  useEffect(() => {
    const rawText = params.raw_text;
    if (!rawText || hasStarted.current) return;
    hasStarted.current = true;

    const cognitive_state: neuroApi.CognitiveStateWire =
      neuroState.currentState === "LOW"
        ? "LOW_LOAD"
        : neuroState.currentState === "OPTIMAL"
          ? "OPTIMAL"
          : "OVERLOAD";

    const run = async () => {
      try {
        setIsTransmuting(true);
        setTransmuteError(null);
        const result = await neuroApi.transmute({
          text: rawText,
          cognitive_state,
          session_id: params.session_id,
        });
        setTransmuteResult(result);
      } catch (error: any) {
        setTransmuteError(
          error?.message || "Failed to process your lesson. Please try again.",
        );
        // FIX 5: Reset guard so user can retry after an error
        hasStarted.current = false;
      } finally {
        setIsTransmuting(false);
      }
    };

    run();
  }, [params.raw_text, neuroState.currentState]);

  // Navigate once result is ready
  useEffect(() => {
    if (!transmuteResult) return;
    const timeout = setTimeout(() => {
      router.push({
        pathname: "/lessons/concept-explore",
        params: {
          lesson_id: params.lesson_id,
          raw_text: params.raw_text,
          transmute: JSON.stringify(transmuteResult),
        },
      });
    }, 1200);
    return () => clearTimeout(timeout);
  }, [transmuteResult]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.heroSection}>
          <View style={styles.animationContainer}>
            <View style={[styles.glowRing, styles.glowRingOuter]} />
            <View style={[styles.glowRing, styles.glowRingMiddle]} />
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
          </View>
          <Text style={styles.heroTitle}>Creating Your Lesson ✨</Text>
          <Text style={styles.heroSubtitle}>
            Mixing audio, visuals, and magic to make learning awesome!
          </Text>
        </View>

        {/* ── Progress Card ── */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIconCircle}>
              <Ionicons name="rocket" size={22} color={Colors.deepBlue} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                {isTransmuting
                  ? "Transmuting text..."
                  : transmuteResult
                    ? "Done!"
                    : "Processing"}
              </Text>
              <Text style={styles.progressSubtitle}>
                {isTransmuting
                  ? `State: ${neuroState.currentState}`
                  : "Almost there!"}
              </Text>
            </View>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>

          <View style={styles.progressTrack}>
            {/* FIX 6: Animated width instead of static style width */}
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>

          <Text style={styles.etaText}>
            {isTransmuting
              ? "⏱️ Talking to the Neuro‑Engine…"
              : "⏱️ Almost done!"}
          </Text>
        </View>

        {/* ── Cognitive State Badge ── */}
        <View style={styles.stateBadgeRow}>
          <View
            style={[
              styles.stateBadge,
              neuroState.currentState === "LOW" && styles.stateBadgeLow,
              neuroState.currentState === "OPTIMAL" && styles.stateBadgeOptimal,
              neuroState.currentState === "OVERLOAD" && styles.stateBadgeHigh,
            ]}
          >
            <Text style={styles.stateBadgeText}>
              {neuroState.currentState === "LOW" &&
                "🟡 LOW LOAD — Narrative Mode"}
              {neuroState.currentState === "OPTIMAL" &&
                "🟢 OPTIMAL — Direct Mode"}
              {neuroState.currentState === "OVERLOAD" &&
                "🔴 OVERLOAD — Simplified Mode"}
            </Text>
          </View>
        </View>

        {/* ── Stages ── */}
        <View style={styles.stagesCard}>
          {STAGES.map((stage, index) => {
            const isCurrent = index === currentIndex;
            const isCompleted = index < currentIndex;
            return (
              <View
                key={stage.text}
                style={[styles.stageRow, isCurrent && styles.stageRowActive]}
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
                      <Ionicons name="checkmark" size={14} color="#fff" />
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
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={styles.dot} />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Fun Fact ── */}
        <View style={styles.factCard}>
          <Text style={styles.factLabel}>💡 Did you know?</Text>
          <Text style={styles.factText}>{FUN_FACTS[factIndex]}</Text>
        </View>

        {/* ── Error ── */}
        {transmuteError && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color="#B91C1C" />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorTitle}>We hit a bump</Text>
              <Text style={styles.errorText}>{transmuteError}</Text>
            </View>
          </View>
        )}

        {/* ── Cancel ── */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F7FF" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 36 },

  heroSection: { alignItems: "center", marginBottom: 28 },
  animationContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  glowRing: { position: "absolute", borderRadius: 999, borderWidth: 2 },
  glowRingOuter: { width: 170, height: 170, borderColor: `${Colors.teal}30` },
  glowRingMiddle: {
    width: 130,
    height: 130,
    borderColor: `${Colors.deepBlue}20`,
  },
  centralIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 6,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  progressIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.deepBlue}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  progressInfo: { flex: 1 },
  progressTitle: { ...Typography.bodyMedium, color: Colors.light.text },
  progressSubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  progressPercent: { ...Typography.h2, color: Colors.deepBlue },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: `${Colors.deepBlue}15`,
    overflow: "hidden",
    marginBottom: 10,
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

  stateBadgeRow: { alignItems: "center", marginBottom: 16 },
  stateBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  stateBadgeLow: { backgroundColor: "#FEF3C7" },
  stateBadgeOptimal: { backgroundColor: "#DCFCE7" },
  stateBadgeHigh: { backgroundColor: "#FEE2E2" },
  stateBadgeText: { fontSize: 12, fontWeight: "700", color: "#1E293B" },

  stagesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  stageRowActive: { backgroundColor: `${Colors.teal}12` },
  stageLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  stageIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  stageIndicatorCompleted: { backgroundColor: Colors.teal },
  stageIndicatorActive: { backgroundColor: Colors.deepBlue },
  stageEmoji: { fontSize: 15 },
  stageText: { ...Typography.body, color: Colors.light.textSecondary, flex: 1 },
  stageTextActive: {
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
  },
  stageTextCompleted: { color: Colors.light.textSecondary },
  loadingDots: { flexDirection: "row", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.teal },

  factCard: {
    backgroundColor: `${Colors.brightOrange}15`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${Colors.brightOrange}25`,
  },
  factLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.brightOrange,
    marginBottom: 6,
  },
  factText: { ...Typography.body, color: Colors.light.text, lineHeight: 22 },

  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorTitle: { ...Typography.bodyMedium, color: "#B91C1C", marginBottom: 3 },
  errorText: { ...Typography.small, color: "#7F1D1D" },

  cancelButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButtonText: { ...Typography.button, color: Colors.light.textSecondary },
});
