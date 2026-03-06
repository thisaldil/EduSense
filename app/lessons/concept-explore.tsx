import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

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

// ─── Helper: tier color ───────────────────────────────────────────────────────
function tierColor(tier?: string): string {
  if (!tier) return Colors.deepBlue;
  if (tier.includes("Tier 3")) return "#EF4444";
  if (tier.includes("Tier 1")) return "#F59E0B";
  return "#22C55E";
}

// ─── Metric Pill ─────────────────────────────────────────────────────────────
function MetricPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={metricStyles.pill}>
      <Text style={metricStyles.label}>{label}</Text>
      <Text style={[metricStyles.value, { color }]}>{value}</Text>
    </View>
  );
}
const metricStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  value: { fontSize: 13, fontWeight: "700" },
});

// ─── Cognitive State Layouts ────────────────────────────────────────────────────
type LayoutFactoryProps = {
  cognitiveState?: CognitiveState;
  text?: string;
  keywords?: string[];
};

function LayoutFactory({ cognitiveState, text, keywords }: LayoutFactoryProps) {
  const safeText =
    text ||
    "No transmuted text found. Try generating the lesson again once the Neuro-Engine has processed your lesson.";

  switch (cognitiveState) {
    case "OVERLOAD":
      return <SimpleListView text={safeText} />;
    case "LOW_LOAD":
      return <StoryModeView text={safeText} />;
    case "OPTIMAL":
    default:
      return <StandardProseView text={safeText} keywords={keywords} />;
  }
}

function SimpleListView({ text }: { text: string }) {
  const chunks = text.split(/\n{2,}/).filter((c) => c.trim().length > 0);

  return (
    <View style={styles.simpleListCard}>
      <View style={styles.simpleListHeader}>
        <Ionicons name="school-outline" size={22} color="#111827" />
        <Text style={styles.simpleListTitle}>Teacher View</Text>
      </View>
      {chunks.map((chunk, index) => (
        <View key={index} style={styles.simpleListItem}>
          <Text style={styles.simpleListBullet}>•</Text>
          <Text style={styles.simpleListText}>{chunk.trim()}</Text>
        </View>
      ))}
      {chunks.length === 0 && (
        <Text style={styles.simpleListText}>{text.trim()}</Text>
      )}
    </View>
  );
}

