import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { getActivities, getLessonActivities } from "@/services/lessons";
import type {
  Activity,
  CognitiveLoad,
  FillBlankActivity,
  MatchingActivity,
  McqActivity,
  TrueFalseActivity,
} from "@/types/activities";
import {
  inferCognitiveLoadFromScore,
  suggestActivitiesByCognitiveLoad,
} from "@/types/activities";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFeedbackMessage(
  activity: Activity,
  scorePercent: number
): string | null {
  const feedback = activity.feedback;
  if (!feedback) return null;
  if (scorePercent >= 100 && feedback.all_correct) return feedback.all_correct;
  if (scorePercent >= 50 && feedback.partial) return feedback.partial;
  if (feedback.low_score) return feedback.low_score;
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Activity list (suggested by cognitive load)
// ---------------------------------------------------------------------------

type ViewMode = "list" | "activity" | "result";

export default function ConceptPlaygroundScreen() {
  const params = useLocalSearchParams<{
    lesson_id?: string;
    cognitive_load?: string;
    activity_type?: string;
  }>();
  const lessonId = params.lesson_id ?? null;
  const initialCognitiveLoad = (params.cognitive_load?.toUpperCase() ?? null) as
    | CognitiveLoad
    | null;
  const initialActivityType = (params.activity_type?.toUpperCase() ?? null) as
    | "TRUE_FALSE"
    | "MCQ"
    | "MATCHING"
    | "FILL_BLANK_WORD_BANK"
    | null;

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inferredCognitiveLoad, setInferredCognitiveLoad] =
    useState<CognitiveLoad | null>(initialCognitiveLoad);
  const [filterCognitiveLoad, setFilterCognitiveLoad] = useState<CognitiveLoad | null>(
    initialCognitiveLoad
  );
  const [filterActivityType, setFilterActivityType] = useState<
    "TRUE_FALSE" | "MCQ" | "MATCHING" | "FILL_BLANK_WORD_BANK" | null
  >(initialActivityType);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [lastScorePercent, setLastScorePercent] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const load = filterCognitiveLoad ?? undefined;
      const type = filterActivityType ?? undefined;
      const list = lessonId
        ? await getLessonActivities(lessonId, { cognitive_load: load, activity_type: type })
        : await getActivities(
            load || type ? { cognitive_load: load, activity_type: type } : undefined
          );
      setActivities(list ?? []);
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to load activities";
      setLoadError(message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId, filterCognitiveLoad, filterActivityType]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const suggestedActivities = useMemo(() => {
    if (inferredCognitiveLoad && !filterCognitiveLoad) {
      return suggestActivitiesByCognitiveLoad(
        activities,
        inferredCognitiveLoad,
        { includeAdjacent: true }
      );
    }
    return activities;
  }, [activities, inferredCognitiveLoad, filterCognitiveLoad]);

  const handleStartActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setViewMode("activity");
  };

  const handleActivityComplete = (scorePercent: number) => {
    const load = inferCognitiveLoadFromScore(scorePercent);
    setInferredCognitiveLoad(load);
    setFilterCognitiveLoad(load);
    setLastScorePercent(scorePercent);
    const activity = selectedActivity;
    setLastFeedback(
      activity ? getFeedbackMessage(activity, scorePercent) : null
    );
    setViewMode("result");
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
    setViewMode("list");
    setLastScorePercent(null);
    setLastFeedback(null);
  };

  const handlePickAnother = () => {
    setSelectedActivity(null);
    setLastScorePercent(null);
    setLastFeedback(null);
    setViewMode("list");
  };

  if (viewMode === "result" && lastScorePercent !== null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <View style={styles.header}>
            <View style={styles.appBar}>
              <Pressable style={styles.iconCircle} onPress={handleBackToList} hitSlop={10}>
                <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
              </Pressable>
              <View style={styles.headerTextBlock}>
                <Text style={styles.headerTitle}>Activity complete</Text>
                <Text style={styles.headerSubtitle}>
                  Cognitive load: {inferredCognitiveLoad ?? "—"}
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
            <View style={styles.resultCard}>
              <Text style={styles.resultScore}>
                {Math.round(lastScorePercent)}%
              </Text>
              <Text style={styles.resultLabel}>Score</Text>
              <View style={styles.cognitiveBadge}>
                <Text style={styles.cognitiveBadgeText}>
                  Inferred cognitive load: {inferredCognitiveLoad ?? "—"}
                </Text>
              </View>
              {lastFeedback ? (
                <Text style={styles.resultFeedback}>{lastFeedback}</Text>
              ) : null}
              <Text style={styles.suggestionTitle}>
                Suggested next activities (for your current load)
              </Text>
              <View style={styles.resultActions}>
                <Pressable
                  style={styles.primaryButton}
                  onPress={handlePickAnother}
                >
                  <Text style={styles.primaryButtonText}>
                    Pick another activity
                  </Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={handleBackToList}>
                  <Text style={styles.secondaryButtonText}>Back to list</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (viewMode === "activity" && selectedActivity) {
    return (
      <ActivityRunner
        activity={selectedActivity}
        onComplete={handleActivityComplete}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable style={styles.iconCircle} onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Concept Playground</Text>
              <Text style={styles.headerSubtitle}>
                {lessonId
                  ? filterCognitiveLoad || filterActivityType
                    ? "Filtered"
                    : "Activities for this lesson"
                  : filterCognitiveLoad || filterActivityType
                  ? "Filtered"
                  : "All activities"}
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
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIconCircle}>
                <Ionicons
                  name="apps-outline"
                  size={22}
                  color={Colors.light.tint}
                />
              </View>
              <View>
                <Text style={styles.overviewTitle}>
                  {lessonId ? "Activities for this lesson" : "Activities"}
                </Text>
                <Text style={styles.overviewSubtitle}>
                  {lessonId
                    ? "Activities suggested for this lesson based on your level."
                    : "Activities suggested for you. Complete an activity to refine suggestions."}
                </Text>
              </View>
            </View>
          </View>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.light.tint} />
              <Text style={styles.loadingText}>Loading activities…</Text>
            </View>
          ) : loadError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={32} color={Colors.light.textSecondary} />
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable style={styles.primaryButton} onPress={fetchActivities}>
                <Text style={styles.primaryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : suggestedActivities.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No activities available.</Text>
            </View>
          ) : (
            suggestedActivities.map((activity, index) => (
              <Pressable
                key={activity.id ?? `${activity.title}-${index}`}
                style={styles.activityCard}
                onPress={() => handleStartActivity(activity)}
              >
                <View style={styles.activityCardHeader}>
                  <Text style={styles.activityCardTitle}>{activity.title}</Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityMetaText}>
                      {activity.activity_type.replace(/_/g, " ")} •{" "}
                      {activity.cognitive_load} load
                    </Text>
                    <Text style={styles.activityMetaText}>
                      ~{activity.estimated_time} min • {activity.points} pts
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Activity runner (dispatches by type)
// ---------------------------------------------------------------------------

function ActivityRunner({
  activity,
  onComplete,
  onBack,
}: {
  activity: Activity;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}) {
  if (activity.activity_type === "TRUE_FALSE") {
    return (
      <TrueFalseRunner
        activity={activity}
        onComplete={onComplete}
        onBack={onBack}
      />
    );
  }
  if (activity.activity_type === "MCQ") {
    return (
      <McqRunner activity={activity} onComplete={onComplete} onBack={onBack} />
    );
  }
  if (activity.activity_type === "MATCHING") {
    return (
      <MatchingRunner
        activity={activity}
        onComplete={onComplete}
        onBack={onBack}
      />
    );
  }
  if (activity.activity_type === "FILL_BLANK_WORD_BANK") {
    return (
      <FillBlankRunner
        activity={activity}
        onComplete={onComplete}
        onBack={onBack}
      />
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// TRUE_FALSE
// ---------------------------------------------------------------------------

function TrueFalseRunner({
  activity,
  onComplete,
  onBack,
}: {
  activity: TrueFalseActivity;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    activity.items.map(() => null)
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const item = activity.items[index];
  const currentAnswer = answers[index];
  const isLast = index === activity.items.length - 1;

  const handleAnswer = (value: boolean) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLast) {
      const correct = answers.filter(
        (a, i) => a === activity.items[i].correct_answer
      ).length;
      const total = activity.items.length;
      onComplete((correct / total) * 100);
      return;
    }
    setIndex((i) => i + 1);
    setShowExplanation(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable style={styles.iconCircle} onPress={onBack} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>{activity.title}</Text>
              <Text style={styles.headerSubtitle}>
                Question {index + 1} of {activity.items.length}
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
          <Text style={styles.instructions}>{activity.instructions}</Text>
          <View style={styles.questionCard}>
            <Text style={styles.statement}>{item.statement}</Text>
            {!showExplanation ? (
              <View style={styles.tfButtons}>
                <Pressable
                  style={[
                    styles.tfButton,
                    currentAnswer === true && styles.tfButtonSelected,
                  ]}
                  onPress={() => handleAnswer(true)}
                >
                  <Text style={styles.tfButtonText}>True</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.tfButton,
                    currentAnswer === false && styles.tfButtonSelected,
                  ]}
                  onPress={() => handleAnswer(false)}
                >
                  <Text style={styles.tfButtonText}>False</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>Explanation</Text>
                  <Text style={styles.explanationText}>{item.explanation}</Text>
                  <Text style={styles.correctAnswerText}>
                    Correct: {item.correct_answer ? "True" : "False"}
                  </Text>
                </View>
                <Pressable style={styles.primaryButton} onPress={handleNext}>
                  <Text style={styles.primaryButtonText}>
                    {isLast ? "Finish" : "Next"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// MCQ
// ---------------------------------------------------------------------------

function McqRunner({
  activity,
  onComplete,
  onBack,
}: {
  activity: McqActivity;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const item = activity.items[index];
  const isLast = index === activity.items.length - 1;
  const correctIndices: number[] = [];
  activity.items.forEach((q, i) => {
    correctIndices[i] = q.options.indexOf(q.correct_answer);
  });
  const [answers, setAnswers] = useState<(number | null)[]>(
    activity.items.map(() => null)
  );

  const handleSelect = (option: string) => {
    if (showExplanation) return;
    setSelected(option);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    const optionIndex = item.options.indexOf(selected);
    const next = [...answers];
    next[index] = optionIndex;
    setAnswers(next);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLast) {
      let correct = 0;
      activity.items.forEach((q, i) => {
        if (answers[i] === q.options.indexOf(q.correct_answer)) correct++;
      });
      onComplete((correct / activity.items.length) * 100);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowExplanation(false);
    setShowHint(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable style={styles.iconCircle} onPress={onBack} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>{activity.title}</Text>
              <Text style={styles.headerSubtitle}>
                Question {index + 1} of {activity.items.length}
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
          <Text style={styles.instructions}>{activity.instructions}</Text>
          <View style={styles.questionCard}>
            <Text style={styles.statement}>{item.question}</Text>
            {item.hint && (
              <Pressable
                style={styles.hintButton}
                onPress={() => setShowHint(!showHint)}
              >
                <Ionicons name="bulb-outline" size={16} color={Colors.light.tint} />
                <Text style={styles.hintButtonText}>Hint</Text>
              </Pressable>
            )}
            {showHint && item.hint && (
              <Text style={styles.hintText}>{item.hint}</Text>
            )}
            <View style={styles.optionsList}>
              {item.options.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionButton,
                    selected === opt && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelect(opt)}
                >
                  <Text style={styles.optionButtonText}>{opt}</Text>
                </Pressable>
              ))}
            </View>
            {!showExplanation ? (
              <Pressable
                style={[styles.primaryButton, !selected && styles.primaryButtonDisabled]}
                onPress={handleConfirm}
                disabled={!selected}
              >
                <Text style={styles.primaryButtonText}>Confirm</Text>
              </Pressable>
            ) : (
              <>
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>Explanation</Text>
                  <Text style={styles.explanationText}>
                    {item.explanation ?? `Correct: ${item.correct_answer}`}
                  </Text>
                </View>
                <Pressable style={styles.primaryButton} onPress={handleNext}>
                  <Text style={styles.primaryButtonText}>
                    {isLast ? "Finish" : "Next"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// MATCHING (each left item: dropdown of right items)
// ---------------------------------------------------------------------------

function MatchingRunner({
  activity,
  onComplete,
  onBack,
}: {
  activity: MatchingActivity;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}) {
  const rightItems = useMemo(
    () => shuffle(activity.items.map((i) => ({ ...i }))),
    [activity]
  );
  const [pairs, setPairs] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (leftId: number, pairId: string) => {
    if (submitted) return;
    setPairs((prev) => ({ ...prev, [leftId]: pairId }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    activity.items.forEach((left) => {
      if (pairs[left.id] === left.pair_id) correct++;
    });
    onComplete((correct / activity.items.length) * 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable style={styles.iconCircle} onPress={onBack} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>{activity.title}</Text>
              <Text style={styles.headerSubtitle}>{activity.instructions}</Text>
            </View>
            <View style={styles.iconCircle} />
          </View>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionCard}>
            {activity.items.map((left) => (
              <View key={left.id} style={styles.matchingRow}>
                <Text style={styles.matchingLeft} numberOfLines={2}>
                  {left.left_item}
                </Text>
                <View style={styles.matchingSelect}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {rightItems.map((r) => (
                      <Pressable
                        key={r.id}
                        style={[
                          styles.matchingOption,
                          pairs[left.id] === r.pair_id && styles.matchingOptionSelected,
                        ]}
                        onPress={() => handleSelect(left.id, r.pair_id)}
                      >
                        <Text
                          style={styles.matchingOptionText}
                          numberOfLines={2}
                        >
                          {r.right_item}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ))}
          </View>
          <Pressable
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={submitted || Object.keys(pairs).length < activity.items.length}
          >
            <Text style={styles.primaryButtonText}>Submit</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// FILL_BLANK_WORD_BANK
// ---------------------------------------------------------------------------

function FillBlankRunner({
  activity,
  onComplete,
  onBack,
}: {
  activity: FillBlankActivity;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    activity.items.map(() => null)
  );
  const [showHint, setShowHint] = useState(false);

  const item = activity.items[index];
  const currentAnswer = answers[index];
  const isLast = index === activity.items.length - 1;

  const normalizedAnswer = (a: string) => a.trim().toLowerCase();

  const handleWordSelect = (word: string) => {
    const next = [...answers];
    next[index] = word;
    setAnswers(next);
  };

  const handleNext = () => {
    if (isLast) {
      let correct = 0;
      activity.items.forEach((q, i) => {
        if (
          answers[i] !== null &&
          normalizedAnswer(answers[i]!) === normalizedAnswer(q.correct_answer)
        )
          correct++;
      });
      onComplete((correct / activity.items.length) * 100);
      return;
    }
    setIndex((i) => i + 1);
    setShowHint(false);
  };

  const usedByOther = answers.filter(
    (a, i) => i !== index && a !== null
  ) as string[];
  const wordBankAvailable = (activity.word_bank ?? []).filter(
    (w) => !usedByOther.includes(w)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable style={styles.iconCircle} onPress={onBack} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>{activity.title}</Text>
              <Text style={styles.headerSubtitle}>
                Blank {index + 1} of {activity.items.length}
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
          <Text style={styles.instructions}>{activity.instructions}</Text>
          <View style={styles.questionCard}>
            <Text style={styles.fillSentence}>{item.sentence}</Text>
            {item.hint && (
              <Pressable
                style={styles.hintButton}
                onPress={() => setShowHint(!showHint)}
              >
                <Ionicons name="bulb-outline" size={16} color={Colors.light.tint} />
                <Text style={styles.hintButtonText}>Hint</Text>
              </Pressable>
            )}
            {showHint && item.hint && (
              <Text style={styles.hintText}>{item.hint}</Text>
            )}
            <View style={styles.fillBlankAnswer}>
              <Text style={styles.fillBlankLabel}>Your answer: </Text>
              <Text style={styles.fillBlankValue}>
                {currentAnswer ?? "—"}
              </Text>
            </View>
            <Text style={styles.wordBankLabel}>Word bank</Text>
            <View style={styles.wordBank}>
              {wordBankAvailable.map((word) => (
                <Pressable
                  key={word}
                  style={[
                    styles.wordBankChip,
                    currentAnswer === word && styles.wordBankChipSelected,
                  ]}
                  onPress={() => handleWordSelect(word)}
                >
                  <Text style={styles.wordBankChipText}>{word}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.primaryButton, !currentAnswer && styles.primaryButtonDisabled]}
              onPress={handleNext}
              disabled={!currentAnswer}
            >
              <Text style={styles.primaryButtonText}>
                {isLast ? "Finish" : "Next"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
  loadingBox: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  errorBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  activityCardHeader: {
    flex: 1,
  },
  activityCardTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  activityMeta: {
    marginTop: 4,
    gap: 2,
  },
  activityMetaText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  resultCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.light.tint,
  },
  resultLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  cognitiveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  cognitiveBadgeText: {
    ...Typography.caption,
    color: Colors.light.text,
    fontWeight: "600",
  },
  resultFeedback: {
    ...Typography.body,
    color: Colors.light.text,
    textAlign: "center",
  },
  suggestionTitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  resultActions: {
    width: "100%",
    gap: 10,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...Typography.bodyMedium,
    color: "#FFF",
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...Typography.bodyMedium,
    color: Colors.light.tint,
  },
  instructions: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  questionCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 16,
    gap: 12,
  },
  statement: {
    ...Typography.body,
    color: Colors.light.text,
  },
  tfButtons: {
    flexDirection: "row",
    gap: 12,
  },
  tfButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
  },
  tfButtonSelected: {
    backgroundColor: Colors.light.tint + "20",
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  tfButtonText: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  explanationBox: {
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 12,
    gap: 6,
  },
  explanationLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  explanationText: {
    ...Typography.body,
    color: Colors.light.text,
  },
  correctAnswerText: {
    ...Typography.caption,
    color: Colors.light.tint,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  hintButtonText: {
    ...Typography.caption,
    color: Colors.light.tint,
  },
  hintText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + "15",
  },
  optionButtonText: {
    ...Typography.body,
    color: Colors.light.text,
  },
  matchingRow: {
    gap: 8,
    marginBottom: 12,
  },
  matchingLeft: {
    ...Typography.body,
    color: Colors.light.text,
  },
  matchingSelect: {
    flexDirection: "row",
  },
  matchingOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    marginRight: 8,
    maxWidth: 180,
    borderWidth: 2,
    borderColor: "transparent",
  },
  matchingOptionSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + "15",
  },
  matchingOptionText: {
    ...Typography.caption,
    color: Colors.light.text,
  },
  fillSentence: {
    ...Typography.body,
    color: Colors.light.text,
  },
  fillBlankAnswer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fillBlankLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  fillBlankValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: "600",
  },
  wordBankLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  wordBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  wordBankChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: "transparent",
  },
  wordBankChipSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + "15",
  },
  wordBankChipText: {
    ...Typography.caption,
    color: Colors.light.text,
  },
});
