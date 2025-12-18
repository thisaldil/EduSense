import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

export default function QuizResultScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    correct?: string;
    total?: string;
    results?: string;
  }>();

  const score = Number(params.score ?? 0);
  const correct = Number(params.correct ?? 0);
  const total = Number(params.total ?? 10);

  const level = useMemo<"high" | "medium" | "low">(() => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  }, [score]);

  const headline = useMemo(() => {
    if (level === "high") return "Great job! ✅";
    if (level === "medium") return "Nice work — almost there!";
    return "Keep going — you’re learning!";
  }, [level]);

  const subLabel = "Newton's First Law";

  const handleReview = () => {
    router.push({
      pathname: "/quiz-review",
      params: {
        results:
          typeof params.results === "string" ? params.results : undefined,
      },
    });
  };

  const handleReplay = () => {
    Alert.alert(
      "Replay lesson?",
      "If you continue, this lesson will start again from the beginning.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Replay",
          style: "default",
          onPress: () => router.replace("/lesson-player"),
        },
      ]
    );
  };

  const handleContinue = () => {
    router.push("/concept-playground");
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
              <Ionicons name="close" size={20} color={Colors.light.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Quiz completed</Text>
            <View style={styles.iconCircle} />
          </View>
        </View>

        {/* Main content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>🎉</Text>
            <Text style={styles.summaryTitle}>Quiz Completed!</Text>
            <Text style={styles.summarySubtitle}>{subLabel}</Text>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreMain}>
                {Number.isNaN(score) ? "--" : `${score}%`}
              </Text>
              <Text style={styles.scoreSub}>
                {Number.isNaN(correct) || Number.isNaN(total)
                  ? ""
                  : `${correct} / ${total}`}
              </Text>
            </View>

            <Text style={styles.headline}>{headline}</Text>
          </View>

          {/* Concept feedback */}
          <View style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>✔ Correct concepts</Text>
            <View style={styles.listBlock}>
              <Text style={styles.listItem}>• Inertia</Text>
              <Text style={styles.listItem}>• Net Force</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>✖ Needs review</Text>
            <View style={styles.listBlock}>
              <Text style={styles.listItem}>• Balanced Forces</Text>
            </View>
          </View>

          {/* Suggested actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>What would you like to do?</Text>
            <Pressable
              style={[
                styles.actionRow,
                level === "medium" && styles.actionRowPrimary,
              ]}
              onPress={handleReview}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons
                  name="refresh-circle"
                  size={22}
                  color={Colors.deepBlue}
                />
              </View>
              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>Review weak concepts</Text>
                <Text style={styles.actionBody}>
                  Revisit explanations for topics that need more practice.
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.light.textSecondary}
              />
            </Pressable>

            <Pressable
              style={[
                styles.actionRow,
                level === "low" && styles.actionRowPrimary,
              ]}
              onPress={handleReplay}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons
                  name="play-circle"
                  size={22}
                  color={Colors.deepBlue}
                />
              </View>
              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>Replay experience</Text>
                <Text style={styles.actionBody}>
                  Walk through the interactive lesson again from the start.
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.light.textSecondary}
              />
            </Pressable>

            <Pressable
              style={[
                styles.actionRow,
                level === "high" && styles.actionRowPrimary,
              ]}
              onPress={handleContinue}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={22}
                  color={Colors.deepBlue}
                />
              </View>
              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>Continue learning</Text>
                <Text style={styles.actionBody}>
                  Move on to the next lesson in your learning path.
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.light.textSecondary}
              />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 4,
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
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  summaryCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    alignItems: "center",
    gap: 6,
  },
  summaryEmoji: {
    fontSize: 30,
  },
  summaryTitle: {
    ...Typography.bodyMedium,
    fontSize: 18,
    color: Colors.light.text,
  },
  summarySubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  scoreCircle: {
    marginTop: 4,
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.deepBlue,
    backgroundColor: "rgba(19,164,236,0.06)",
  },
  scoreMain: {
    ...Typography.h2,
    fontSize: 26,
    color: Colors.deepBlue,
  },
  scoreSub: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  headline: {
    marginTop: 8,
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  feedbackCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 6,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  listBlock: {
    marginTop: 4,
    gap: 2,
  },
  listItem: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  actionsCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 10,
  },
  actionRow: {
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionRowPrimary: {
    backgroundColor: "rgba(19,164,236,0.06)",
    borderWidth: 1,
    borderColor: Colors.deepBlue,
  },
  actionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },
  actionTextBlock: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  actionBody: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
});
