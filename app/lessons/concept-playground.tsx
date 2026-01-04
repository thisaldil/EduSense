import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

type Level = 0 | 1 | 2 | 3 | 4;

const LEVEL_LABELS = ["Very low", "Low", "Medium", "High", "Very high"];

type ControlId = "gravity" | "mass" | "height";

const CONTROL_META: Record<
  ControlId,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  gravity: { label: "Gravity strength", icon: "earth" },
  mass: { label: "Object mass", icon: "bandage-outline" },
  height: { label: "Drop height", icon: "trending-up" },
};

function clampLevel(value: number): Level {
  return Math.min(4, Math.max(0, Math.round(value))) as Level;
}

function useSimulation(gravity: Level, mass: Level, height: Level) {
  return useMemo(() => {
    const fallScore = gravity * 0.5 + height * 0.4 - mass * 0.2;
    const vibrationScore = gravity * 0.4 + mass * 0.4 + height * 0.2;
    const pitchScore = gravity * 0.5 + height * 0.4 - mass * 0.1;

    const fallIndex = clampLevel(fallScore);
    const vibrationIndex = clampLevel(vibrationScore);
    const pitchIndex = clampLevel(pitchScore);

    const fallText =
      fallIndex <= 1
        ? "Very slow fall"
        : fallIndex === 2
        ? "Steady fall"
        : fallIndex === 3
        ? "Fast fall"
        : "Very fast fall";

    const vibrationText =
      vibrationIndex <= 1
        ? "Gentle vibration"
        : vibrationIndex === 2
        ? "Noticeable vibration"
        : vibrationIndex === 3
        ? "Strong vibration"
        : "Very strong vibration";

    const pitchText =
      pitchIndex <= 1
        ? "Low, soft sound"
        : pitchIndex === 2
        ? "Medium pitch"
        : pitchIndex === 3
        ? "Bright sound"
        : "Very high pitch";

    return {
      fallIndex,
      vibrationIndex,
      pitchIndex,
      fallText,
      vibrationText,
      pitchText,
    };
  }, [gravity, mass, height]);
}

type LevelSelectorProps = {
  id: ControlId;
  value: Level;
  onChange: (id: ControlId, level: Level) => void;
};

