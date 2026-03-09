import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { type CognitiveTheme, Typography } from "@/constants/theme";
import { useCognitiveTheme } from "@/hooks/use-cognitive-theme";

const WEEKLY_ACTIVITY = [2, 4, 3, 5, 1, 4, 6]; // example sessions per day

export default function ProgressScreen() {
  const { theme: cognitiveTheme } = useCognitiveTheme();
  const styles = useMemo(() => createStyles(cognitiveTheme), [cognitiveTheme]);

  const subjectProgress = useMemo(
    () => [
      { label: "Physics", value: 0.72, color: cognitiveTheme.brand.primary },
      { label: "Chemistry", value: 0.54, color: cognitiveTheme.brand.accent },
      { label: "Biology", value: 0.63, color: cognitiveTheme.brand.secondary },
      { label: "Math", value: 0.41, color: "#8B5CF6" },
    ],
    [cognitiveTheme],
  );

  const achievements = useMemo(
    () => [
      {
        id: "1",
        title: "5-Day Streak",
        description: "You stayed consistent for 5 days in a row.",
        icon: "flame",
        color: "#F97316",
      },
      {
        id: "2",
        title: "Concept Master",
        description: "10 concepts mastered with multisensory drills.",
        icon: "ribbon",
        color: cognitiveTheme.brand.primary,
      },
      {
        id: "3",
        title: "Focused Learner",
        description: "60+ minutes of focused learning this week.",
        icon: "timer",
        color: cognitiveTheme.brand.secondary,
      },
    ],
    [cognitiveTheme],
  );

  const totalLessons = 28;
  const totalMinutes = 420;
  const conceptsMastered = 16;

  const maxActivity = Math.max(...WEEKLY_ACTIVITY);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Your Progress</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={10}
            style={styles.headerIconButton}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={cognitiveTheme.brand.primary}
            />
          </Pressable>
        </View>

        {/* Weekly Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <View style={styles.streakIconCircle}>
              <Ionicons name="flame" size={22} color="#FDBA74" />
            </View>
            <View>
              <Text style={styles.streakLabel}>Weekly streak</Text>
              <Text style={styles.streakValue}>5 days 🔥</Text>
            </View>
          </View>
          <Text style={styles.streakMessage}>
            One more day to reach your best streak.
          </Text>
        </View>

        {/* Overview + Charts */}
        <View style={styles.overviewRow}>
          {/* Circular summary */}
          <View style={styles.circleCard}>
            <View style={styles.circleOuter}>
              <View style={styles.circleMiddle}>
                <View style={styles.circleInner}>
                  <Text style={styles.circleNumber}>{totalLessons}</Text>
                  <Text style={styles.circleLabel}>Lessons</Text>
                </View>
              </View>
            </View>
            <View style={styles.circleStatsRow}>
              <View style={styles.circleStat}>
                <View
                  style={[
                    styles.circleDot,
                    { backgroundColor: cognitiveTheme.brand.primary },
                  ]}
                />
                <View>
                  <Text style={styles.circleStatLabel}>Time learned</Text>
                  <Text style={styles.circleStatValue}>
                    {Math.round(totalMinutes / 60)} hrs
                  </Text>
                </View>
              </View>
              <View style={styles.circleStat}>
                <View
                  style={[
                    styles.circleDot,
                    { backgroundColor: cognitiveTheme.brand.secondary },
                  ]}
                />
                <View>
                  <Text style={styles.circleStatLabel}>Concepts</Text>
                  <Text style={styles.circleStatValue}>
                    {conceptsMastered} mastered
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly Activity Line Chart (stylized) */}
          <View style={styles.lineChartCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleSmall}>Last 7 days</Text>
              <Text style={styles.sectionChip}>Activity</Text>
            </View>
            <View style={styles.lineChart}>
              {WEEKLY_ACTIVITY.map((value, index) => {
                const heightPercent = (value / maxActivity) * 100;
                return (
                  <View key={index} style={styles.lineChartItem}>
                    <View style={styles.lineTrack}>
                      <View
                        style={[
                          styles.lineFill,
                          { height: `${heightPercent}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.lineDayLabel}>
                      {["M", "T", "W", "T", "F", "S", "S"][index]}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.lineChartCaption}>
              You completed {totalLessons} lessons this week. Amazing focus!
            </Text>
          </View>
        </View>

        {/* Learning Style Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Learning style breakdown</Text>
          </View>
          <View style={styles.breakdownRow}>
            <View style={styles.pieWrapper}>
              <View style={styles.pieBase} />
              <View style={[styles.pieSlice, styles.pieSliceVisual]} />
              <View style={[styles.pieSlice, styles.pieSliceAudio]} />
              <View style={styles.pieCenter}>
                <Text style={styles.pieCenterLabel}>Balanced</Text>
                <Text style={styles.pieCenterValue}>You use all three</Text>
              </View>
            </View>
            <View style={styles.breakdownLegend}>
              <View style={styles.breakdownLegendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: cognitiveTheme.brand.primary },
                  ]}
                />
                <Text style={styles.legendLabel}>Visual · 40%</Text>
              </View>
              <View style={styles.breakdownLegendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: cognitiveTheme.brand.accent },
                  ]}
                />
                <Text style={styles.legendLabel}>Audio · 35%</Text>
              </View>
              <View style={styles.breakdownLegendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: cognitiveTheme.brand.secondary },
                  ]}
                />
                <Text style={styles.legendLabel}>Haptic · 25%</Text>
              </View>
              <Text style={styles.breakdownCaption}>
                Mixing styles helps your brain build stronger connections.
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent achievements</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsRow}
          >
            {achievements.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <View
                  style={[
                    styles.badgeIconCircle,
                    { backgroundColor: `${badge.color}20` },
                  ]}
                >
                  <Ionicons
                    name={badge.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={badge.color}
                  />
                </View>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Subjects Progress */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Subjects progress</Text>
          </View>
          <View style={styles.subjectsList}>
            {subjectProgress.map((subject) => (
              <View key={subject.label} style={styles.subjectRow}>
                <View style={styles.subjectLabelRow}>
                  <Text style={styles.subjectLabel}>{subject.label}</Text>
                  <Text style={styles.subjectPercent}>
                    {Math.round(subject.value * 100)}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${subject.value * 100}%`,
                        backgroundColor: subject.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Share Button */}
        <Pressable style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share your progress</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: CognitiveTheme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.semantic.backgroundSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.semantic.background,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  headerTitle: {
    ...Typography.h3,
    color: theme.semantic.text,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: theme.semantic.textSecondary,
    marginTop: 2,
    maxWidth: 260,
  },
  streakCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.semantic.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  streakLabel: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  streakValue: {
    ...Typography.bodyMedium,
    color: theme.semantic.text,
  },
  streakMessage: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
    flex: 1,
    textAlign: "right",
  },
  overviewRow: {
    flexDirection: "row",
    gap: 12,
  },
  circleCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.semantic.background,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  circleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: `${theme.brand.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  circleMiddle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 8,
    borderColor: `${theme.brand.secondary}40`,
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.semantic.background,
    alignItems: "center",
    justifyContent: "center",
  },
  circleNumber: {
    ...Typography.h2,
    color: theme.brand.primary,
  },
  circleLabel: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  circleStatsRow: {
    width: "100%",
    gap: 8,
  },
  circleStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  circleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  circleStatLabel: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  circleStatValue: {
    ...Typography.small,
    color: theme.semantic.text,
  },
  lineChartCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.semantic.background,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: theme.semantic.text,
  },
  sectionTitleSmall: {
    ...Typography.small,
    color: theme.semantic.text,
  },
  sectionChip: {
    ...Typography.small,
    color: theme.brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: `${theme.brand.primary}10`,
  },
  lineChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 6,
  },
  lineChartItem: {
    alignItems: "center",
    flex: 1,
  },
  lineTrack: {
    width: 10,
    height: 72,
    borderRadius: 999,
    backgroundColor: theme.semantic.backgroundSecondary,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  lineFill: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: theme.brand.secondary,
  },
  lineDayLabel: {
    ...Typography.small,
    fontSize: 10,
    color: theme.semantic.textSecondary,
    marginTop: 4,
  },
  lineChartCaption: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.semantic.background,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  pieWrapper: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  pieBase: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 65,
    backgroundColor: theme.semantic.backgroundSecondary,
  },
  pieSlice: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 65,
  },
  pieSliceVisual: {
    borderTopWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 18,
    borderLeftWidth: 18,
    borderColor: "transparent",
    borderTopColor: theme.brand.primary,
    transform: [{ rotate: "-20deg" }],
  },
  pieSliceAudio: {
    borderTopWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 18,
    borderLeftWidth: 18,
    borderColor: "transparent",
    borderRightColor: theme.brand.accent,
    transform: [{ rotate: "70deg" }],
  },
  pieCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.semantic.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  pieCenterLabel: {
    ...Typography.small,
    fontSize: 11,
    color: theme.semantic.text,
  },
  pieCenterValue: {
    ...Typography.small,
    fontSize: 10,
    color: theme.semantic.textSecondary,
    textAlign: "center",
  },
  breakdownLegend: {
    flex: 1,
    gap: 6,
  },
  breakdownLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    ...Typography.small,
    color: theme.semantic.text,
  },
  breakdownCaption: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
    marginTop: 4,
  },
  achievementsRow: {
    flexDirection: "row",
    gap: 12,
  },
  badgeCard: {
    width: 180,
    borderRadius: 16,
    padding: 12,
    backgroundColor: theme.semantic.backgroundSecondary,
  },
  badgeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  badgeTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: theme.semantic.text,
    marginBottom: 4,
  },
  badgeDescription: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  subjectsList: {
    gap: 10,
  },
  subjectRow: {
    gap: 4,
  },
  subjectLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectLabel: {
    ...Typography.small,
    color: theme.semantic.text,
  },
  subjectPercent: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.semantic.backgroundSecondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  shareButton: {
    marginTop: 4,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  shareButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
});
