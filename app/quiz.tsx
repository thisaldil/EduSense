import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { getQuiz, submitQuiz, Question } from "@/services/lessons";

type QuestionWithCorrect = Question & {
  correctIndex: number;
};

type Mode = "idle" | "correct" | "incorrect";

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    quiz_id?: string;
    lesson_id?: string;
  }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<
    {
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      selectedIndex: number | null;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.quiz_id) {
        Alert.alert("Error", "Quiz ID is missing.");
        router.back();
        return;
      }

      setIsLoading(true);
      try {
        const quiz = await getQuiz(params.quiz_id);
        setQuestions(quiz.questions);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load quiz.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [params.quiz_id]);

  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex]
  );

  const totalQuestions = questions.length;
  const questionNumber = currentIndex + 1;
  const progressPercent = Math.round((questionNumber / totalQuestions) * 100);

  const upsertAnswer = (nextSelectedIndex: number | null) => {
    const entry = {
      id: currentQuestion.id,
      question: currentQuestion.question,
      options: currentQuestion.options,
      correctIndex: -1, // Not available in student view, will be determined by API
      selectedIndex: nextSelectedIndex,
    };
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === entry.id);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = entry;
        return copy;
      }
      return [...prev, entry];
    });
    return entry;
  };

  const onSelectOption = (index: number) => {
    if (mode !== "idle") return;
    setSelectedIndex(index);
  };

  const onSubmit = () => {
    if (selectedIndex === null) return;
    // We don't know the correct answer until we submit, so just mark as answered
    setMode("correct"); // We'll show correct/incorrect after submission
    upsertAnswer(selectedIndex);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const onNext = async () => {
    const entry = upsertAnswer(selectedIndex);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setMode("idle");
    } else {
      // Submit all answers to API
      setIsSubmitting(true);
      try {
        if (!params.quiz_id) {
          throw new Error("Quiz ID is missing");
        }

        const allAnswers = (() => {
          const existing = answers.filter((a) => a.id !== entry.id);
          return [...existing, entry];
        })();

        const submission = await submitQuiz(params.quiz_id, {
          answers: allAnswers.map((a) => ({
            question_id: a.id,
            answer_index: a.selectedIndex!,
          })),
        });

        router.push({
          pathname: "/quiz-loading",
          params: {
            score: String(Math.round(submission.score)),
            correct: String(submission.correct_count),
            total: String(submission.total_questions),
            quiz_id: params.quiz_id,
            lesson_id: params.lesson_id,
          },
        });
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to submit quiz.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const onSkip = () => {
    onNext();
  };

  const questionTypeLabel =
    currentQuestion?.type === "multiple" ? "Multiple choice" : "True / False";

  const primaryLabel =
    mode === "idle"
      ? "Submit Answer"
      : currentIndex < totalQuestions - 1
      ? "Next Question"
      : "Finish Quiz";

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.deepBlue} />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No questions available</Text>
        </View>
      </SafeAreaView>
    );
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
              <Ionicons name="close" size={20} color={Colors.light.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Quiz</Text>
            <View style={styles.timerPill}>
              <Ionicons name="time-outline" size={14} color={Colors.deepBlue} />
              <Text style={styles.timerText}>45s</Text>
            </View>
          </View>

          <View style={styles.progressMetaRow}>
            <Text style={styles.progressMeta}>
              Question {questionNumber} of {totalQuestions}
            </Text>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Main content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionTypePill}>
            <Ionicons
              name="list-circle-outline"
              size={16}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.questionTypeText}>{questionTypeLabel}</Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsList}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              // Note: We don't show correct/incorrect until after submission
              // For now, just show selected state
              const isCorrect = false; // Will be determined after submission
              const isIncorrect = false; // Will be determined after submission

              let borderColor = "#E5E7EB";
              let backgroundColor = "#FFFFFF";
              let radioFill = "transparent";

              if (isSelected && mode === "idle") {
                borderColor = Colors.deepBlue;
                backgroundColor = "rgba(19,164,236,0.06)";
                radioFill = Colors.deepBlue;
              }
              if (isCorrect) {
                borderColor = "#22C55E";
                backgroundColor = "rgba(34,197,94,0.08)";
                radioFill = "#22C55E";
              } else if (isIncorrect) {
                borderColor = "#EF4444";
                backgroundColor = "rgba(239,68,68,0.08)";
                radioFill = "#EF4444";
              }

              return (
                <Animated.View
                  key={option}
                  style={[styles.optionCard, { borderColor, backgroundColor }]}
                >
                  <Pressable
                    style={styles.optionPressable}
                    onPress={() => onSelectOption(index)}
                  >
                    <View style={styles.radioOuter}>
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: radioFill },
                        ]}
                      />
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                    {isCorrect && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#22C55E"
                      />
                    )}
                    {isIncorrect && (
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Hint buttons */}
          <View style={styles.hintsRow}>
            <Pressable style={styles.hintButton}>
              <Ionicons
                name="eye-outline"
                size={16}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.hintText}>Visual hint</Text>
            </Pressable>
            <Pressable style={styles.hintButton}>
              <Ionicons
                name="volume-high-outline"
                size={16}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.hintText}>Audio hint</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Bottom actions */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.primaryButton,
              (selectedIndex === null && mode === "idle") || isSubmitting
                ? { opacity: 0.5 }
                : {},
            ]}
            onPress={mode === "idle" ? onSubmit : onNext}
            disabled={
              (selectedIndex === null && mode === "idle") || isSubmitting
            }
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
                <Ionicons
                  name={mode === "idle" ? "arrow-forward" : "arrow-redo"}
                  size={18}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>
          <Pressable style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Skip this question</Text>
          </Pressable>
        </View>
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
    paddingBottom: 8,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E0F2FE",
  },
  timerText: {
    ...Typography.small,
    fontSize: 12,
    color: Colors.deepBlue,
  },
  progressMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  progressMeta: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  progressPercentText: {
    ...Typography.small,
    color: Colors.deepBlue,
    fontWeight: "600",
  },
  progressTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.deepBlue,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  questionTypePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  questionTypeText: {
    ...Typography.small,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  questionText: {
    marginTop: 12,
    ...Typography.bodyMedium,
    fontSize: 20,
    color: Colors.light.text,
  },
  optionsList: {
    marginTop: 16,
    gap: 10,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  optionPressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent",
  },
  optionText: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
  },
  hintsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 16,
  },
  hintButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  hintText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    backgroundColor: "#F6F7F8",
  },
  primaryButton: {
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.deepBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  skipButton: {
    alignSelf: "center",
    paddingVertical: 6,
  },
  skipText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});
