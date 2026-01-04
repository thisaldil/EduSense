import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

type Concept = {
  id: string;
  title: string;
  microLabel: string;
  description: string;
  audioScript: string;
  hapticsLabel: string;
};

const CONCEPTS: Concept[] = [
  {
    id: "gravity-1",
    title: "What is gravity?",
    microLabel: "What is gravity?",
    description:
      "Gravity is a force that pulls objects toward each other. Here, you’ll feel a gentle pull toward Earth.",
    audioScript: "Gravity is a force that attracts objects toward each other.",
    hapticsLabel: "Gentle, continuous vibration for concept introduction.",
  },
  {
    id: "gravity-2",
    title: "Direction of force",
    microLabel: "Direction of force",
    description:
      "Gravity pulls objects toward the center of the Earth. Notice the downward direction of the force.",
    audioScript: "Gravity pulls objects toward the center of the Earth.",
    hapticsLabel: "Pulsing vibration with a downward rhythm.",
  },
  {
    id: "gravity-3",
    title: "Effect on falling objects",
    microLabel: "Effect on falling objects",
    description:
      "When you drop an object, gravity accelerates it toward the ground. The longer it falls, the faster it moves.",
    audioScript:
      "As objects fall, gravity makes them speed up until something stops them.",
    hapticsLabel: "Increasing pulse speed as the object falls.",
  },
  {
    id: "gravity-4",
    title: "Strength variation",
    microLabel: "Strength variation",
    description:
      "Gravity is stronger when objects are closer or more massive. Far away from Earth, gravity feels weaker.",
    audioScript:
      "Gravity gets weaker with distance, but never fully disappears.",
    hapticsLabel: "Stronger vibrations near Earth, softer further away.",
  },
] as const;

export default function LessonPlayerScreen() {
  const params = useLocalSearchParams<{ lesson_id?: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [hapticOn, setHapticOn] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSteps = CONCEPTS.length;
  const currentStep = currentIndex + 1;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const currentConcept = CONCEPTS[currentIndex];
  const isLastStep = currentIndex === CONCEPTS.length - 1;

  const videoRef = useRef<Video | null>(null);

  // Auto-advance when playing with autoplay on
  useEffect(() => {
    if (!isPlaying || !autoPlay) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev < CONCEPTS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(id);
  }, [isPlaying, autoPlay]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < CONCEPTS.length - 1 ? prev + 1 : prev));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        videoRef.current?.playAsync();
      } else {
        videoRef.current?.pauseAsync();
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.appBar}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={20}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.light.text}
              />
            </Pressable>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Gravity</Text>
              <Text style={styles.headerSubtitle}>
                Step {currentStep} of {totalSteps}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Visual Hero - Video */}
          <View style={styles.visualHero}>
            <Video
              ref={videoRef}
              source={require("@/assets/videos/sample-lesson.mp4")}
              style={StyleSheet.absoluteFillObject}
              resizeMode="contain"
              isLooping
              shouldPlay={false}
              isMuted={!audioOn}
            />
            <View style={styles.interactiveBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Interactive demo</Text>
            </View>
          </View>

          {/* Play Control */}
          <Pressable
            style={[styles.playControl, isPlaying && styles.playControlActive]}
            onPress={togglePlay}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color={isPlaying ? "#FFFFFF" : Colors.light.tint}
            />
            <Text
              style={[styles.playLabel, isPlaying && styles.playLabelActive]}
            >
              {isPlaying ? "Playing" : "Play Concept"}
            </Text>
          </Pressable>

          {/* Sensory Toggles */}
          <View style={styles.sensoryControls}>
            <Pressable
              style={[styles.toggle, hapticOn && styles.toggleActive]}
              onPress={() => setHapticOn((v) => !v)}
            >
              <Ionicons
                name="pulse"
                size={20}
                color={hapticOn ? "#FFFFFF" : Colors.light.textSecondary}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  hapticOn && styles.toggleLabelActive,
                ]}
              >
                Haptics
              </Text>
            </Pressable>

            <Pressable
              style={[styles.toggle, audioOn && styles.toggleActive]}
              onPress={() => setAudioOn((v) => !v)}
            >
              <Ionicons
                name="volume-high"
                size={20}
                color={audioOn ? "#FFFFFF" : Colors.light.textSecondary}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  audioOn && styles.toggleLabelActive,
                ]}
              >
                Audio
              </Text>
            </Pressable>
          </View>

          {/* Concept Details */}
          <View style={styles.conceptCard}>
            <Text style={styles.conceptTitle}>{currentConcept.title}</Text>
            <Text style={styles.conceptDescription}>
              {currentConcept.description}
            </Text>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <Pressable
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              disabled={currentIndex === 0}
              onPress={goToPrevious}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={
                  currentIndex === 0
                    ? Colors.light.textSecondary
                    : Colors.light.tint
                }
              />
              <Text
                style={[
                  styles.navLabel,
                  currentIndex === 0 && styles.navLabelDisabled,
                ]}
              >
                Previous
              </Text>
            </Pressable>

            <Pressable
              style={[styles.navButton, isLastStep && styles.navButtonPrimary]}
              onPress={() => {
                if (isLastStep) {
                  router.push({
                    pathname: "/lessons/concept-explore",
                    params: { lesson_id: params.lesson_id },
                  });
                } else {
                  goToNext();
                }
              }}
            >
              <Text
                style={[
                  styles.navLabel,
                  isLastStep ? styles.navLabelPrimary : styles.navLabel,
                ]}
              >
                {isLastStep ? "Finish" : "Next"}
              </Text>
              <Ionicons
                name={isLastStep ? "checkmark" : "chevron-forward"}
                size={20}
                color={isLastStep ? "#FFFFFF" : Colors.light.tint}
              />
            </Pressable>
          </View>

          {/* Auto Play Toggle */}
          <Pressable
            style={[styles.autoToggle, autoPlay && styles.autoToggleActive]}
            onPress={() => setAutoPlay((v) => !v)}
          >
            <Ionicons
              name="repeat-outline"
              size={20}
              color={autoPlay ? Colors.light.tint : Colors.light.textSecondary}
            />
            <Text
              style={[styles.autoLabel, autoPlay && styles.autoLabelActive]}
            >
              Auto-advance to next
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: Colors.light.background,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
  },
  progressText: {
    ...Typography.small,
    fontWeight: "600",
    color: Colors.light.tint,
    minWidth: 40,
  },
  main: {
    paddingHorizontal: 24,
    gap: 32,
  },
  visualHero: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  visualIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  interactiveBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brightOrange,
  },
  badgeText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  playControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  playControlActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  playLabel: {
    ...Typography.bodyMedium,
    color: Colors.light.textSecondary,
  },
  playLabelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sensoryControls: {
    flexDirection: "row",
    gap: 16,
  },
  toggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  toggleActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  toggleLabel: {
    ...Typography.label,
    color: Colors.light.textSecondary,
  },
  toggleLabelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  conceptCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  conceptTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  conceptDescription: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  navigation: {
    flexDirection: "row",
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  navButtonDisabled: {
    borderColor: Colors.light.border,
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  navLabel: {
    ...Typography.bodyMedium,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  navLabelDisabled: {
    color: Colors.light.textSecondary,
  },
  navLabelPrimary: {
    color: "#FFFFFF",
  },
  autoToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignSelf: "center",
  },
  autoToggleActive: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderColor: Colors.light.tint,
  },
  autoLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  autoLabelActive: {
    color: Colors.light.tint,
    fontWeight: "500",
  },
});
