import React, { useEffect, useState } from "react";
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
import { exampleUsage } from "@/animation/scriptGenerator";
import { useNeuroState } from "@/context/NeuroStateContext";
import { useAnalyticsLogger } from "@/context/AnalyticsLoggerContext";
import { neuroApi } from "@/services/api";

type AnimationScript = {
  title?: string;
  duration: number;
  scenes: {
    id: string;
    startTime: number;
    duration: number;
    text?: string;
  }[];
};

type LessonAnimationPanelProps = {
  /** Engine‑ready script (same JSON as web) */
  script: AnimationScript | null;
};

export function LessonAnimationPanel({ script }: LessonAnimationPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState<
    AnimationScript["scenes"][0] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // NOTE: For now we don’t have a direct time callback from AnimationEngine.
  // You can later expose one from AnimationCanvasNative and update currentTime there.
  useEffect(() => {
    if (!script) {
      setIsPlaying(false);
      setSpeed(1);
      setCurrentTime(0);
      setCurrentScene(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Simple derived current scene based on currentTime
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const next = Math.min(script.duration, t + 100);
        const scene = script.scenes.find(
          (s) => next >= s.startTime && next < s.startTime + s.duration,
        );
        setCurrentScene(scene || null);
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [script]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    // TODO: expose setSpeed from AnimationCanvasNative and pass newSpeed down
  };

  const progress = script
    ? Math.min(100, (currentTime / script.duration) * 100)
    : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
              {currentScene && currentScene.text ? (
                <Text style={styles.headerSubtitle}>{currentScene.text}</Text>
              ) : null}
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaLine}>
                Scene{" "}
                {script.scenes.findIndex((s) => s === currentScene) + 1 || 0} /{" "}
                {script.scenes.length}
              </Text>
              <Text style={styles.headerMetaLine}>
                {formatTime(currentTime)} / {formatTime(script.duration)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarOuter}>
            <View
              style={[styles.progressBarInner, { width: `${progress}%` }]}
            />
          </View>
        </View>
      )}

      {/* Canvas Container */}
      <View style={styles.canvasCard}>
        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.overlayText}>Loading animation...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.overlay}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Animation Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!script && !error && !isLoading && (
          <View style={styles.overlay}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>No Animation Loaded</Text>
            <Text style={styles.emptyMessage}>
              Enter a concept to generate an animation
            </Text>
          </View>
        )}

        {/* Canvas */}
        {script && !error && (
          <View style={styles.canvasInner}>
            <AnimationCanvasNative isPlaying={isPlaying} />
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
              onPress={isPlaying ? handlePause : handlePlay}
            >
              <Text style={styles.controlButtonText}>
                {isPlaying ? "Pause" : "Play"}
              </Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={handleReset}>
              <Text style={styles.controlButtonText}>Reset</Text>
            </Pressable>
          </View>
          {/* Simple speed presets; you can replace with Slider if you like */}
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

type LoadState = "LOW" | "OPTIMAL" | "OVERLOAD";

type AdaptiveContent = {
  title?: string;
  body?: string;
  bullets?: string[];
};

// Default screen component for /lessons/lesson-player route
export default function LessonPlayerScreen() {
  const params = useLocalSearchParams<{ lesson_id?: string }>();
  const { state: neuroState, forceStateOverride, updateStateFromPrediction } =
    useNeuroState();
  const { logInteraction, triggerPrediction } = useAnalyticsLogger();

  const [content, setContent] = useState<AdaptiveContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // TODO: use lesson_id and backend to fetch a real script.
  // For now we use the local example script from scriptGenerator.
  const demoScript = exampleUsage() as AnimationScript;

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

  useEffect(() => {
    const fetchAdaptiveContent = async (stateToUse: LoadState) => {
      if (!params.lesson_id) return;
      setContentLoading(true);
      setContentError(null);
      try {
        const response: any = await neuroApi.nextContent({
          lesson_id: params.lesson_id,
          state: stateToUse,
        });

        const base = response?.content ?? response ?? {};
        const mapped: AdaptiveContent = {
          title: base.title,
          body: base.body ?? base.text,
          bullets:
            base.bullets ?? base.bullet_points ?? base.points ?? undefined,
        };
        setContent(mapped);
      } catch (error: any) {
        setContentError(error?.message || "Unable to load adaptive content.");
      } finally {
        setContentLoading(false);
      }
    };

    fetchAdaptiveContent(neuroState.currentState as LoadState);
  }, [neuroState.currentState, params.lesson_id]);

  const handleForceState = (newState: LoadState) => {
    forceStateOverride(newState);
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
      }
    } catch {
      // If prediction fails, keep current content; the loop will continue on next interactions
    }
  };

  const currentStateLabel =
    neuroState.currentState === "LOW"
      ? "Low Load · Deep dive"
      : neuroState.currentState === "OVERLOAD"
        ? "High Load · Simplified"
        : "Optimal · Balanced";

  const stateColor =
    neuroState.currentState === "LOW"
      ? "#3B82F6"
      : neuroState.currentState === "OVERLOAD"
        ? "#F97316"
        : "#22C55E";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Neuro-adaptive state header */}
        <View style={styles.neuroHeaderCard}>
          <View style={styles.neuroHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.neuroLabel}>Cognitive Load</Text>
              <Text style={styles.neuroStateText}>{currentStateLabel}</Text>
            </View>
            <View
              style={[
                styles.neuroPill,
                {
                  backgroundColor: `${stateColor}20`,
                  borderColor: stateColor,
                },
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

        {/* Adaptive content block */}
        <View style={styles.contentCard}>
          {contentLoading && (
            <View style={styles.contentLoadingRow}>
              <ActivityIndicator size="small" color="#667eea" />
              <Text style={styles.contentLoadingText}>
                Adapting this lesson to your brain…
              </Text>
            </View>
          )}
          {contentError && !contentLoading && (
            <Text style={styles.contentErrorText}>{contentError}</Text>
          )}
          {!contentLoading && !contentError && (
            <>
              <Text style={styles.contentTitle}>
                {content?.title || "Transmuted Story"}
              </Text>
              {content?.body && (
                <Text style={styles.contentBody}>{content.body}</Text>
              )}
              {content?.bullets && content.bullets.length > 0 && (
                <View style={styles.bulletsList}>
                  {content.bullets.map((point, idx) => (
                    <View key={`${idx}-${point}`} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <LessonAnimationPanel script={demoScript} />

        {/* Section-level Next action to advance the Neuro-Adaptive Loop */}
        <View style={styles.sectionFooter}>
          <Pressable
            style={[
              styles.sectionButton,
              contentLoading && { opacity: 0.6 },
            ]}
            disabled={contentLoading}
            onPress={handleNextSection}
          >
            <Text style={styles.sectionButtonText}>Next section</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "column",
    gap: 16,
  },
  sectionFooter: {
    marginTop: 16,
    alignItems: "flex-end",
  },
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
  sectionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
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
  neuroLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
  },
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
  neuroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  neuroPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  neuroButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  neuroButton: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  neuroButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
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
  contentCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    gap: 8,
  },
  contentLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contentLoadingText: {
    fontSize: 13,
    color: "#4B5563",
  },
  contentErrorText: {
    fontSize: 13,
    color: "#B91C1C",
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  contentBody: {
    marginTop: 4,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  bulletsList: {
    marginTop: 8,
    gap: 6,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B7280",
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
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
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  headerMeta: {
    alignItems: "flex-end",
  },
  headerMetaLine: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  progressBarOuter: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    marginTop: 8,
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  canvasCard: {
    flex: 1,
    minHeight: 300,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    overflow: "hidden",
  },
  canvasInner: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.96)",
    zIndex: 10,
  },
  overlayText: {
    marginTop: 12,
    fontSize: 14,
    color: "#656d76",
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#da3633",
    marginBottom: 4,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#656d76",
    textAlign: "center",
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2328",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 14,
    color: "#656d76",
    textAlign: "center",
  },
  controlsCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
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
  controlButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2328",
  },
  speedRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  speedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e1e8ed",
    backgroundColor: "#FFFFFF",
  },
  speedChipActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  speedChipText: {
    fontSize: 13,
    color: "#1f2328",
  },
  speedChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
