import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/** Split transmuted prose into readable blocks (paragraphs, then sentences). */
function splitLessonTextIntoBlocks(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];

  const byLine = raw
    .split(/\n+/)
    .map((p) => p.replace(/^[\*\-•]\s*/, "").trim())
    .filter(Boolean);

  if (byLine.length > 1) return byLine;

  const blob = byLine[0] || raw;
  const sentences = blob
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length > 1) return sentences;
  return [blob];
}

/** Lightweight visual hints from lesson wording (works offline, no script JSON). */
function conceptVisualHints(text: string, keywords?: string[]): string[] {
  const hay = `${text} ${(keywords || []).join(" ")}`.toLowerCase();
  const rules: { re: RegExp; icon: string }[] = [
    { re: /photosynth|chlorophyll|glucose|sugar|c₆h/, icon: "🌱" },
    { re: /plant|leaf|leaves|root|soil/, icon: "🍃" },
    { re: /oxygen|o₂|breathe|animal|life on earth/, icon: "💨" },
    { re: /carbon\s*dioxide|co₂|atmosphere/, icon: "☁️" },
    { re: /water|h₂o|evapor|condens|rain/, icon: "💧" },
    { re: /sun|sunlight|light energy|solar/, icon: "☀️" },
    { re: /food\s*chain|ecosystem|energy flow/, icon: "⛓️" },
    { re: /cell|molecule|atom|reaction/, icon: "🔬" },
  ];
  const out: string[] = [];
  for (const { re, icon } of rules) {
    if (re.test(hay) && !out.includes(icon)) out.push(icon);
    if (out.length >= 6) break;
  }
  return out;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type CognitiveState = "OVERLOAD" | "OPTIMAL" | "LOW_LOAD";

type TransmuteResult = {
  original_complexity_score?: number;
  flesch_kincaid_grade?: number;
  dependency_distance?: number;
  keywords_preserved?: string[];
  transmuted_text?: string;
  tier_applied?: string;
  cognitive_state?: CognitiveState;
};

// ─── Student Profile derived from cognitive state + tier ─────────────────────
type StudentProfile = {
  type: "struggling" | "focused" | "explorer";
  theme: StudentTheme;
};

type StudentTheme = {
  // backgrounds
  pageBg: string;
  cardBg: string;
  headerBg: string;
  accentBg: string;
  // text
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  accentColor: string;
  // decorative
  badgeBg: string;
  badgeText: string;
  pillBg: string;
  pillBorder: string;
  ctaBg: string;
  ctaShadow: string;
  tierBorderColor: string;
  // emoji / mascot
  mascot: string;
  mascotBg: string;
  greeting: string;
  modeName: string;
  modeSubtitle: string;
  // keyword chip
  kwBg: string;
  kwBorder: string;
  kwText: string;
};

// ─── Theme Definitions per Student Type ──────────────────────────────────────

const THEMES: Record<"struggling" | "focused" | "explorer", StudentTheme> = {
  // OVERLOAD student — calm, dark, minimal, soothing
  struggling: {
    pageBg: "#0D1B2A",
    cardBg: "#1B2A3B",
    headerBg: "#0D1B2A",
    accentBg: "#112233",
    headingColor: "#E8F4FD",
    bodyColor: "#C8DCF0",
    mutedColor: "#6A8FAA",
    accentColor: "#38BDF8",
    badgeBg: "#0E3A52",
    badgeText: "#38BDF8",
    pillBg: "#112233",
    pillBorder: "#1E3A50",
    ctaBg: "#0C4A6E",
    ctaShadow: "#38BDF8",
    tierBorderColor: "#EF4444",
    mascot: "🌙",
    mascotBg: "#0E3A52",
    greeting: "Take it easy. One step at a time.",
    modeName: "Calm Mode",
    modeSubtitle: "Simplified just for you",
    kwBg: "#0E3A5240",
    kwBorder: "#38BDF840",
    kwText: "#38BDF8",
  },
  // OPTIMAL student — clean, bright, confident, structured
  focused: {
    pageBg: "#F0F4FF",
    cardBg: "#FFFFFF",
    headerBg: "#FFFFFF",
    accentBg: "#EEF2FF",
    headingColor: "#1E1B4B",
    bodyColor: "#312E81",
    mutedColor: "#7C86A1",
    accentColor: "#4F46E5",
    badgeBg: "#EEF2FF",
    badgeText: "#4F46E5",
    pillBg: "#F8FAFF",
    pillBorder: "#C7D2FE",
    ctaBg: "#4F46E5",
    ctaShadow: "#4F46E5",
    tierBorderColor: "#22C55E",
    mascot: "🔬",
    mascotBg: "#EEF2FF",
    greeting: "You're in the zone. Let's learn!",
    modeName: "Focus Mode",
    modeSubtitle: "Optimized for your flow",
    kwBg: "#EEF2FF",
    kwBorder: "#C7D2FE",
    kwText: "#4F46E5",
  },
  // LOW_LOAD student — vibrant, playful, adventurous, energetic
  explorer: {
    pageBg: "#FFFBEB",
    cardBg: "#FFFFFF",
    headerBg: "#FFFFFF",
    accentBg: "#FEF3C7",
    headingColor: "#1C1917",
    bodyColor: "#292524",
    mutedColor: "#A8A29E",
    accentColor: "#F59E0B",
    badgeBg: "#FEF3C7",
    badgeText: "#D97706",
    pillBg: "#FFFBEB",
    pillBorder: "#FDE68A",
    ctaBg: "#F59E0B",
    ctaShadow: "#F59E0B",
    tierBorderColor: "#F59E0B",
    mascot: "🧭",
    mascotBg: "#FEF3C7",
    greeting: "Ready to explore? Let's go deeper!",
    modeName: "Adventure Mode",
    modeSubtitle: "Enriched for curious minds",
    kwBg: "#FEF3C740",
    kwBorder: "#FDE68A",
    kwText: "#D97706",
  },
};

// ─── Derive student profile ───────────────────────────────────────────────────
function deriveProfile(
  cognitiveState: CognitiveState,
  tier?: string
): StudentProfile {
  if (cognitiveState === "OVERLOAD") {
    return { type: "struggling", theme: THEMES.struggling };
  }
  if (cognitiveState === "LOW_LOAD") {
    return { type: "explorer", theme: THEMES.explorer };
  }
  // OPTIMAL (or Tier 2 fallback)
  return { type: "focused", theme: THEMES.focused };
}

// ─── Animated Fade-in wrapper ─────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Pulse animation for mascot ──────────────────────────────────────────────
function PulsingMascot({
  emoji,
  bg,
  profile,
}: {
  emoji: string;
  bg: string;
  profile: StudentProfile;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: profile.type === "explorer" ? 1.15 : profile.type === "focused" ? 1.06 : 1.03,
          duration: profile.type === "explorer" ? 700 : 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: profile.type === "explorer" ? 700 : 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        mascotStyles.circle,
        { backgroundColor: bg, transform: [{ scale }] },
      ]}
    >
      <Text style={mascotStyles.emoji}>{emoji}</Text>
    </Animated.View>
  );
}

