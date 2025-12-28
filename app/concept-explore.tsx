import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { generateQuiz, getQuiz, Quiz } from "@/services/lessons";

type TabKey = "explanation" | "examples" | "related";

const TABS: { key: TabKey; label: string }[] = [
  { key: "explanation", label: "Explanation" },
  { key: "examples", label: "Examples" },
  { key: "related", label: "Related" },
];

const difficultyLevels = ["Simplify", "Balanced", "Advanced"] as const;
type Difficulty = (typeof difficultyLevels)[number];

export default function ConceptExploreScreen() {
  const params = useLocalSearchParams<{ lesson_id?: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("explanation");
  const [difficulty, setDifficulty] = useState<Difficulty>("Balanced");
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const conceptName = "Newton's First Law";
  const lessonId = params.lesson_id;

  const handleTestYourself = async () => {
    if (!lessonId) {
      Alert.alert(
        "Error",
        "Lesson ID is missing. Please go back and try again."
      );
      return;
    }

    setIsLoadingQuiz(true);
    try {
      // Try to generate quiz (this will create a new quiz or return existing one)
      const quiz = await generateQuiz({ lesson_id: lessonId });

      // Navigate to quiz screen with quiz data
      router.push({
        pathname: "/quiz",
        params: {
          quiz_id: quiz.id,
          lesson_id: lessonId,
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to generate quiz. Please try again."
      );
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "explanation":
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Core idea</Text>
            <Text style={styles.cardBody}>
              An object will stay at <Text style={styles.highlight}>rest</Text>{" "}
              or keep moving at a{" "}
              <Text style={styles.highlight}>constant velocity</Text> unless a{" "}
              <Text style={styles.highlight}>net external force</Text> acts on
              it. This is why you feel a jolt when a bus suddenly stops — your
              body wants to keep moving.
            </Text>
          </View>
        );
      case "examples":
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Real-world examples</Text>
            <View style={styles.examplesList}>
              <View style={styles.exampleItem}>
                <Image
                  source={require("@/assets/images/new-lesson-hero.png")}
                  style={styles.exampleImage}
                />
                <Text style={styles.exampleText}>
                  A book on a table stays still until someone pushes it.
                </Text>
              </View>
              <View style={styles.exampleItem}>
                <Image
                  source={require("@/assets/images/new-lesson-hero.png")}
                  style={styles.exampleImage}
                />
                <Text style={styles.exampleText}>
                  A skateboard keeps rolling until friction or a foot stops it.
                </Text>
              </View>
              <View style={styles.exampleItem}>
                <Image
                  source={require("@/assets/images/new-lesson-hero.png")}
                  style={styles.exampleImage}
                />
                <Text style={styles.exampleText}>
                  Passengers lean forward when a car brakes suddenly.
                </Text>
              </View>
            </View>
          </View>
        );
      case "related":
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connected concepts</Text>
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Inertia</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Net force</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Friction</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Newton's Second Law</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable
              style={styles.backButton}
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
              <Text style={styles.headerTitle}>{conceptName}</Text>
              <Text style={styles.headerSubtitle}>Explore the concept</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton} hitSlop={10}>
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={Colors.light.textSecondary}
                />
              </Pressable>
              <Pressable style={styles.iconButton} hitSlop={10}>
                <Ionicons
                  name="bookmark-outline"
                  size={20}
                  color={Colors.light.textSecondary}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Tabs + content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <Pressable
                  key={tab.key}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text
                    style={[styles.tabLabel, active && styles.tabLabelActive]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Main tab content */}
          {renderTabContent()}

          {/* Experience It */}
          <View style={styles.experienceCard}>
            <View style={styles.experienceTextBlock}>
              <Text style={styles.experienceTitle}>Experience it</Text>
              <Text style={styles.experienceBody}>
                Trigger a short haptic, audio, and visual demo to feel how
                Newton&apos;s First Law behaves in motion.
              </Text>
            </View>
            <Pressable style={styles.experienceButton}>
              <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
              <Text style={styles.experienceButtonText}>Play demo</Text>
            </Pressable>
          </View>

          {/* Difficulty slider */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Difficulty</Text>
            <Text style={styles.cardBody}>
              Adjust the explanation level from simpler language to more
              advanced physics terminology.
            </Text>
            <View style={styles.difficultyRow}>
              {difficultyLevels.map((level) => {
                const active = difficulty === level;
                return (
                  <Pressable
                    key={level}
                    style={[
                      styles.difficultyChip,
                      active && styles.difficultyChipActive,
                    ]}
                    onPress={() => setDifficulty(level)}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        active && styles.difficultyTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Quiz button */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.quizButton,
              (isLoadingQuiz || !lessonId) && styles.quizButtonDisabled,
            ]}
            onPress={handleTestYourself}
            disabled={isLoadingQuiz || !lessonId}
          >
            {isLoadingQuiz ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="help-buoy-outline" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.quizButtonText}>
              {isLoadingQuiz ? "Loading..." : "Test yourself"}
            </Text>
          </Pressable>
        </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: 12,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 20,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: Colors.light.border,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: Colors.light.background,
  },
  tabLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  tabLabelActive: {
    color: Colors.light.text,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  cardBody: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  highlight: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  examplesList: {
    gap: 16,
  },
  exampleItem: {
    gap: 8,
  },
  exampleImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  exampleText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.light.tint,
  },
  experienceCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  experienceTextBlock: {
    flex: 1,
    gap: 4,
  },
  experienceTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  experienceBody: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  experienceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  experienceButtonText: {
    ...Typography.caption,
    color: Colors.light.background,
    fontWeight: "500",
  },
  difficultyRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  difficultyChipActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.background,
  },
  difficultyText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  difficultyTextActive: {
    color: Colors.light.tint,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  quizButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quizButtonText: {
    ...Typography.bodyMedium,
    color: Colors.light.background,
    fontWeight: "600",
  },
  quizButtonDisabled: {
    opacity: 0.6,
  },
});