function LevelSelector({ id, value, onChange }: LevelSelectorProps) {
  const meta = CONTROL_META[id];

  const handlePress = async (next: Level) => {
    onChange(id, next);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore haptics error
    }
  };

  return (
    <View style={styles.controlBlock}>
      <View style={styles.controlHeader}>
        <View style={styles.controlLabelRow}>
          <View style={styles.controlIconCircle}>
            <Ionicons name={meta.icon} size={18} color={Colors.light.tint} />
          </View>
          <Text style={styles.controlLabel}>{meta.label}</Text>
        </View>
        <Text style={styles.controlValue}>{LEVEL_LABELS[value]}</Text>
      </View>

      <View style={styles.sliderTrack}>
        {(Array.from({ length: 5 }) as unknown[]).map((_, index) => {
          const level = index as Level;
          const isActive = level <= value;
          return (
            <Pressable
              key={level}
              style={({ pressed }) => [
                styles.sliderDotWrapper,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => handlePress(level)}
            >
              <View
                style={[styles.sliderDot, isActive && styles.sliderDotActive]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ConceptPlaygroundScreen() {
  const [gravity, setGravity] = useState<Level>(2);
  const [mass, setMass] = useState<Level>(2);
  const [height, setHeight] = useState<Level>(2);

  const { fallText, vibrationText, pitchText, fallIndex, vibrationIndex } =
    useSimulation(gravity, mass, height);

  const handleChange = (id: ControlId, level: Level) => {
    if (id === "gravity") setGravity(level);
    if (id === "mass") setMass(level);
    if (id === "height") setHeight(level);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable
              style={styles.iconCircle}
              onPress={() => router.back()}
              hitSlop={10}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={Colors.light.text}
              />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Concept Playground</Text>
              <Text style={styles.headerSubtitle}>
                Try learning by playing with ideas.
              </Text>
            </View>
            <View style={styles.iconCircle} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIconCircle}>
                <Ionicons
                  name="puzzle-outline"
                  size={22}
                  color={Colors.light.tint}
                />
              </View>
              <View>
                <Text style={styles.overviewTitle}>🎮 Concept Playground</Text>
                <Text style={styles.overviewSubtitle}>
                  After assessment, use playful activities to strengthen
                  understanding without more tests.
                </Text>
              </View>
            </View>

            <View style={styles.activityList}>
              <Text style={styles.activityItemPrimary}>
                🔄 What happens if...?
              </Text>
              <Text style={styles.activityItem}>🧩 Match the concept</Text>
              <Text style={styles.activityItem}>🔮 Predict the outcome</Text>
            </View>
          </View>

          {/* Activity 1: What happens if...? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Activity 1: What happens if...?
            </Text>
            <Text style={styles.sectionBody}>
              Explore gravity by changing real-world conditions. Adjust the
              sliders and see how the experience changes.
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controlsCard}>
            <View style={styles.controlsHeaderRow}>
              <Text style={styles.controlsTitle}>Adjust conditions</Text>
              <Pressable
                style={styles.resetButton}
                onPress={() => {
                  setGravity(2);
                  setMass(2);
                  setHeight(2);
                }}
                hitSlop={8}
              >
                <Ionicons name="refresh" size={16} color={Colors.light.tint} />
                <Text style={styles.resetText}>Reset values</Text>
              </Pressable>
            </View>

            <LevelSelector
              id="gravity"
              value={gravity}
              onChange={handleChange}
            />
            <LevelSelector id="mass" value={mass} onChange={handleChange} />
            <LevelSelector id="height" value={height} onChange={handleChange} />
          </View>

          {/* Outcomes */}
          <View style={styles.outcomesCard}>
            <Text style={styles.outcomesTitle}>
              What your senses would feel
            </Text>

            <View style={styles.outcomeRow}>
              <View style={styles.outcomeLabelRow}>
                <Ionicons
                  name="flash-outline"
                  size={18}
                  color={Colors.light.tint}
                />
                <Text style={styles.outcomeLabel}>Fall speed</Text>
              </View>
              <View style={styles.outcomeMeterRow}>
                <View style={styles.outcomeMeterTrack}>
                  <View
                    style={[
                      styles.outcomeMeterFill,
                      { width: `${(fallIndex / 4) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.outcomeText}>{fallText}</Text>
              </View>
            </View>

            <View style={styles.outcomeRow}>
              <View style={styles.outcomeLabelRow}>
                <Ionicons
                  name="vibration"
                  size={18}
                  color={Colors.light.tint}
                />
                <Text style={styles.outcomeLabel}>Vibration strength</Text>
              </View>
              <View style={styles.outcomeMeterRow}>
                <View style={styles.outcomeMeterTrack}>
                  <View
                    style={[
                      styles.outcomeMeterFillSecondary,
                      { width: `${(vibrationIndex / 4) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.outcomeText}>{vibrationText}</Text>
              </View>
            </View>

            <View style={styles.outcomeRow}>
              <View style={styles.outcomeLabelRow}>
                <Ionicons
                  name="volume-high-outline"
                  size={18}
                  color={Colors.light.tint}
                />
                <Text style={styles.outcomeLabel}>Sound pitch</Text>
              </View>
              <Text style={styles.outcomeText}>{pitchText}</Text>
            </View>

            <View style={styles.noteCard}>
              <Ionicons
                name="bulb-outline"
                size={18}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.noteText}>
                Focus on how the{" "}
                <Text style={styles.noteHighlight}>pattern</Text> changes when
                you move the sliders — this builds understanding, not
                memorization.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  headerTextBlock: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  overviewCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  overviewHeader: {
    flexDirection: "row",
    gap: 10,
  },
  overviewIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  overviewTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  overviewSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  activityList: {
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  activityItemPrimary: {
    ...Typography.caption,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  activityItem: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  sectionBody: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  controlsCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  controlsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlsTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  resetText: {
    ...Typography.caption,
    color: Colors.light.tint,
  },
  controlBlock: {
    gap: 8,
  },
  controlHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  controlLabel: {
    ...Typography.body,
    color: Colors.light.text,
  },
  controlValue: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  sliderTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  sliderDotWrapper: {
    flex: 1,
    alignItems: "center",
  },
  sliderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  sliderDotActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + "1A",
  },
  outcomesCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  outcomesTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  outcomeRow: {
    gap: 6,
  },
  outcomeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  outcomeLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  outcomeMeterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  outcomeMeterTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
    overflow: "hidden",
  },
  outcomeMeterFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
  },
  outcomeMeterFillSecondary: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  outcomeText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },
  noteCard: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  noteText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  noteHighlight: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