const mascotStyles = StyleSheet.create({
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 28 },
});

// ─── Metric Pill ─────────────────────────────────────────────────────────────
function MetricPill({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: StudentTheme;
}) {
  return (
    <View
      style={[
        metricStyles.pill,
        { backgroundColor: theme.pillBg, borderColor: theme.pillBorder },
      ]}
    >
      <Text style={[metricStyles.label, { color: theme.mutedColor }]}>
        {label}
      </Text>
      <Text style={[metricStyles.value, { color: theme.accentColor }]}>
        {value}
      </Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  value: { fontSize: 13, fontWeight: "800" },
});

// ─── OVERLOAD Layout: Calm Step-by-Step Cards ────────────────────────────────
function CalmStepCards({
  text,
  theme,
}: {
  text: string;
  theme: StudentTheme;
}) {
  const fromBlocks = splitLessonTextIntoBlocks(text);
  const lines =
    fromBlocks.length > 0
      ? fromBlocks
      : text
          .split(/\n+/)
          .map((l) => l.replace(/^[\*\-•]\s*/, "").trim())
          .filter(Boolean);

  return (
    <View>
      {/* Mascot header */}
      <View style={calmStyles.header}>
        <PulsingMascot emoji={theme.mascot} bg={theme.mascotBg} profile={{ type: "struggling", theme }} />
        <View style={{ flex: 1 }}>
          <Text style={[calmStyles.modeName, { color: theme.headingColor }]}>
            {theme.modeName}
          </Text>
          <Text style={[calmStyles.greeting, { color: theme.mutedColor }]}>
            {theme.greeting}
          </Text>
        </View>
      </View>

      {/* One big idea per card */}
      {lines.map((line, i) => (
        <FadeIn key={i} delay={i * 120}>
          <View
            style={[
              calmStyles.stepCard,
              { backgroundColor: theme.accentBg, borderColor: theme.pillBorder },
            ]}
          >
            <View
              style={[calmStyles.stepNum, { backgroundColor: theme.accentColor }]}
            >
              <Text style={calmStyles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={[calmStyles.stepText, { color: theme.bodyColor }]}>
              {line}
            </Text>
          </View>
        </FadeIn>
      ))}

      {lines.length === 0 && (
        <Text style={[calmStyles.stepText, { color: theme.bodyColor }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const calmStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  modeName: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  greeting: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fff",
  },
  stepText: {
    flex: 1,
    fontSize: 19,
    lineHeight: 28,
    fontWeight: "600",
  },
});

function ConceptHintStrip({
  hints,
  theme,
}: {
  hints: string[];
  theme: StudentTheme;
}) {
  if (hints.length === 0) return null;
  return (
    <FadeIn delay={40}>
      <View
        style={[
          structStyles.hintStrip,
          {
            backgroundColor: theme.accentBg,
            borderColor: theme.pillBorder,
          },
        ]}
      >
        <Text style={[structStyles.hintLabel, { color: theme.mutedColor }]}>
          Ideas in this lesson
        </Text>
        <View style={structStyles.hintRow}>
          {hints.map((icon, i) => (
            <View
              key={`${icon}-${i}`}
              style={[
                structStyles.hintBubble,
                { backgroundColor: theme.cardBg, borderColor: theme.pillBorder },
              ]}
            >
              <Text style={structStyles.hintEmoji}>{icon}</Text>
            </View>
          ))}
        </View>
      </View>
    </FadeIn>
  );
}

// ─── OPTIMAL Layout: Structured Dual-Panel ───────────────────────────────────
function StructuredLessonPanel({
  text,
  keywords,
  theme,
}: {
  text: string;
  keywords?: string[];
  theme: StudentTheme;
}) {
  const blocksRaw = splitLessonTextIntoBlocks(text);
  const blocks =
    blocksRaw.length > 0
      ? blocksRaw
      : [(text || "").trim() || "No transmuted text yet."];
  const hints = conceptVisualHints(text, keywords);

  return (
    <View>
      {/* Mode badge */}
      <View style={structStyles.modeBadge}>
        <Text style={structStyles.modeEmoji}>{theme.mascot}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[structStyles.modeName, { color: theme.headingColor }]}>
            {theme.modeName}
          </Text>
          <Text style={[structStyles.modeSubtitle, { color: theme.mutedColor }]}>
            {theme.greeting}
          </Text>
        </View>
      </View>

      <ConceptHintStrip hints={hints} theme={theme} />

      {/* Divider */}
      <View
        style={[structStyles.divider, { backgroundColor: theme.pillBorder }]}
      />

      {/* Main prose — one card per idea */}
      <FadeIn delay={80}>
        <Text
          style={[structStyles.sectionHeading, { color: theme.accentColor }]}
        >
          Lesson explanation
        </Text>
        {blocks.map((block, i) => (
          <FadeIn key={i} delay={80 + i * 70}>
            <View
              style={[
                structStyles.proseBlock,
                {
                  borderLeftColor: theme.accentColor,
                  backgroundColor: theme.accentBg,
                },
              ]}
            >
              <Text
                style={[
                  i === 0 ? structStyles.proseLead : structStyles.proseText,
                  { color: theme.bodyColor },
                ]}
              >
                {block}
              </Text>
            </View>
          </FadeIn>
        ))}
      </FadeIn>

      {/* Vocab sidebar as horizontal chips */}
      {keywords && keywords.length > 0 && (
        <FadeIn delay={200}>
          <View
            style={[
              structStyles.vocabBox,
              { backgroundColor: theme.accentBg, borderColor: theme.pillBorder },
            ]}
          >
            <Text
              style={[structStyles.vocabLabel, { color: theme.accentColor }]}
            >
              Key vocabulary
            </Text>
            <View style={structStyles.chipsRow}>
              {keywords.map((kw) => (
                <View
                  key={kw}
                  style={[
                    structStyles.chip,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.pillBorder,
                    },
                  ]}
                >
                  <Text
                    style={[structStyles.chipText, { color: theme.bodyColor }]}
                  >
                    {kw}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </FadeIn>
      )}
    </View>
  );
}

const structStyles = StyleSheet.create({
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  modeEmoji: { fontSize: 30 },
  modeName: { fontSize: 17, fontWeight: "800" },
  modeSubtitle: { fontSize: 12, marginTop: 1 },
  hintStrip: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  hintLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  hintRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hintBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hintEmoji: { fontSize: 22 },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 14 },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.9,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  proseBlock: {
    borderLeftWidth: 3,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingRight: 12,
    marginBottom: 10,
  },
  proseLead: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "700",
  },
  proseText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },
  vocabBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 6,
  },
  vocabLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
});

// ─── LOW_LOAD Layout: Adventure Story Cards ───────────────────────────────────
function AdventureStoryView({
  text,
  theme,
}: {
  text: string;
  theme: StudentTheme;
}) {
  const blocks = splitLessonTextIntoBlocks(text);
  const paragraphs = blocks.length > 0 ? blocks : [text].filter(Boolean);

  return (
    <View>
      {/* Adventure header */}
      <View style={adventureStyles.header}>
        <PulsingMascot emoji={theme.mascot} bg={theme.mascotBg} profile={{ type: "explorer", theme }} />
        <View style={{ flex: 1 }}>
          <Text
            style={[adventureStyles.title, { color: theme.headingColor }]}
          >
            {theme.modeName}
          </Text>
          <Text
            style={[adventureStyles.subtitle, { color: theme.mutedColor }]}
          >
            {theme.greeting}
          </Text>
        </View>
        {/* Energy badge */}
        <View
          style={[
            adventureStyles.energyBadge,
            { backgroundColor: theme.badgeBg },
          ]}
        >
          <Text
            style={[adventureStyles.energyText, { color: theme.badgeText }]}
          >
            ⚡ ENRICHED
          </Text>
        </View>
      </View>

      {/* Story panels */}
      {paragraphs.map((para, i) => (
        <FadeIn key={i} delay={i * 100}>
          <View
            style={[
              adventureStyles.storyPanel,
              {
                backgroundColor: i % 2 === 0 ? theme.cardBg : theme.accentBg,
                borderLeftColor: theme.accentColor,
                borderColor: theme.pillBorder,
              },
            ]}
          >
            <Text
              style={[adventureStyles.panelText, { color: theme.bodyColor }]}
            >
              {para}
            </Text>
          </View>
        </FadeIn>
      ))}
    </View>
  );
}

const adventureStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  title: { fontSize: 18, fontWeight: "900" },
  subtitle: { fontSize: 12, marginTop: 2 },
  energyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  energyText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
  storyPanel: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  panelText: { fontSize: 15, lineHeight: 24, fontWeight: "500" },
});

