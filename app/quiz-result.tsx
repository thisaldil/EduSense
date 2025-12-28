import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { getQuizResults } from "@/services/lessons";

export default function QuizResultScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    correct?: string;
    total?: string;
    quiz_id?: string;
    lesson_id?: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(Number(params.score ?? 0));
  const [correct, setCorrect] = useState(Number(params.correct ?? 0));
  const [total, setTotal] = useState(Number(params.total ?? 10));

  // Fetch results from API if quiz_id is available
  useEffect(() => {
    const fetchResults = async () => {
      if (!params.quiz_id) {
        // Use params if no quiz_id
        return;
      }

      setIsLoading(true);
      try {
        const results = await getQuizResults(params.quiz_id);
        setScore(Math.round(results.score));
        setCorrect(results.correct_count);
        setTotal(results.total_questions);
      } catch (error: any) {
        console.error("Failed to fetch quiz results:", error);
        // Fall back to params if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [params.quiz_id]);

  const level = useMemo<"high" | "medium" | "low">(() => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  }, [score]);

  // Calculate cognitive load status (for now based on score, will come from model later)
  const cognitiveLoad = useMemo<"low" | "medium" | "high">(() => {
    // For now, inverse relationship: lower score = higher cognitive load
    // This will be replaced with actual model prediction
    if (score >= 80) return "low"; // High score = low cognitive load
    if (score >= 50) return "medium";
    return "high"; // Low score = high cognitive load
  }, [score]);

  const headline = useMemo(() => {
    if (level === "high") return "Great job! ✅";
    if (level === "medium") return "Nice work — almost there!";
    return "Keep going — you’re learning!";
  }, [level]);

  const subLabel = "Newton's First Law";

  const handleReview = () => {
    if (params.quiz_id) {
      router.push({
        pathname: "/quiz-review",
        params: {
          quiz_id: params.quiz_id,
          lesson_id: params.lesson_id,
        },
      });
    } else {
      Alert.alert("Error", "Quiz ID is missing.");
    }
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
          onPress: () => {
            router.replace({
              pathname: "/lesson-player",
              params: { lesson_id: params.lesson_id },
            });
          },
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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.deepBlue} />
              <Text style={styles.loadingText}>Loading results...</Text>
            </View>
          ) : (
            <>
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

              {/* Cognitive Load Status */}
              <View style={styles.feedbackCard}>
                <View style={styles.cognitiveLoadHeader}>
                  <Ionicons
                    name="pulse-outline"
                    size={20}
                    color={Colors.deepBlue}
                  />
                  <Text style={styles.sectionTitle}>Cognitive Load Status</Text>
                </View>
                <Text style={styles.cognitiveLoadDescription}>
                  Your current mental effort level while learning this concept
                </Text>

                <View style={styles.cognitiveLoadIndicator}>
                  <View
                    style={[
                      styles.cognitiveLoadBadge,
                      cognitiveLoad === "low" && styles.cognitiveLoadBadgeLow,
                      cognitiveLoad === "medium" &&
                        styles.cognitiveLoadBadgeMedium,
                      cognitiveLoad === "high" && styles.cognitiveLoadBadgeHigh,
                    ]}
                  >
                    <Ionicons
                      name={
                        cognitiveLoad === "low"
                          ? "checkmark-circle"
                          : cognitiveLoad === "medium"
                          ? "alert-circle"
                          : "warning"
                      }
                      size={24}
                      color={
                        cognitiveLoad === "low"
                          ? "#22C55E"
                          : cognitiveLoad === "medium"
                          ? "#F59E0B"
                          : "#EF4444"
                      }
                    />
                    <Text
                      style={[
                        styles.cognitiveLoadText,
                        cognitiveLoad === "low" && styles.cognitiveLoadTextLow,
                        cognitiveLoad === "medium" &&
                          styles.cognitiveLoadTextMedium,
                        cognitiveLoad === "high" &&
                          styles.cognitiveLoadTextHigh,
                      ]}
                    >
                      {cognitiveLoad === "low"
                        ? "Low"
                        : cognitiveLoad === "medium"
                        ? "Medium"
                        : "High"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cognitiveLoadInfo}>
                  <Text style={styles.cognitiveLoadInfoText}>
                    {cognitiveLoad === "low"
                      ? "You're processing this material comfortably. Great job! 🎉"
                      : cognitiveLoad === "medium"
                      ? "You're putting in moderate effort. Keep practicing! 💪"
                      : "This concept is challenging. Take breaks and review more. 📚"}
                  </Text>
                </View>
              </View>

              {/* Suggested actions */}
              <View style={styles.actionsCard}>
                <Text style={styles.sectionTitle}>
                  What would you like to do?
                </Text>
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
            </>
          )}
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
    gap: 12,
  },
  cognitiveLoadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  cognitiveLoadDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  cognitiveLoadIndicator: {
    alignItems: "center",
    marginVertical: 4,
  },
  cognitiveLoadBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 140,
    justifyContent: "center",
  },
  cognitiveLoadBadgeLow: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  cognitiveLoadBadgeMedium: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  cognitiveLoadBadgeHigh: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  cognitiveLoadText: {
    ...Typography.bodyMedium,
    fontSize: 18,
    fontWeight: "600",
  },
  cognitiveLoadTextLow: {
    color: "#22C55E",
  },
  cognitiveLoadTextMedium: {
    color: "#F59E0B",
  },
  cognitiveLoadTextHigh: {
    color: "#EF4444",
  },
  cognitiveLoadInfo: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  cognitiveLoadInfoText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    textAlign: "center",
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});
