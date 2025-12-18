import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

type ReviewItem = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
};

export default function QuizReviewScreen() {
  const params = useLocalSearchParams<{ results?: string }>();

  let items: ReviewItem[] = [];
  if (typeof params.results === "string") {
    try {
      const parsed = JSON.parse(params.results);
      if (Array.isArray(parsed)) {
        items = parsed;
      }
    } catch {
      // ignore parse errors, fall back to empty list
    }
  }

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
              <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Review your answers</Text>
              <Text style={styles.headerSubtitle}>
                Learn from each question and see the correct explanation.
              </Text>
            </View>
            <View style={styles.iconCircle} />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="information-circle-outline"
                size={32}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.emptyTitle}>No quiz data found</Text>
              <Text style={styles.emptyBody}>
                Take the quiz again to see a detailed review of your answers.
              </Text>
            </View>
          ) : (
            items.map((item, idx) => {
              const correctAnswer = item.options[item.correctIndex];
              const userAnswer =
                item.selectedIndex != null
                  ? item.options[item.selectedIndex]
                  : "Not answered";
              const wasCorrect =
                item.selectedIndex != null &&
                item.selectedIndex === item.correctIndex;

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.questionBadge}>
                      <Text style={styles.questionBadgeText}>
                        Q{idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.resultPill,
                        wasCorrect
                          ? styles.resultPillCorrect
                          : styles.resultPillIncorrect,
                      ]}
                    >
                      {wasCorrect ? "Correct" : "Needs review"}
                    </Text>
                  </View>

                  <Text style={styles.questionText}>{item.question}</Text>

                  <View style={styles.answersBlock}>
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Your answer</Text>
                      <Text
                        style={[
                          styles.answerValue,
                          !wasCorrect && styles.answerValueIncorrect,
                        ]}
                      >
                        {userAnswer}
                      </Text>
                    </View>
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Correct answer</Text>
                      <Text style={styles.answerValue}>{correctAnswer}</Text>
                    </View>
                  </View>

                  <View style={styles.explainerRow}>
                    <Ionicons
                      name="bulb-outline"
                      size={18}
                      color={Colors.deepBlue}
                    />
                    <Text style={styles.explainerText}>
                      Remember: focus on why the correct answer is right, not
                      just memorizing it. Try to explain this question in your
                      own words.
                    </Text>
                  </View>
                </View>
              );
            })
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
  headerTextBlock: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  headerSubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  questionBadgeText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  resultPill: {
    ...Typography.small,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  resultPillCorrect: {
    backgroundColor: "rgba(34,197,94,0.1)",
    color: "#16A34A",
  },
  resultPillIncorrect: {
    backgroundColor: "rgba(239,68,68,0.08)",
    color: "#B91C1C",
  },
  questionText: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
    marginTop: 4,
  },
  answersBlock: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  answerLabel: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  answerValue: {
    ...Typography.small,
    color: Colors.light.text,
    flex: 1,
    textAlign: "right",
  },
  answerValueIncorrect: {
    color: "#B91C1C",
  },
  explainerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  explainerText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  emptyState: {
    marginTop: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  emptyBody: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    textAlign: "center",
    maxWidth: 260,
  },
});