// ─── Layout Factory ───────────────────────────────────────────────────────────
function LayoutFactory({
  cognitiveState,
  text,
  keywords,
  theme,
  profile,
}: {
  cognitiveState?: CognitiveState;
  text?: string;
  keywords?: string[];
  theme: StudentTheme;
  profile: StudentProfile;
}) {
  const safeText =
    text ||
    "No transmuted text found. Try generating the lesson again once the Neuro-Engine has processed your lesson.";

  switch (cognitiveState) {
    case "OVERLOAD":
      return <CalmStepCards text={safeText} theme={theme} />;
    case "LOW_LOAD":
      return <AdventureStoryView text={safeText} theme={theme} />;
    case "OPTIMAL":
    default:
      return (
        <StructuredLessonPanel
          text={safeText}
          keywords={keywords}
          theme={theme}
        />
      );
  }
}

// ─── Tier Banner ─────────────────────────────────────────────────────────────
function TierBanner({
  tier,
  theme,
}: {
  tier: string;
  theme: StudentTheme;
}) {
  const color = theme.tierBorderColor;
  return (
    <View
      style={[
        tierBannerStyles.banner,
        {
          backgroundColor: theme.cardBg,
          borderLeftColor: color,
          shadowColor: color,
        },
      ]}
    >
      <View
        style={[tierBannerStyles.dot, { backgroundColor: color }]}
      />
      <Text style={[tierBannerStyles.text, { color }]}>{tier}</Text>
    </View>
  );
}

const tierBannerStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: "700" },
});

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <Text style={[sectionLabelStyles.text, { color }]}>{label}</Text>
  );
}

const sectionLabelStyles = StyleSheet.create({
  text: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ConceptExploreScreen() {
  const params = useLocalSearchParams<{
    lesson_id?: string;
    raw_text?: string;
    transmute?: string;
    cognitive_state?: CognitiveState;
  }>();

  const parsedTransmute = useMemo<TransmuteResult | null>(() => {
    if (!params.transmute) return null;
    try {
      return JSON.parse(params.transmute as string) as TransmuteResult;
    } catch {
      return null;
    }
  }, [params.transmute]);

  const [showRaw, setShowRaw] = useState(false);

  const cognitiveState: CognitiveState =
    (params.cognitive_state as CognitiveState) ||
    (parsedTransmute?.cognitive_state as CognitiveState) ||
    "OPTIMAL";

  const profile = deriveProfile(cognitiveState, parsedTransmute?.tier_applied);
  const theme = profile.theme;

  // Header entrance animation
  const headerOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView
      style={[mainStyles.safeArea, { backgroundColor: theme.pageBg }]}
    >
      {/* ── Header ── */}
      <Animated.View
        style={[
          mainStyles.header,
          {
            backgroundColor: theme.headerBg,
            opacity: headerOpacity,
            borderBottomColor:
              profile.type === "struggling"
                ? "rgba(255,255,255,0.08)"
                : "rgba(15,23,42,0.09)",
          },
        ]}
      >
        <Pressable
          style={[
            mainStyles.backButton,
            { backgroundColor: theme.accentBg },
          ]}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={theme.accentColor} />
        </Pressable>

        <View style={mainStyles.headerCenter}>
          <View
            style={[
              mainStyles.chapterBadge,
              { backgroundColor: theme.badgeBg },
            ]}
          >
            <Text
              style={[mainStyles.chapterBadgeText, { color: theme.badgeText }]}
            >
              ⚡ Neuro-Engine Result
            </Text>
          </View>
          <Text
            style={[mainStyles.headerTitle, { color: theme.headingColor }]}
          >
            Transmuted Lesson
          </Text>
          <Text
            style={[mainStyles.headerTagline, { color: theme.mutedColor }]}
          >
            {theme.modeSubtitle}
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView
        style={mainStyles.scroll}
        contentContainerStyle={mainStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Tier Banner ── */}
        {parsedTransmute?.tier_applied && (
          <FadeIn delay={50}>
            <TierBanner tier={parsedTransmute.tier_applied} theme={theme} />
          </FadeIn>
        )}

        {/* ── Transmuted Text (PRIMARY) ── */}
        <FadeIn delay={100}>
          <View style={mainStyles.section}>
            <SectionLabel label="TRANSMUTED OUTPUT" color={theme.mutedColor} />
            <View
              style={[
                mainStyles.transmuteCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: `${theme.accentColor}30`,
                  shadowColor: theme.accentColor,
                },
              ]}
            >
              <LayoutFactory
                cognitiveState={cognitiveState}
                text={parsedTransmute?.transmuted_text}
                keywords={parsedTransmute?.keywords_preserved}
                theme={theme}
                profile={profile}
              />
            </View>
          </View>
        </FadeIn>

        {/* ── NLP Metrics ── */}
        {parsedTransmute && (
          <FadeIn delay={200}>
            <View style={mainStyles.section}>
              <SectionLabel
                label="NLP ANALYSIS METRICS"
                color={theme.mutedColor}
              />
              <View style={mainStyles.metricsRow}>
                <MetricPill
                  label="F-K GRADE"
                  value={
                    parsedTransmute.flesch_kincaid_grade != null
                      ? `Grade ${parsedTransmute.flesch_kincaid_grade.toFixed(1)}`
                      : "—"
                  }
                  theme={theme}
                />
                <MetricPill
                  label="COMPLEXITY"
                  value={
                    parsedTransmute.original_complexity_score != null
                      ? parsedTransmute.original_complexity_score.toFixed(2)
                      : "—"
                  }
                  theme={theme}
                />
                <MetricPill
                  label="DEP. DISTANCE"
                  value={
                    parsedTransmute.dependency_distance != null
                      ? parsedTransmute.dependency_distance.toFixed(2)
                      : "—"
                  }
                  theme={theme}
                />
              </View>
            </View>
          </FadeIn>
        )}

        {/* ── Keywords Preserved ── */}
        {parsedTransmute?.keywords_preserved &&
          parsedTransmute.keywords_preserved.length > 0 && (
            <FadeIn delay={280}>
              <View style={mainStyles.section}>
                <SectionLabel
                  label="KEYWORDS PRESERVED"
                  color={theme.mutedColor}
                />
                <View
                  style={[
                    mainStyles.keywordsCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.pillBorder,
                    },
                  ]}
                >
                  <View style={mainStyles.keywordsWrap}>
                    {parsedTransmute.keywords_preserved.map((kw) => (
                      <View
                        key={kw}
                        style={[
                          mainStyles.keywordChip,
                          {
                            backgroundColor: theme.kwBg,
                            borderColor: theme.kwBorder,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            mainStyles.keywordText,
                            { color: theme.kwText },
                          ]}
                        >
                          {kw}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text
                    style={[
                      mainStyles.keywordCount,
                      { color: theme.mutedColor },
                    ]}
                  >
                    {parsedTransmute.keywords_preserved.length} core terms
                    preserved ✓
                  </Text>
                </View>
              </View>
            </FadeIn>
          )}

        {/* ── Raw Input Toggle ── */}
        <FadeIn delay={340}>
          <View style={mainStyles.section}>
            <Pressable
              style={mainStyles.rawToggle}
              onPress={() => setShowRaw((v) => !v)}
            >
              <SectionLabel label="RAW INPUT TEXT" color={theme.mutedColor} />
              <Ionicons
                name={showRaw ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.mutedColor}
              />
            </Pressable>
            {showRaw && (
              <View
                style={[
                  mainStyles.rawCard,
                  {
                    backgroundColor: theme.accentBg,
                    borderColor: theme.pillBorder,
                  },
                ]}
              >
                <Text
                  style={[mainStyles.rawText, { color: theme.mutedColor }]}
                >
                  {params.raw_text || "No raw text available."}
                </Text>
              </View>
            )}
          </View>
        </FadeIn>

        {/* ── CTA ── */}
        <FadeIn delay={400}>
          <Pressable
            style={[
              mainStyles.demoCard,
              {
                backgroundColor: theme.ctaBg,
                shadowColor: theme.ctaShadow,
              },
            ]}
            onPress={() => {
              if (params.lesson_id) {
                router.push({
                  pathname: "/lessons/lesson-player",
                  params: { lesson_id: params.lesson_id },
                });
              }
            }}
          >
            <View style={mainStyles.demoLeft}>
              <Text style={mainStyles.demoEmoji}>
                {profile.type === "struggling"
                  ? "▶️"
                  : profile.type === "explorer"
                  ? "🚀"
                  : "🎮"}
              </Text>
              <View>
                <Text style={mainStyles.demoTitle}>
                  {profile.type === "struggling"
                    ? "See it visually"
                    : profile.type === "explorer"
                    ? "Launch animation!"
                    : "See it move!"}
                </Text>
                <Text style={mainStyles.demoSub}>
                  {profile.type === "struggling"
                    ? "Watch a simple animation"
                    : profile.type === "explorer"
                    ? "Full interactive demo"
                    : "Play a quick demo"}
                </Text>
              </View>
            </View>
            <View style={mainStyles.demoArrow}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          </Pressable>
        </FadeIn>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const mainStyles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 3 },
  chapterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  chapterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  headerTagline: { fontSize: 11, fontStyle: "italic" },

  section: { marginBottom: 16 },

  transmuteCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  metricsRow: { flexDirection: "row", gap: 8 },

  keywordsCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  keywordsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  keywordChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  keywordText: { fontSize: 12, fontWeight: "700" },
  keywordCount: { fontSize: 11, fontWeight: "600" },

  rawToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  rawCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  rawText: { fontSize: 13, lineHeight: 20 },

  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 22,
    padding: 20,
    marginTop: 4,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  demoLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  demoEmoji: { fontSize: 32 },
  demoTitle: { fontSize: 16, fontWeight: "900", color: "#fff" },
  demoSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  demoArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});