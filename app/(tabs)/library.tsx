import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { type CognitiveTheme, Typography } from "@/constants/theme";
import { useCognitiveTheme } from "@/hooks/use-cognitive-theme";
import { getUserLessons, type LessonResponse } from "@/services/lessons";
import { useAuth } from "@/contexts/AuthContext";

type SensoryMode = "Visual" | "Audio" | "Haptic";

type Lesson = {
  id: string;
  title: string;
  subject: "Physics" | "Chemistry" | "Biology" | "Math";
  description: string;
  durationMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  modes: SensoryMode[];
  isBookmarked?: boolean;
};

const SUBJECT_COLORS: Record<Lesson["subject"], string> = {
  Physics: "#E0ECFF",
  Chemistry: "#FDE2FF",
  Biology: "#E3F9E5",
  Math: "#FFEFD5",
};

const SUBJECT_ICONS: Record<Lesson["subject"], keyof typeof Ionicons.glyphMap> =
  {
    Physics: "planet-outline",
    Chemistry: "flask-outline",
    Biology: "leaf-outline",
    Math: "calculator-outline",
  };

const DIFFICULTY_COLORS: Record<Lesson["difficulty"], string> = {
  Beginner: "#10B981",
  Intermediate: "#F97316",
  Advanced: "#EF4444",
};

type ViewMode = "list" | "grid";

