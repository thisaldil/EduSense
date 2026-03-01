import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { generateQuiz } from "@/services/lessons";

// ─── Types ───────────────────────────────────────────────────────────────────
type StoryStep = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  color: string;
  memoryHook: string;
};

// ─── Story Data ───────────────────────────────────────────────────────────────
// Narrative arc: Hook → Build tension → Reveal → Connect → Remember
const STORY_STEPS: StoryStep[] = [
  {
    id: "hook",
    emoji: "🚌",
    title: "Imagine you're on a bus…",
    body: "You're sitting quietly. Suddenly — SCREECH! The bus stops fast. Your body flies forward! What just happened to you?",
    color: "#FFF3CD",
    memoryHook: "Feel it? That lurch is inertia!",
  },
  {
    id: "question",
    emoji: "🤔",
    title: "Why did your body keep moving?",
    body: "Your body was already moving with the bus. When the bus stopped, nothing told YOUR body to stop too. So you kept going!",
    color: "#D1ECF1",
    memoryHook: "Moving things WANT to keep moving.",
  },
  {
    id: "law",
    emoji: "⚖️",
    title: "Newton's Big Idea",
    body: "Isaac Newton figured this out 350 years ago! He said: things keep doing what they're doing unless something pushes or pulls them.",
    color: "#D4EDDA",
    memoryHook: "Unless = the magic word!",
  },
  {
    id: "rest",
    emoji: "📚",
    title: "What about still things?",
    body: "A book on your desk just SITS there. It won't jump up on its own! It needs a force — like your hand — to start moving.",
    color: "#E2D9F3",
    memoryHook: "Still things stay still. Moving things keep moving.",
  },
  {
    id: "connect",
    emoji: "🌍",
    title: "It's everywhere around you!",
    body: "Seatbelts protect you from inertia. Hockey pucks slide until friction stops them. Astronauts float in space because nothing slows them down!",
    color: "#FCE4EC",
    memoryHook: "Look for it today — you'll see it everywhere!",
  },
];

const MEMORY_TRICKS = [
  { icon: "💪", label: "Inertia", desc: "Stubbornness of objects" },
  { icon: "⛔", label: "Force", desc: "The only thing that changes motion" },
  { icon: "🔄", label: "The Law", desc: "Keep doing what you're doing!" },
];