function StandardProseView({
  text,
  keywords,
}: {
  text: string;
  keywords?: string[];
}) {
  return (
    <View style={styles.standardProseContainer}>
      <View style={styles.standardProseMain}>
        <Text style={styles.standardProseHeading}>Lesson Explanation</Text>
        <Text style={styles.standardProseText}>{text}</Text>
      </View>
      {keywords && keywords.length > 0 && (
        <View style={styles.vocabSidebar}>
          <Text style={styles.vocabSidebarLabel}>Vocabulary</Text>
          {keywords.map((kw) => (
            <View key={kw} style={styles.vocabChip}>
              <Text style={styles.vocabChipText}>{kw}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function StoryModeView({ text }: { text: string }) {
  return (
    <View style={styles.storyModeContainer}>
      <View style={styles.storyHeader}>
        <View style={styles.jaxAvatar}>
          <Text style={styles.jaxAvatarText}>🧭</Text>
        </View>
        <View>
          <Text style={styles.storyTitle}>Jax the Explorer</Text>
          <Text style={styles.storySubtitle}>Adventure Mode</Text>
        </View>
      </View>
      <Text style={styles.storyBody}>{text}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ConceptExploreScreen() {
  const params = useLocalSearchParams<{
    lesson_id?: string;
    raw_text?: string;
    transmute?: string;
    cognitive_state?: CognitiveState;
  }>();

  // FIX 1: Properly type the parsed transmute result
  const parsedTransmute = useMemo<TransmuteResult | null>(() => {
    if (!params.transmute) return null;
    try {
      return JSON.parse(params.transmute as string) as TransmuteResult;
    } catch {
      return null;
    }
  }, [params.transmute]);

  const [showRaw, setShowRaw] = useState(false);
  const color = tierColor(parsedTransmute?.tier_applied);
  const cognitiveState: CognitiveState =
    (params.cognitive_state as CognitiveState) ||
    (parsedTransmute?.cognitive_state as CognitiveState) ||
    "OPTIMAL";

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
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterBadgeText}>⚡ Neuro-Engine Result</Text>
          </View>
          <Text style={styles.headerTitle}>Transmuted Lesson</Text>
          <Text style={styles.headerTagline}>Adapted to your brain state</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Tier Banner ── */}
        {parsedTransmute?.tier_applied && (
          <View style={[styles.tierBanner, { borderLeftColor: color }]}>
            <View style={[styles.tierDot, { backgroundColor: color }]} />
            <Text style={[styles.tierText, { color }]}>
              {parsedTransmute.tier_applied}
            </Text>
          </View>
        )}

        {/* ── Transmuted Text (PRIMARY) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRANSMUTED OUTPUT</Text>
          <View style={[styles.transmuteCard, { borderColor: `${color}40` }]}>
            <LayoutFactory
              cognitiveState={cognitiveState}
              text={parsedTransmute?.transmuted_text}
              keywords={parsedTransmute?.keywords_preserved}
            />
          </View>
        </View>

        {/* ── NLP Metrics ── */}
        {parsedTransmute && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NLP ANALYSIS METRICS</Text>
            <View style={styles.metricsRow}>
              <MetricPill
                label="F-K GRADE"
                value={
                  parsedTransmute.flesch_kincaid_grade != null
                    ? `Grade ${parsedTransmute.flesch_kincaid_grade.toFixed(1)}`
                    : "—"
                }
                color={color}
              />
              <MetricPill
                label="COMPLEXITY"
                value={
                  parsedTransmute.original_complexity_score != null
                    ? parsedTransmute.original_complexity_score.toFixed(2)
                    : "—"
                }
                color={color}
              />
              <MetricPill
                label="DEP. DISTANCE"
                value={
                  parsedTransmute.dependency_distance != null
                    ? parsedTransmute.dependency_distance.toFixed(2)
                    : "—"
                }
                color={color}
              />
            </View>
          </View>
        )}

        {/* ── Keywords Preserved ── */}
        {parsedTransmute?.keywords_preserved &&
          parsedTransmute.keywords_preserved.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>KEYWORDS PRESERVED</Text>
              <View style={styles.keywordsCard}>
                <View style={styles.keywordsWrap}>
                  {parsedTransmute.keywords_preserved.map((kw) => (
                    <View
                      key={kw}
                      style={[
                        styles.keywordChip,
                        {
                          backgroundColor: `${color}18`,
                          borderColor: `${color}40`,
                        },
                      ]}
                    >
                      <Text style={[styles.keywordText, { color }]}>{kw}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.keywordCount}>
                  {parsedTransmute.keywords_preserved.length} core terms
                  preserved ✓
                </Text>
              </View>
            </View>
          )}

        {/* ── Raw Input Toggle ── */}
        <View style={styles.section}>
          <Pressable
            style={styles.rawToggle}
            onPress={() => setShowRaw((v) => !v)}
          >
            <Text style={styles.sectionLabel}>RAW INPUT TEXT</Text>
            <Ionicons
              name={showRaw ? "chevron-up" : "chevron-down"}
              size={16}
              color="#94A3B8"
            />
          </Pressable>
          {showRaw && (
            <View style={styles.rawCard}>
              <Text style={styles.rawText}>
                {params.raw_text || "No raw text available."}
              </Text>
            </View>
          )}
        </View>

        {/* ── CTA ── */}
        <Pressable
          style={styles.demoCard}
          onPress={() => {
            if (params.lesson_id) {
              router.push({
                pathname: "/lessons/lesson-player",
                params: { lesson_id: params.lesson_id },
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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F5FF" },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32 },

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
  headerCenter: { flex: 1, alignItems: "center", gap: 3 },
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
  headerTagline: { fontSize: 11, color: "#888", fontStyle: "italic" },

  tierBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierText: { fontSize: 13, fontWeight: "700" },

  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 8,
  },

  transmuteCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  transmuteText: { fontSize: 15, color: "#1E293B", lineHeight: 24 },
  placeholderText: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 20,
    fontStyle: "italic",
  },

  // OVERLOAD – SimpleListView
  simpleListCard: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 20,
  },
  simpleListHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  simpleListTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  simpleListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  simpleListBullet: {
    fontSize: 22,
    color: "#E5E7EB",
    marginRight: 8,
    lineHeight: 26,
  },
  simpleListText: {
    flex: 1,
    fontSize: 22,
    lineHeight: 30,
    color: "#F9FAFB",
  },

  // OPTIMAL – StandardProseView
  standardProseContainer: {
    flexDirection: "row",
    gap: 16,
  },
  standardProseMain: {
    flex: 3,
  },
  standardProseHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  standardProseText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#1E293B",
  },
  vocabSidebar: {
    flex: 1.4,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
  },
  vocabSidebarLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4F46E5",
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  vocabChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginBottom: 6,
  },
  vocabChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },

  // LOW_LOAD – StoryModeView
  storyModeContainer: {
    backgroundColor: "#ECFEFF",
    borderRadius: 18,
    padding: 18,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  jaxAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  jaxAvatarText: {
    fontSize: 26,
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  storySubtitle: {
    fontSize: 12,
    color: "#0369A1",
  },
  storyBody: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 26,
    color: "#022C22",
  },

  metricsRow: { flexDirection: "row", gap: 8 },

  keywordsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  keywordCount: { fontSize: 11, color: "#64748B", fontWeight: "600" },

  rawToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rawCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  rawText: { fontSize: 13, color: "#475569", lineHeight: 20 },

  demoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#5B3FA6",
    borderRadius: 20,
    padding: 18,
    marginTop: 4,
    shadowColor: "#5B3FA6",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  demoLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  demoEmoji: { fontSize: 32 },
  demoTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
  demoSub: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  demoArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
