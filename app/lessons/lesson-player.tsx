import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AnimationCanvasNative } from "@/components/AnimationCanvasNative";
import { animationApi } from "@/services/api";
import { getLatestTransmutedContent } from "@/services/lessons";
import { useNeuroState } from "@/context/NeuroStateContext";
import { useAnalyticsLogger } from "@/context/AnalyticsLoggerContext";
import { useAuth } from "@/contexts/AuthContext";

type AnimationScript = animationApi.NeuroAdaptiveAnimationScript;

// ─────────────────────────────────────────────────────────────────────────────
// Hook — now accepts cognitiveState so it re-fetches whenever state changes
// ─────────────────────────────────────────────────────────────────────────────

type UseNeuroAdaptiveScriptArgs = {
  lessonId?: string;
  concept?: string;
  studentId?: string;
  sessionId?: string | null;
  /** ← NEW: live cognitive state from NeuroStateContext */
  cognitiveState?: string;
};

type UseNeuroAdaptiveScriptResult = {
  script: AnimationScript | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function useNeuroAdaptiveScript({
  lessonId,
  concept,
  studentId,
  sessionId,
  cognitiveState, // ← NEW
}: UseNeuroAdaptiveScriptArgs): UseNeuroAdaptiveScriptResult {
  const [script, setScript] = useState<AnimationScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track previous state to skip the very first redundant fetch when
  // cognitiveState matches what the backend already returned.
  const lastFetchedStateRef = useRef<string | undefined>(undefined);

  const fetchScript = useCallback(async () => {
    // We only strictly require studentId for Member 2.
    if (!studentId) {
      setScript(null);
      return;
    }

    // Skip re-fetch if state hasn't actually changed
    if (
      lastFetchedStateRef.current === cognitiveState &&
      lastFetchedStateRef.current !== undefined
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Only reuse a cached script when cognitiveState hasn't been forced.
      //    If state changed we always want a fresh script.
      if (!cognitiveState) {
        const existingScript = await animationApi.getLatestNeuroAdaptiveScript(
          studentId,
          sessionId ?? undefined,
        );
        if (existingScript) {
          setScript(existingScript.script);
          return;
        }
      }

      // 2) Get the latest transmuted text from Member 1 (prefer lessonId filter)
      const transmuted = await getLatestTransmutedContent(
        studentId,
        lessonId,
      );

      if (
        !transmuted ||
        !transmuted.output?.transmuted_text ||
        !transmuted.input?.cognitive_state
      ) {
        throw new Error(
          "No neuro-adaptive transmuted content found for this lesson.",
        );
      }

      // ← KEY FIX: live cognitiveState overrides whatever Member 1 stored.
      //   This means when student hits "Simplify Me" (OVERLOAD) or
      //   "Deep Dive" (LOW), Member 2 generates a new visual script for
      //   that state immediately.
      const resolvedState = cognitiveState ?? transmuted.input.cognitive_state;

      const animation = await animationApi.postNeuroAdaptiveScript({
        transmutedText: transmuted.output.transmuted_text,
        cognitiveState: resolvedState as "OVERLOAD" | "OPTIMAL" | "LOW_LOAD",
        concept: concept || transmuted.topic || transmuted.lesson_title,
        studentId,
        lessonId,
        sessionId: sessionId ?? undefined,
      });

      lastFetchedStateRef.current = cognitiveState;
      setScript(animation.script);
    } catch (err: any) {
      console.error("Failed to fetch neuro-adaptive animation script:", err);
      setError(
        err?.message ||
          "Unable to generate a visual explanation right now. Please try again.",
      );
      setScript(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId, studentId, sessionId, concept, cognitiveState]); // ← cognitiveState in deps

  useEffect(() => {
    fetchScript();
  }, [fetchScript]); // re-runs whenever cognitiveState changes

  return { script, loading, error, refetch: fetchScript };
}

// ─────────────────────────────────────────────────────────────────────────────
// LessonAnimationPanel — unchanged except isPlaying reset on new script
// ─────────────────────────────────────────────────────────────────────────────

type LessonAnimationPanelProps = {
  script: AnimationScript | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function LessonAnimationPanel({
  script,
  loading,
  error,
  onRetry,
}: LessonAnimationPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState<
    AnimationScript["scenes"][0] | null
  >(null);

  // ← Reset playback whenever a new script arrives (state changed)
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentScene(null);
  }, [script]);

  useEffect(() => {
    if (!script || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const next = Math.min(script.duration, t + 100);
        const scene = script.scenes.find(
          (s) => next >= s.startTime && next < s.startTime + s.duration,
        );
        setCurrentScene(scene || null);
        if (next >= script.duration) setIsPlaying(false);
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [script, isPlaying]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    // TODO: expose setSpeed from AnimationCanvasNative
  };

  const progress = script
    ? Math.min(100, (currentTime / script.duration) * 100)
    : 0;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <View style={styles.root}>
      {/* Header Card */}
      {script && (
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {script.title || "Animation"}
              </Text>
              {currentScene?.text ? (
                <Text style={styles.headerSubtitle}>{currentScene.text}</Text>
              ) : null}
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaLine}>
                Scene{" "}
                {script.scenes.findIndex((s) => s === currentScene) + 1 || 1} /{" "}
                {script.scenes.length}
              </Text>
              <Text style={styles.headerMetaLine}>
                {formatTime(currentTime)} / {formatTime(script.duration)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarOuter}>
            <View
              style={[
                styles.progressBarInner,
                { width: `${progress}%` as any },
              ]}
            />
          </View>
        </View>
      )}

      {/* Canvas Container */}
      <View style={styles.canvasCard}>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.overlayText}>
              Adapting visuals to your cognitive state…
            </Text>
          </View>
        )}
        {error && !loading && (
          <View style={styles.overlay}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Animation Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            {onRetry && (
              <Pressable style={styles.controlButton} onPress={onRetry}>
                <Text style={styles.controlButtonText}>Try again</Text>
              </Pressable>
            )}
          </View>
        )}
        {!script && !error && !loading && (
          <View style={styles.overlay}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>No Animation Loaded</Text>
            <Text style={styles.emptyMessage}>
              Enter a concept to generate an animation
            </Text>
          </View>
        )}
        {script && !error && (
          <View style={styles.canvasInner}>
            <AnimationCanvasNative isPlaying={isPlaying} script={script} />
          </View>
        )}
      </View>

      {/* Controls */}
      {script && (
        <View style={styles.controlsCard}>
          <View style={styles.controlsRow}>
            <Pressable
              style={[
                styles.controlButton,
                isPlaying && styles.controlButtonActive,
              ]}
              onPress={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  if (currentTime >= (script?.duration ?? 0)) {
                    setCurrentTime(0);
                  }
                  setIsPlaying(true);
                }
              }}
            >
              <Text
                style={[
                  styles.controlButtonText,
                  isPlaying && { color: "#FFFFFF" },
                ]}
              >
                {isPlaying ? "Pause" : "Play"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.controlButton}
              onPress={() => {
                setCurrentTime(0);
                setCurrentScene(null);
                setIsPlaying(true);
              }}
            >
              <Text style={styles.controlButtonText}>Reset</Text>
            </Pressable>
          </View>
          <View style={styles.speedRow}>
            {[0.5, 1, 1.5].map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.speedChip,
                  speed === s && styles.speedChipActive,
                ]}
                onPress={() => handleSpeedChange(s)}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    speed === s && styles.speedChipTextActive,
                  ]}
                >
                  {s}x
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LessonPlayerScreen — passes neuroState.currentState into the hook
// ─────────────────────────────────────────────────────────────────────────────