// ─── Animated Story Card ──────────────────────────────────────────────────────
function StoryCard({ step, index }: { step: StoryStep; index: number }) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 120,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay: index * 120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Alternate cards left / right for a non-linear zigzag feel
  const isEven = index % 2 === 0;

  return (
    <Animated.View
      style={[
        styles.storyCardOuter,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        isEven ? styles.storyCardLeft : styles.storyCardRight,
      ]}
    >
      {/* Connector line */}
      {index > 0 && (
        <View
          style={[
            styles.connector,
            isEven ? styles.connectorLeft : styles.connectorRight,
          ]}
        />
      )}

      <View style={[styles.storyCard, { backgroundColor: step.color }]}>
        {/* Big emoji circle */}
        <View style={styles.emojiCircle}>
          <Text style={styles.emojiText}>{step.emoji}</Text>
        </View>

        <View style={styles.storyCardContent}>
          <Text style={styles.storyTitle}>{step.title}</Text>
          <Text style={styles.storyBody}>{step.body}</Text>

          {/* Memory hook pill */}
          <View style={styles.memoryHookPill}>
            <Text style={styles.memoryHookIcon}>🧠</Text>
            <Text style={styles.memoryHookText}>{step.memoryHook}</Text>
          </View>
        </View>
      </View>

      {/* Step number bubble */}
      <View style={styles.stepNumberBubble}>
        <Text style={styles.stepNumberText}>{index + 1}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ConceptExploreScreen() {
  const params = useLocalSearchParams<{ lesson_id?: string }>();
  const lessonId = params.lesson_id;
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [memoryStarsRevealed, setMemoryStarsRevealed] = useState<string[]>([]);

  const handleTestYourself = async () => {
    if (!lessonId) {
      Alert.alert(
        "Oops!",
        "Something's missing. Please go back and try again.",
      );
      return;
    }
    setIsLoadingQuiz(true);
    try {
      const quiz = await generateQuiz({ lesson_id: lessonId });
      router.push({
        pathname: "/lessons/quiz",
        params: { quiz_id: quiz.id, lesson_id: lessonId },
      });
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error.message || "Couldn't load the quiz. Try again!",
      );
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const toggleMemoryTrick = (label: string) => {
    setMemoryStarsRevealed((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color="#333" />
        </Pressable>

        <View style={styles.headerCenter}>
          {/* Chapter badge */}
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterBadgeText}>⚡ Physics · Grade 6</Text>
          </View>
          <Text style={styles.headerTitle}>Newton's First Law</Text>
          <Text style={styles.headerTagline}>A story about stubbornness!</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="bookmark-outline" size={18} color="#666" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Story intro banner ── */}
        <View style={styles.introBanner}>
          <Text style={styles.introBannerEmoji}>📖</Text>
          <Text style={styles.introBannerText}>
            Follow the story below — each bubble builds on the last!
          </Text>
        </View>

        {/* ── Story Path (zigzag) ── */}
        <View style={styles.storyPath}>
          {STORY_STEPS.map((step, index) => (
            <StoryCard key={step.id} step={step} index={index} />
          ))}
        </View>

        {/* ── Visual summary image ── */}
        <View style={styles.visualSummarySection}>
          <Text style={styles.sectionHeader}>🎨 Picture it in your head</Text>
          <View style={styles.visualSummaryCard}>
            <Image
              source={require("@/assets/images/new-lesson-hero.png")}
              style={styles.summaryImage}
              resizeMode="cover"
            />
            <View style={styles.summaryCaption}>
              <Text style={styles.summaryCaptionText}>
                The bus stops — but you keep going. That's Newton's First Law in
                action! 🚀
              </Text>
            </View>
          </View>
        </View>

        {/* ── Memory Tricks (tap to reveal) ── */}
        <View style={styles.memorySection}>
          <Text style={styles.sectionHeader}>
            🧠 Memory tricks — tap each one!
          </Text>
          <Text style={styles.memorySectionSub}>
            Your brain remembers better with small, catchy ideas.
          </Text>

          <View style={styles.memoryTricksRow}>
            {MEMORY_TRICKS.map((trick) => {
              const revealed = memoryStarsRevealed.includes(trick.label);
              return (
                <Pressable
                  key={trick.label}
                  style={[
                    styles.memoryTrickCard,
                    revealed && styles.memoryTrickCardRevealed,
                  ]}
                  onPress={() => toggleMemoryTrick(trick.label)}
                >
                  <Text style={styles.memoryTrickIcon}>{trick.icon}</Text>
                  <Text style={styles.memoryTrickLabel}>{trick.label}</Text>
                  {revealed && (
                    <Text style={styles.memoryTrickDesc}>{trick.desc}</Text>
                  )}
                  {!revealed && (
                    <Text style={styles.memoryTrickTap}>Tap ✨</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Real-world examples ── */}
        <View style={styles.examplesSection}>
          <Text style={styles.sectionHeader}>🌍 Spot it in real life!</Text>

          {[
            {
              emoji: "🏒",
              title: "Hockey puck",
              desc: "Slides on ice until the boards (or a player!) stop it.",
            },
            {
              emoji: "🚗",
              title: "Seatbelt",
              desc: "Stops YOUR body when the car stops suddenly.",
            },
            {
              emoji: "🧑‍🚀",
              title: "Astronaut",
              desc: "Floats forever in space — nothing to slow them down!",
            },
          ].map((example, i) => (
            <View key={i} style={styles.exampleRow}>
              <View style={styles.exampleEmojiBox}>
                <Text style={styles.exampleEmoji}>{example.emoji}</Text>
              </View>
              <View style={styles.exampleTextBox}>
                <Text style={styles.exampleTitle}>{example.title}</Text>
                <Text style={styles.exampleDesc}>{example.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Try it demo ── */}
        <Pressable
          style={styles.demoCard}
          onPress={() => {
            if (lessonId) {
              router.push({
                pathname: "/lessons/lesson-player",
                params: { lesson_id: lessonId },
              });
            }
          }}
        >
          <View style={styles.demoLeft}>
            <Text style={styles.demoEmoji}>🎮</Text>
            <View>
              <Text style={styles.demoTitle}>See it move!</Text>
              <Text style={styles.demoSub}>Play a quick demo</Text>
            </View>
          </View>
          <View style={styles.demoArrow}>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Footer Quiz Button ── */}
      <View style={styles.footer}>
        <View style={styles.footerHint}>
          <Text style={styles.footerHintText}>
            🌟 Read all 5 story bubbles? You're ready!
          </Text>
        </View>
        <Pressable
          style={[
            styles.quizButton,
            (isLoadingQuiz || !lessonId) && styles.quizButtonDisabled,
          ]}
          onPress={handleTestYourself}
          disabled={isLoadingQuiz || !lessonId}
        >
          {isLoadingQuiz ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.quizButtonEmoji}>🏆</Text>
          )}
          <Text style={styles.quizButtonText}>
            {isLoadingQuiz ? "Getting ready…" : "Test yourself!"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_WIDTH = 280;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  chapterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#EDE9FF",
  },
  chapterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7C5CBF",
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A2E",
    textAlign: "center",
  },
  headerTagline: {
    fontSize: 11,
    color: "#888",
    fontStyle: "italic",
  },
  headerRight: {
    width: 36,
    alignItems: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  // Intro banner
  introBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E8F4FD",
    borderRadius: 14,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#5BA3D9",
  },
  introBannerEmoji: { fontSize: 22 },
  introBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#2C6F9B",
    fontWeight: "500",
    lineHeight: 18,
  },

  // Story Path
  storyPath: {
    paddingVertical: 8,
    marginBottom: 32,
  },
  storyCardOuter: {
    marginBottom: 20,
    position: "relative",
  },
  storyCardLeft: {
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  storyCardRight: {
    alignSelf: "flex-end",
    marginRight: 8,
  },
  connector: {
    position: "absolute",
    top: -20,
    width: 2,
    height: 24,
    backgroundColor: "#CCC",
  },
  connectorLeft: { left: 32 },
  connectorRight: { right: 32 },
  storyCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emojiText: { fontSize: 26 },
  storyCardContent: { flex: 1, gap: 6 },
  storyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1A2E",
    lineHeight: 19,
  },
  storyBody: {
    fontSize: 12,
    color: "#444",
    lineHeight: 18,
  },
  memoryHookPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  memoryHookIcon: { fontSize: 11 },
  memoryHookText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5B3FA6",
    fontStyle: "italic",
  },
  stepNumberBubble: {
    position: "absolute",
    top: -8,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#5B3FA6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },

  // Visual summary
  visualSummarySection: { marginBottom: 28 },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 12,
  },
  visualSummaryCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryImage: {
    width: "100%",
    height: 160,
  },
  summaryCaption: {
    padding: 14,
    backgroundColor: "#FFFDE7",
  },
  summaryCaptionText: {
    fontSize: 13,
    color: "#5D4037",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },

  // Memory tricks
  memorySection: { marginBottom: 28 },
  memorySectionSub: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
    marginTop: -8,
  },
  memoryTricksRow: {
    flexDirection: "row",
    gap: 10,
  },
  memoryTrickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    gap: 4,
    minHeight: 90,
    justifyContent: "center",
  },
  memoryTrickCardRevealed: {
    backgroundColor: "#EDE9FF",
    borderColor: "#9C73D4",
  },
  memoryTrickIcon: { fontSize: 24 },
  memoryTrickLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  memoryTrickDesc: {
    fontSize: 10,
    color: "#5B3FA6",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 14,
  },
  memoryTrickTap: {
    fontSize: 10,
    color: "#AAA",
    textAlign: "center",
  },

  // Examples
  examplesSection: { marginBottom: 28 },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  exampleEmojiBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  exampleEmoji: { fontSize: 24 },
  exampleTextBox: { flex: 1, gap: 2 },
  exampleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  exampleDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 17,
  },

  // Demo card
  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#5B3FA6",
    borderRadius: 20,
    padding: 18,
    marginBottom: 8,
    shadowColor: "#5B3FA6",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  demoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  demoEmoji: { fontSize: 32 },
  demoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  demoSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  demoArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    gap: 8,
  },
  footerHint: {
    alignItems: "center",
  },
  footerHintText: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
  },
  quizButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  quizButtonEmoji: { fontSize: 20 },
  quizButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  quizButtonDisabled: {
    opacity: 0.5,
  },
});