export default function LibraryScreen() {
  const { theme: cognitiveTheme } = useCognitiveTheme();
  const styles = useMemo(() => createStyles(cognitiveTheme), [cognitiveTheme]);

  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadLessons();
  }, [isAuthenticated]);

  const loadLessons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserLessons({ skip: 0, limit: 50 });
      setLessons(data);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to load your lessons right now. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLessons = useMemo(() => {
    const mapped: Lesson[] = lessons.map((lesson) => {
      const subject =
        (["Physics", "Chemistry", "Biology", "Math"] as const).includes(
          lesson.subject as any,
        )
          ? (lesson.subject as any)
          : "Biology";
      const difficulty: Lesson["difficulty"] = "Beginner";
      const durationMinutes = 10;
      const modes: SensoryMode[] = ["Visual"];
      return {
        id: lesson.id,
        title: lesson.title,
        subject,
        description: lesson.content,
        durationMinutes,
        difficulty,
        modes,
      };
    });

    if (!searchQuery.trim()) return mapped;

    const query = searchQuery.toLowerCase();
    return mapped.filter((lesson) => {
      return (
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query)
      );
    });
  }, [lessons, searchQuery]);

  const renderLessonCard = ({ item }: { item: Lesson }) => (
    <View style={[styles.card, viewMode === "grid" && styles.cardGrid]}>
      <View style={styles.cardHeader}>
        <View style={styles.subjectRow}>
          <View
            style={[
              styles.subjectIconWrapper,
              { backgroundColor: SUBJECT_COLORS[item.subject] },
            ]}
          >
            <Ionicons
              name={SUBJECT_ICONS[item.subject]}
              size={20}
              color={cognitiveTheme.brand.primary}
            />
          </View>
          <View>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.durationText}>
              {item.durationMinutes} min •{" "}
              <Text
                style={[
                  styles.difficultyText,
                  { color: DIFFICULTY_COLORS[item.difficulty] },
                ]}
              >
                {item.difficulty}
              </Text>
            </Text>
          </View>
        </View>
        <Ionicons
          name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
          size={20}
          color={
            item.isBookmarked
              ? cognitiveTheme.brand.primary
              : cognitiveTheme.semantic.icon
          }
        />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modesRow}
        >
          {item.modes.map((mode) => (
            <View key={mode} style={styles.modeChip}>
              <Ionicons
                name={
                  mode === "Visual"
                    ? "eye-outline"
                    : mode === "Audio"
                    ? "musical-notes-outline"
                    : "phone-portrait-outline"
                }
                size={14}
                color={cognitiveTheme.brand.primary}
              />
              <Text style={styles.modeText}>{mode}</Text>
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.playButton}>
          <Ionicons name="play" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Library</Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("/settings")}
            hitSlop={10}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={cognitiveTheme.brand.primary}
            />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={cognitiveTheme.semantic.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for lessons..."
            placeholderTextColor={cognitiveTheme.semantic.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable>
            <Ionicons
              name="mic-outline"
              size={18}
              color={cognitiveTheme.brand.primary}
            />
          </Pressable>
        </View>

        {/* View Toggle */}
        <View style={styles.filtersRow}>
          <View style={styles.viewToggleGroup}>
            <Pressable
              style={[
                styles.viewToggleButton,
                viewMode === "list" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("list")}
            >
              <Ionicons
                name="list-outline"
                size={16}
                color={
                  viewMode === "list"
                    ? cognitiveTheme.brand.primary
                    : cognitiveTheme.semantic.icon
                }
              />
            </Pressable>
            <Pressable
              style={[
                styles.viewToggleButton,
                viewMode === "grid" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("grid")}
            >
              <Ionicons
                name="grid-outline"
                size={16}
                color={
                  viewMode === "grid"
                    ? cognitiveTheme.brand.primary
                    : cognitiveTheme.semantic.icon
                }
              />
            </Pressable>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderText}>
            {isLoading
              ? "Loading your lessons..."
              : `Showing ${filteredLessons.length} lesson${
                  filteredLessons.length === 1 ? "" : "s"
                }`}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Couldn&apos;t load lessons</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Pressable style={styles.errorRetryButton} onPress={loadLessons}>
              <Text style={styles.errorRetryLabel}>Try again</Text>
            </Pressable>
          </View>
        )}

        {isLoading && !error ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={cognitiveTheme.brand.primary} />
          </View>
        ) : filteredLessons.length === 0 && !error ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No lessons yet</Text>
            <Text style={styles.emptyMessage}>
              When you create or complete lessons, they will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredLessons}
            keyExtractor={(item) => item.id}
            key={viewMode}
            numColumns={viewMode === "grid" ? 2 : 1}
            columnWrapperStyle={
              viewMode === "grid" ? styles.gridColumnWrapper : undefined
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={renderLessonCard}
          />
        )}

        {/* Floating Action Button */}
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/lessons/new-lesson")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: CognitiveTheme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.semantic.backgroundSecondary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    ...Typography.h3,
    color: theme.semantic.text,
  },
  iconButton: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: theme.semantic.background,
    borderWidth: 1,
    borderColor: theme.semantic.border,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: theme.semantic.text,
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 16,
    marginBottom: 8,
  },
  viewToggleGroup: {
    flexDirection: "row",
    gap: 6,
  },
  viewToggleButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.semantic.background,
    borderWidth: 1,
    borderColor: theme.semantic.border,
  },
  viewToggleButtonActive: {
    borderColor: theme.brand.primary,
    backgroundColor: `${theme.brand.primary}10`,
  },
  listHeaderRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  listHeaderText: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  listContent: {
    paddingBottom: 96,
    paddingTop: 8,
    gap: 12,
  },
  gridColumnWrapper: {
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.semantic.background,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardGrid: {
    minWidth: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  subjectIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectText: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
    marginBottom: 2,
  },
  durationText: {
    ...Typography.small,
    color: theme.semantic.text,
  },
  difficultyText: {
    ...Typography.small,
    fontFamily: "Inter_600SemiBold",
  },
  cardBody: {
    marginTop: 6,
    gap: 4,
  },
  cardTitle: {
    ...Typography.bodyMedium,
    color: theme.semantic.text,
  },
  cardDescription: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  modesRow: {
    flexDirection: "row",
    gap: 6,
  },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.semantic.backgroundSecondary,
  },
  modeText: {
    ...Typography.small,
    color: theme.brand.primary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.brand.primary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.brand.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  loadingBox: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBox: {
    marginTop: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: `${theme.semantic.background}CC`,
    borderWidth: 1,
    borderColor: theme.semantic.border,
  },
  emptyTitle: {
    ...Typography.bodyMedium,
    color: theme.semantic.text,
    marginBottom: 4,
  },
  emptyMessage: {
    ...Typography.small,
    color: theme.semantic.textSecondary,
  },
  errorBox: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorTitle: {
    ...Typography.bodyMedium,
    color: "#B91C1C",
    marginBottom: 4,
  },
  errorMessage: {
    ...Typography.small,
    color: "#7F1D1D",
    marginBottom: 8,
  },
  errorRetryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#DC2626",
  },
  errorRetryLabel: {
    ...Typography.small,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
});