export default function LessonPlayerScreen() {
  const params = useLocalSearchParams<{ lesson_id?: string }>();
  const { user } = useAuth();
  const {
    state: neuroState,
    forceStateOverride,
    updateStateFromPrediction,
  } = useNeuroState();
  const { logInteraction, triggerPrediction } = useAnalyticsLogger();

  const {
    script: adaptiveScript,
    loading: scriptLoading,
    error: scriptError,
    refetch: refetchScript,
  } = useNeuroAdaptiveScript({
    lessonId: params.lesson_id,
    concept: undefined,
    studentId: user?.id,
    sessionId: undefined,
    cognitiveState: neuroState.currentState, // ← THE KEY WIRE-UP
  });

  useEffect(() => {
    logInteraction("SECTION_START", {
      screen: "lesson-player",
      lesson_id: params.lesson_id,
    });
    return () => {
      logInteraction("SECTION_END", {
        screen: "lesson-player",
        lesson_id: params.lesson_id,
      });
    };
  }, [logInteraction, params.lesson_id]);

  const handleForceState = (newState: "LOW" | "OPTIMAL" | "OVERLOAD") => {
    forceStateOverride(newState);
    // No need to call refetchScript manually — cognitiveState dep change
    // in useNeuroAdaptiveScript will trigger it automatically.
    logInteraction("NAV_FORWARD", {
      screen: "lesson-player",
      lesson_id: params.lesson_id,
      forced_state: newState,
    });
  };

  const handleNextSection = async () => {
    try {
      logInteraction("SECTION_END", {
        screen: "lesson-player",
        lesson_id: params.lesson_id,
        reason: "next_section",
      });
      const prediction = await triggerPrediction();
      if (prediction) {
        updateStateFromPrediction(prediction);
        // Again — no manual refetch needed. updateStateFromPrediction updates
        // neuroState.currentState → re-renders LessonPlayerScreen →
        // useNeuroAdaptiveScript gets new cognitiveState → auto re-fetches.
      }
    } catch {
      // keep current content on prediction failure
    }
  };

  const stateConfig = {
    LOW: { label: "Low Load · Deep dive", color: "#3B82F6" },
    OPTIMAL: { label: "Optimal · Balanced", color: "#22C55E" },
    OVERLOAD: { label: "High Load · Simplified", color: "#F97316" },
  } as const;

  const { label: currentStateLabel, color: stateColor } =
    stateConfig[neuroState.currentState] ?? stateConfig.OPTIMAL;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cognitive Load header */}
        <View style={styles.neuroHeaderCard}>
          <View style={styles.neuroHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.neuroLabel}>Cognitive Load</Text>
              <Text style={styles.neuroStateText}>{currentStateLabel}</Text>
            </View>
            <View
              style={[
                styles.neuroPill,
                { backgroundColor: `${stateColor}20`, borderColor: stateColor },
              ]}
            >
              <View
                style={[styles.neuroDot, { backgroundColor: stateColor }]}
              />
              <Text style={[styles.neuroPillText, { color: stateColor }]}>
                {neuroState.currentState}
              </Text>
            </View>
          </View>
          <View style={styles.neuroButtonsRow}>
            <Pressable
              style={styles.neuroButton}
              onPress={() => handleForceState("OVERLOAD")}
            >
              <Text style={styles.neuroButtonText}>Simplify me</Text>
            </Pressable>
            <Pressable
              style={styles.neuroButtonSecondary}
              onPress={() => handleForceState("LOW")}
            >
              <Text style={styles.neuroButtonSecondaryText}>Deep dive</Text>
            </Pressable>
          </View>
        </View>

        <LessonAnimationPanel
          script={adaptiveScript}
          loading={scriptLoading}
          error={scriptError}
          onRetry={refetchScript}
        />

        <View style={styles.sectionFooter}>
          <Pressable style={styles.sectionButton} onPress={handleNextSection}>
            <Text style={styles.sectionButtonText}>Next section</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles (unchanged from original) ────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%", flexDirection: "column", gap: 16 },
  sectionFooter: { marginTop: 16, alignItems: "flex-end" },
  sectionButton: {
    minWidth: 140,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionButtonText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  neuroHeaderCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  neuroHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  neuroLabel: { fontSize: 12, color: "#6B7280", textTransform: "uppercase" },
  neuroStateText: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  neuroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  neuroDot: { width: 8, height: 8, borderRadius: 4 },
  neuroPillText: { fontSize: 12, fontWeight: "600" },
  neuroButtonsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  neuroButton: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  neuroButtonText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
  neuroButtonSecondary: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  neuroButtonSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  headerCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "#667eea",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  headerMeta: { alignItems: "flex-end" },
  headerMetaLine: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  progressBarOuter: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    marginTop: 8,
  },
  progressBarInner: { height: "100%", backgroundColor: "#FFFFFF" },
  canvasCard: {
    flex: 1,
    minHeight: 300,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    overflow: "hidden",
  },
  canvasInner: { flex: 1, backgroundColor: "#f5f7fa" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.96)",
    zIndex: 10,
  },
  overlayText: { marginTop: 12, fontSize: 14, color: "#656d76" },
  errorEmoji: { fontSize: 40, marginBottom: 8 },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#da3633",
    marginBottom: 4,
    textAlign: "center",
  },
  errorMessage: { fontSize: 14, color: "#656d76", textAlign: "center" },
  emptyEmoji: { fontSize: 50, marginBottom: 8, opacity: 0.6 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2328",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyMessage: { fontSize: 14, color: "#656d76", textAlign: "center" },
  controlsCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  controlsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  controlButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e8ed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  controlButtonActive: { backgroundColor: "#667eea", borderColor: "#667eea" },
  controlButtonText: { fontSize: 14, fontWeight: "600", color: "#1f2328" },
  speedRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  speedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e1e8ed",
    backgroundColor: "#FFFFFF",
  },
  speedChipActive: { backgroundColor: "#667eea", borderColor: "#667eea" },
  speedChipText: { fontSize: 13, color: "#1f2328" },
  speedChipTextActive: { color: "#FFFFFF", fontWeight: "600" },
});
