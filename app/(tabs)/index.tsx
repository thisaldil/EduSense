import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNeuroState } from "@/context/NeuroStateContext";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const userName = user?.first_name || user?.username || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const [search, setSearch] = useState("");
  const { state: neuroState } = useNeuroState();

  const needsCalibration =
    (user as any)?.is_calibrated !== true &&
    (user as any)?.baseline_cognitive_load == null;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const timer = setTimeout(
        () => {
          router.replace("/welcome");
        },
        Platform.OS === "web" ? 150 : 50,
      );

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const playTapFeedback = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore haptic error
    }
  };

  const handleLessonPress = async (lesson: LessonCard) => {
    await playTapFeedback();
    router.push("/lessons/lesson-player");
  };

  const renderContinueCard = ({ item }: { item: LessonCard }) => {
    const progressPercent = Math.round(item.progress * 100);

    return (
      <Pressable
        onPress={() => handleLessonPress(item)}
        className="w-[280px] rounded-[20px] bg-brand-surface p-4 flex-row gap-3.5 shadow-md"
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <View
          className="w-16 h-16 rounded-[20px] items-center justify-center"
          style={{ backgroundColor: SUBJECT_COLORS[item.subject] }}
        >
          <Ionicons
            name={SUBJECT_ICONS[item.subject]}
            size={32}
            color={Colors.deepBlue}
          />
        </View>

        <View className="flex-1 justify-between">
          <Text
            className="font-sans-medium text-base text-brand-text"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View className="flex-row mt-1">
            <View className="bg-brand-surface-secondary px-2.5 py-1 rounded-xl">
              <Text className="text-xs font-sans-medium text-deep-blue">
                {item.subject}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2.5 mt-2">
            <View className="flex-1 h-2 rounded bg-brand-surface-secondary overflow-hidden">
              <View
                className="h-full bg-teal rounded"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
            <Text className="text-xs font-sans-semibold text-brand-text-secondary">
              {progressPercent}%
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderRecommendedCard = ({ item }: { item: LessonCard }) => {
    return (
      <Pressable
        onPress={() => handleLessonPress(item)}
        className="flex-1 rounded-[20px] bg-brand-surface p-4 shadow mb-4"
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: SUBJECT_COLORS[item.subject] }}
        >
          <Ionicons
            name={SUBJECT_ICONS[item.subject]}
            size={28}
            color={Colors.deepBlue}
          />
        </View>

        <Text
          className="font-sans-medium text-base text-brand-text mb-3"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View className="flex-row justify-between items-center">
          <View className="bg-brand-surface-secondary px-2.5 py-1 rounded-xl">
            <Text className="text-xs text-brand-text-secondary">
              {item.subject}
            </Text>
          </View>
          <View className="bg-bright-orange px-2 py-1 rounded-lg">
            <Text className="text-xs font-sans-semibold text-white">New</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const neuroLabel =
    neuroState.currentState === "LOW_LOAD"
      ? "Low · Deep Dive"
      : neuroState.currentState === "OVERLOAD"
        ? "High · Simplified"
        : "Optimal · Balanced";

  const neuroColor =
    neuroState.currentState === "LOW_LOAD"
      ? "#3B82F6"
      : neuroState.currentState === "OVERLOAD"
        ? "#F97316"
        : "#22C55E";

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-4 pb-5">
          <View className="flex-row items-center gap-3">
            <View className="w-[52px] h-[52px] rounded-[26px] bg-teal items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="w-[52px] h-[52px] rounded-[26px]"
                  contentFit="cover"
                />
              ) : (
                <Text className="font-heading text-xl text-white">
                  {userInitial}
                </Text>
              )}
            </View>
            <View>
              <Text className="text-sm text-brand-text-secondary">Hello!</Text>
              <Text className="font-sans-semibold text-xl text-brand-text">
                {userName} 👋
              </Text>
              <View className="mt-1 flex-row items-center gap-1.5">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: neuroColor }}
                />
                <Text className="text-[11px] text-brand-text-secondary">
                  Neuro‑State: {neuroLabel}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            className="w-11 h-11 rounded-[22px] bg-brand-surface items-center justify-center shadow-md"
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

        {/* New user calibration banner */}
        {needsCalibration && (
          <View className="mx-5 mb-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex-row gap-3 items-center">
            <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center">
              <Text className="text-lg">🧠</Text>
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-[13px] text-amber-900">
                New here? Please do a quick Brain Sync.
              </Text>
              <Text className="text-[11px] text-amber-800 mt-1">
                As a new user, you just need to complete a simple 2-minute set of tasks so we can understand your cognitive load.
              </Text>
              <Pressable
                className="mt-2 self-start rounded-full bg-amber-500 px-3 py-1.5"
                onPress={async () => {
                  await playTapFeedback();
                  router.push("/calibration");
                }}
              >
                <Text className="text-xs font-sans-semibold text-white">
                  Start Brain Sync
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Search */}
        <View className="flex-row items-center bg-brand-surface mx-5 px-4 py-3.5 rounded-2xl gap-3 shadow">
          <Ionicons
            name="search"
            size={20}
            color={Colors.light.textSecondary}
          />
          <TextInput
            className="flex-1 font-sans text-base text-brand-text"
            placeholder="What do you want to learn?"
            placeholderTextColor={Colors.light.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Hero CTA */}
        <Pressable
          className="mx-5 mt-6 rounded-[20px] overflow-hidden shadow-xl"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
          onPress={async () => {
            await playTapFeedback();
            router.push("/lessons/new-lesson");
          }}
        >
          <ImageBackground
            source={require("@/assets/images/new-lesson-hero.png")}
            className="w-full h-[200px] justify-end"
            imageStyle={{ borderRadius: 20 }}
          >
            <View className="absolute inset-0 bg-deep-blue/85" />
            <View className="p-5 gap-2">
              <View className="flex-row items-center self-start bg-white/25 px-3 py-1.5 rounded-full gap-1.5">
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={Colors.brightOrange}
                />
                <Text className="text-xs font-sans-semibold text-white">
                  Start Learning
                </Text>
              </View>
              <Text className="font-heading text-2xl text-white">
                Begin Your Sensory Journey
              </Text>
              <Text className="font-sans text-base text-white/90">
                Discover amazing lessons designed just for you
              </Text>
            </View>
          </ImageBackground>
        </Pressable>

        {/* Continue Learning */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <Text className="font-sans-semibold text-xl text-brand-text">
              Continue Learning 📚
            </Text>
            <Pressable hitSlop={10} onPress={() => router.push("/progress")}>
              <Text className="font-sans-medium text-sm text-deep-blue">
                See all
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          >
            {CONTINUE_LESSONS.map((lesson) => (
              <View key={lesson.id}>
                {renderContinueCard({ item: lesson })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recommended */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-5 mb-4">
            <Text className="font-sans-semibold text-xl text-brand-text">
              Recommended for You ⭐
            </Text>
          </View>

          <FlatList
            data={RECOMMENDED_LESSONS}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ paddingHorizontal: 20, gap: 16 }}
            renderItem={renderRecommendedCard}
          />
        </View>

        {/* Dev: Sunny visual test route */}
        <View className="mt-6 px-5">
          <Pressable
            className="rounded-2xl border border-dashed border-brand-surface-secondary px-4 py-3 bg-brand-surface-secondary/40"
            onPress={async () => {
              await playTapFeedback();
              router.push("/test-visual");
            }}
          >
            <Text className="text-xs font-sans-semibold text-brand-text-secondary">
              Debug · Open Sunny test visual
            </Text>
            <Text className="text-[11px] text-brand-text-secondary mt-1">
              Path: http://localhost:8081/test-visual
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
