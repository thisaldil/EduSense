import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

type Subject = "Physics" | "Biology" | "Cognition" | "Skills";

type LessonCard = {
  id: string;
  title: string;
  subject: Subject;
  progress: number; // 0 - 1
};

const CONTINUE_LESSONS: LessonCard[] = [
  {
    id: "1",
    title: "Forces & Motion",
    subject: "Physics",
    progress: 0.6,
  },
  {
    id: "2",
    title: "Neural Pathways",
    subject: "Biology",
    progress: 0.32,
  },
  {
    id: "3",
    title: "Color & Perception",
    subject: "Cognition",
    progress: 0.8,
  },
];

const RECOMMENDED_LESSONS: LessonCard[] = [
  {
    id: "4",
    title: "Sound Waves & Hearing",
    subject: "Physics",
    progress: 0,
  },
  {
    id: "5",
    title: "Touch & Texture",
    subject: "Biology",
    progress: 0,
  },
  {
    id: "6",
    title: "Memory Anchors",
    subject: "Cognition",
    progress: 0,
  },
  {
    id: "7",
    title: "Visual Focus Drills",
    subject: "Skills",
    progress: 0,
  },
];

const SUBJECT_ICONS: Record<Subject, keyof typeof Ionicons.glyphMap> = {
  Physics: "rocket-outline",
  Biology: "leaf-outline",
  Cognition: "bulb-outline",
  Skills: "star-outline",
};

const SUBJECT_COLORS: Record<Subject, string> = {
  Physics: "#E3F2FD",
  Biology: "#E8F5E9",
  Cognition: "#FFF3E0",
  Skills: "#F3E5F5",
};

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.first_name || user?.username || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const [search, setSearch] = useState("");

  // Redirect to welcome if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/welcome");
    }
  }, [isAuthenticated]);

  const playTapFeedback = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore haptic error
    }
  };

  const handleLessonPress = async (lesson: LessonCard) => {
    await playTapFeedback();
    router.push("/lesson-player");
  };

  const renderContinueCard = ({ item }: { item: LessonCard }) => {
    const progressPercent = Math.round(item.progress * 100);

    return (
      <Pressable
        onPress={() => handleLessonPress(item)}
        style={({ pressed }) => [
          styles.continueCard,
          { transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <View
          style={[
            styles.thumbnailCircle,
            { backgroundColor: SUBJECT_COLORS[item.subject] },
          ]}
        >
          <Ionicons
            name={SUBJECT_ICONS[item.subject]}
            size={32}
            color={Colors.deepBlue}
          />
        </View>

        <View style={styles.continueContent}>
          <Text style={styles.lessonTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.subjectRow}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectBadgeText}>{item.subject}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>{progressPercent}%</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderRecommendedCard = ({ item }: { item: LessonCard }) => {
    return (
      <Pressable
        onPress={() => handleLessonPress(item)}
        style={({ pressed }) => [
          styles.recommendedCard,
          { transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <View
          style={[
            styles.recommendedIcon,
            { backgroundColor: SUBJECT_COLORS[item.subject] },
          ]}
        >
          <Ionicons
            name={SUBJECT_ICONS[item.subject]}
            size={28}
            color={Colors.deepBlue}
          />
        </View>

        <Text style={styles.recommendedTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.recommendedFooter}>
          <View style={styles.subjectChip}>
            <Text style={styles.subjectChipText}>{item.subject}</Text>
          </View>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // Authenticated home screen
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>{userInitial}</Text>
              )}
            </View>
            <View>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.userName}>{userName} 👋</Text>
            </View>
          </View>
          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
            hitSlop={10}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={Colors.deepBlue}
            />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.light.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="What do you want to learn?"
            placeholderTextColor={Colors.light.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Hero CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.heroCard,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={async () => {
            await playTapFeedback();
            router.push("/new-lesson");
          }}
        >
          <ImageBackground
            source={require("@/assets/images/new-lesson-hero.png")}
            style={styles.heroBackground}
            imageStyle={styles.heroImageStyle}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={Colors.brightOrange}
                />
                <Text style={styles.heroBadgeText}>Start Learning</Text>
              </View>
              <Text style={styles.heroTitle}>Begin Your Sensory Journey</Text>
              <Text style={styles.heroSubtitle}>
                Discover amazing lessons designed just for you
              </Text>
            </View>
          </ImageBackground>
        </Pressable>

        {/* Continue Learning */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning 📚</Text>
            <Pressable hitSlop={10} onPress={() => router.push("/progress")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {CONTINUE_LESSONS.map((lesson) => (
              <View key={lesson.id}>
                {renderContinueCard({ item: lesson })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You ⭐</Text>
          </View>

          <FlatList
            data={RECOMMENDED_LESSONS}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            renderItem={renderRecommendedCard}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    ...Typography.h3,
    color: "#FFFFFF",
  },
  greeting: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  userName: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
  },

  // Hero Card
  heroCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroBackground: {
    width: "100%",
    height: 200,
    justifyContent: "flex-end",
  },
  heroImageStyle: {
    borderRadius: 20,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 82, 204, 0.85)",
  },
  heroContent: {
    padding: 20,
    gap: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  heroTitle: {
    ...Typography.h2,
    color: "#FFFFFF",
  },
  heroSubtitle: {
    ...Typography.body,
    color: "rgba(255, 255, 255, 0.9)",
  },

  // Section
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  seeAll: {
    ...Typography.label,
    color: Colors.deepBlue,
  },

  // Continue Learning Cards
  carouselContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  continueCard: {
    width: 280,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  thumbnailCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  continueContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  lessonTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  subjectRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  subjectBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectBadgeText: {
    ...Typography.small,
    color: Colors.deepBlue,
    fontFamily: "Inter_500Medium",
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.backgroundSecondary,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.teal,
    borderRadius: 4,
  },
  progressLabel: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },

  // Recommended Cards
  gridRow: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recommendedCard: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 16,
  },
  recommendedIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  recommendedTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
    marginBottom: 12,
  },
  recommendedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectChip: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectChipText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  newBadge: {
    backgroundColor: Colors.brightOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
});
