import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AnimationCanvasNative } from "@/components/AnimationCanvasNative";
import { animationApi, sensoryEnrichApi } from "@/services/api";
import { generateQuiz, getLatestTransmutedContent } from "@/services/lessons";
import { useNeuroState } from "@/context/NeuroStateContext";
import { useAnalyticsLogger } from "@/context/AnalyticsLoggerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSensory } from "@/hooks/useSensory";
import { useNarrationPrefetch } from "@/hooks/useNarrationPrefetch";
import { BiometricBanner } from "@/components/sensory/BiometricBanner";
import { NarrationTimelineCaption } from "@/components/sensory/NarrationTimelineCaption";
import { SensoryToggle } from "@/components/sensory/SensoryToggle";
import { useSensoryStore } from "@/store/sensoryStore";
import { audioApiTimelineToSensoryOverlay } from "@/types/sensory";
import type { SensoryOverlay } from "@/types/sensory";
import { overlayFromPlaybackScript } from "@/services/narrationAudio";
import { activeAudioTimelineIndex } from "@/utils/audioTimeline";

type AnimationScript = animationApi.NeuroAdaptiveAnimationScript;
type EnrichedScript = sensoryEnrichApi.EnrichedAnimationScript;
type Scene = AnimationScript["scenes"][0];

// ─── State config ──────────────────────────────────────────────────────────
const STATE_CONFIG = {
  LOW: { label: "Low Load · Deep Dive", color: "#3B82F6", bg: "#EFF6FF" },
  OPTIMAL: { label: "Optimal · Balanced", color: "#16A34A", bg: "#F0FDF4" },
  OVERLOAD: {
    label: "High Load · Simplified",
    color: "#EA580C",
    bg: "#FFF7ED",
  },
} as const;

// ─── CTML principle chips ─────────────────────────────────────────────────────
const PRINCIPLE_COLORS: Record<string, string> = {
  coherence: "#2563EB",
  signaling: "#7C3AED",
  temporal_contiguity: "#0891B2",
  redundancy: "#059669",
  segmenting: "#D97706",
  personalization: "#DB2777",
};

function PrincipleChip({ label }: { label: string }) {
  const color = PRINCIPLE_COLORS[label] ?? "#64748B";
  return (
    <View
      style={[
        chipSt.chip,
        { backgroundColor: color + "18", borderColor: color + "44" },
      ]}
    >
      <Text style={[chipSt.text, { color }]}>{label}</Text>
    </View>
  );
}
const chipSt = StyleSheet.create({
  chip: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 3,
    marginBottom: 3,
  },
  text: {
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});

// ─── Scene thumbnail ──────────────────────────────────────────────────────────
function SceneThumbnail({
  scene,
  index,
  isActive,
  isDone,
  onPress,
}: {
  scene: Scene;
  index: number;
  isActive: boolean;
  isDone: boolean;
  onPress: () => void;
}) {
  const meta = (scene as any).meta ?? {};
  const principles: string[] = meta.ctmlPrinciples ?? [];
  const salience: string = meta.salienceLevel ?? "low";
  const salienceLevels = ["low", "moderate", "rich"];
  const salienceIdx = salienceLevels.indexOf(salience);

  return (
    <Pressable
      onPress={onPress}
      style={[
        thumbSt.card,
        isActive && thumbSt.cardActive,
        isDone && thumbSt.cardDone,
      ]}
    >
      {/* number badge */}
      <View
        style={[
          thumbSt.badge,
          isActive && thumbSt.badgeActive,
          isDone && thumbSt.badgeDone,
        ]}
      >
        <Text style={[thumbSt.badgeText, isActive && thumbSt.badgeTextActive]}>
          {isDone ? "✓" : index + 1}
        </Text>
      </View>

      {/* active pulse dot */}
      {isActive && <View style={thumbSt.pulse} />}

      {/* scene text */}
      <Text
        numberOfLines={2}
        style={[
          thumbSt.text,
          isActive && thumbSt.textActive,
          isDone && thumbSt.textDone,
        ]}
      >
        {scene.text || `Scene ${index + 1}`}
      </Text>

      {/* salience bar */}
      <View style={thumbSt.salienceRow}>
        <Text style={thumbSt.salienceLabel}>salience</Text>
        <View style={thumbSt.bars}>
          {salienceLevels.map((l, i) => (
            <View
              key={l}
              style={[
                thumbSt.bar,
                {
                  backgroundColor:
                    i === salienceIdx
                      ? "#2563EB"
                      : i < salienceIdx
                        ? "#93C5FD"
                        : "#E2E8F0",
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* CTML tag */}
      {principles.length > 0 && (
        <View style={thumbSt.chips}>
          <PrincipleChip label={principles[0]} />
          {principles.length > 1 && (
            <Text style={thumbSt.more}>+{principles.length - 1}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const thumbSt = StyleSheet.create({
  card: {
    width: 128,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 10,
  },
  cardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    shadowColor: "#2563EB",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  cardDone: { opacity: 0.5, borderColor: "#CBD5E1" },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginBottom: 6,
  },
  badgeActive: { backgroundColor: "#2563EB" },
  badgeDone: { backgroundColor: "#DCFCE7" },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#64748B" },
  badgeTextActive: { color: "#FFFFFF" },
  pulse: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
  },
  text: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  textActive: { color: "#1E3A8A", fontWeight: "700" },
  textDone: { color: "#94A3B8" },
  salienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },
  salienceLabel: {
    fontSize: 7,
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bars: { flexDirection: "row", gap: 2 },
  bar: { width: 14, height: 3, borderRadius: 2 },
  chips: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  more: { fontSize: 8, color: "#94A3B8", marginLeft: 2 },
});

// ─── Neuro equation strip ─────────────────────────────────────────────────────
function NeuroEquation({ cognitiveState }: { cognitiveState: string }) {
  const score =
    cognitiveState === "OVERLOAD"
      ? 0.85
      : cognitiveState === "OPTIMAL"
        ? 0.4
        : 0.1;
  const speed = (1 - score).toFixed(2);
  const density =
    cognitiveState === "OVERLOAD"
      ? "Minimal"
      : cognitiveState === "OPTIMAL"
        ? "Moderate"
        : "Rich";
  const principle =
    cognitiveState === "OVERLOAD"
      ? "Coherence"
      : cognitiveState === "OPTIMAL"
        ? "Segmenting"
        : "Personalization";

  return (
    <View style={eqSt.row}>
      {[
        { label: "Δt EQUATION", val: `${speed}× (1 − ${score})` },
        { label: "VISUAL DENSITY", val: density },
        { label: "CTML PRINCIPLE", val: principle },
      ].map((item) => (
        <View key={item.label} style={eqSt.pill}>
          <Text style={eqSt.label}>{item.label}</Text>
          <Text style={eqSt.val}>{item.val}</Text>
        </View>
      ))}
    </View>
  );
}
const eqSt = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 7,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  val: { fontSize: 10, fontWeight: "700", color: "#1E293B" },
});

// ─────────────────────────────────────────────────────────────────────────────
// useNeuroAdaptiveScript
// ─────────────────────────────────────────────────────────────────────────────
function useNeuroAdaptiveScript({
  lessonId,
  concept,
  studentId,
  sessionId,
  cognitiveState,
}: {
  lessonId?: string;
  concept?: string;
  studentId?: string;
  sessionId?: string | null;
  cognitiveState?: string;
}) {
  const [script, setScript] = useState<AnimationScript | null>(null);
  const [sessionMeta, setSessionMeta] =
    useState<animationApi.NeuroAdaptiveSessionFields | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastStateRef = useRef<string | undefined>(undefined);

  const fetchScript = useCallback(async () => {
    if (!studentId) {
      setScript(null);
      setSessionMeta(null);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1) Try to reuse the latest saved script (to avoid regenerating on reload)
      const latest = await animationApi.getLatestNeuroAdaptiveScript(
        studentId,
        sessionId ?? undefined,
      );

      if (latest) {
        const desiredState = cognitiveState;
        const lessonMatches =
          !lessonId || latest.lesson_id === (lessonId as string | null);
        const stateMatches =
          !desiredState || latest.cognitive_state === desiredState;

        if (lessonMatches && stateMatches) {
          lastStateRef.current = latest.cognitive_state;
          setScript(latest.script);
          setSessionMeta(animationApi.pickNeuroAdaptiveSessionFields(latest));
          return;
        }
      }

      const transmuted = await getLatestTransmutedContent(studentId, lessonId);
      if (
        !transmuted?.output?.transmuted_text ||
        !transmuted?.input?.cognitive_state
      )
        throw new Error(
          "No neuro-adaptive transmuted content found for this lesson.",
        );

      const resolvedState = cognitiveState ?? transmuted.input.cognitive_state;
      const animation = await animationApi.postNeuroAdaptiveScript({
        transmutedText: transmuted.output.transmuted_text,
        cognitiveState: resolvedState as "OVERLOAD" | "OPTIMAL" | "LOW_LOAD",
        concept: concept || transmuted.topic || transmuted.lesson_title,
        studentId,
        lessonId,
        sessionId: sessionId ?? undefined,
      });

      lastStateRef.current = resolvedState;
      setScript(animation.script);
      setSessionMeta(animationApi.pickNeuroAdaptiveSessionFields(animation));
    } catch (err: any) {
      setError(
        err?.message || "Unable to generate a visual explanation right now.",
      );
      setScript(null);
      setSessionMeta(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId, studentId, sessionId, concept, cognitiveState]);

  useEffect(() => {
    fetchScript();
  }, [fetchScript]);
  return { script, sessionMeta, loading, error, refetch: fetchScript };
}

// ─────────────────────────────────────────────────────────────────────────────
// LessonAnimationPanel
// ─────────────────────────────────────────────────────────────────────────────
export function LessonAnimationPanel({
  lessonId,
  studentId,
  sessionId,
  script,
  sessionMeta = null,
  loading,
  error,
  onRetry,
  cognitiveState = "OVERLOAD",
}: {
  lessonId?: string;
  studentId?: string;
  sessionId?: string | null;
  script: AnimationScript | null;
  /** From GET/POST neuro-adaptive — drives captions + TTS when audio_timeline is set. */
  sessionMeta?: animationApi.NeuroAdaptiveSessionFields | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  cognitiveState?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const listRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Playback script: visual script enriched with sensory (narration + haptics). Fallback to visual-only if enrich fails.
  const [playbackScript, setPlaybackScript] = useState<
    AnimationScript | EnrichedScript | null
  >(null);

  // When API provides audio_timeline, use the visual script as-is (enrich would duplicate narration).
  // Otherwise POST /sensory/enrich-script for per-scene narration + haptics.
  useEffect(() => {
    if (!script) {
      setPlaybackScript(null);
      return;
    }
    if (sessionMeta?.audio_timeline && sessionMeta.audio_timeline.length > 0) {
      setPlaybackScript(script);
      return;
    }
    setPlaybackScript(script);
    const cognitiveStateWire = cognitiveState as
      | "OVERLOAD"
      | "OPTIMAL"
      | "LOW_LOAD";
    sensoryEnrichApi
      .enrichScript({
        script,
        cognitive_state: cognitiveStateWire,
      })
      .then((enriched) => {
        setPlaybackScript(enriched);
      })
      .catch(() => {
        // Fallback: keep visual-only script; no narration/haptics
      });
  }, [script, cognitiveState, sessionMeta]);

  // Reset on new script
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveSceneIdx(0);
  }, [script]);

  const apiSessionSensoryOverlay = useMemo((): SensoryOverlay | undefined => {
    if (!lessonId || !sessionMeta?.audio_timeline?.length) return undefined;
    const o = audioApiTimelineToSensoryOverlay({
      lessonId,
      audioTimeline: sessionMeta.audio_timeline,
      speechRate: sessionMeta.speech_rate,
      cognitiveState,
      hapticTimeline: sessionMeta.haptic_timeline,
      ambientMode: sessionMeta.ambient_mode,
    });
    return o ?? undefined;
  }, [lessonId, sessionMeta, cognitiveState]);

  const prefetchSensoryOverlay = useMemo((): SensoryOverlay | null => {
    return (
      apiSessionSensoryOverlay ??
      overlayFromPlaybackScript(playbackScript) ??
      null
    );
  }, [apiSessionSensoryOverlay, playbackScript]);

  // Member 3 – wall-clock lessonElapsedMs; session audio_timeline overlay when present, else enrich / GET overlay.
  useSensory({
    lessonId: lessonId ?? "",
    studentId,
    sessionId: sessionId ?? undefined,
    script: playbackScript,
    cognitiveState,
    animationClock: {
      currentTimeMs: currentTime,
      isPlaying,
    },
    sessionSensoryOverlay: apiSessionSensoryOverlay,
  });

  // Ticker
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!playbackScript || !isPlaying) return;

    const step = 100 * speedFactor;

    intervalRef.current = setInterval(() => {
      setCurrentTime((t) => {
        const next = Math.min(playbackScript.duration, t + step);
        const idx = playbackScript.scenes.findIndex(
          (s) => next >= s.startTime && next < s.startTime + s.duration,
        );
        if (idx !== -1 && idx !== activeSceneIdx) {
          setActiveSceneIdx(idx);
          try {
            listRef.current?.scrollToIndex({
              index: idx,
              animated: true,
              viewOffset: 10,
            });
          } catch {}
        }
        if (next >= playbackScript.duration) setIsPlaying(false);
        return next;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playbackScript, isPlaying, activeSceneIdx]);

  const jumpToScene = (idx: number) => {
    if (!playbackScript) return;
    setActiveSceneIdx(idx);
    setCurrentTime(playbackScript.scenes[idx].startTime);
    try {
      listRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewOffset: 10,
      });
    } catch {}
  };

  const progress = playbackScript
    ? Math.min(100, (currentTime / playbackScript.duration) * 100)
    : 0;
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const currentScene = playbackScript?.scenes[activeSceneIdx] ?? null;
  const stateConf =
    STATE_CONFIG[cognitiveState as keyof typeof STATE_CONFIG] ??
    STATE_CONFIG.OVERLOAD;

  /** Spoken/caption line: audio_timeline interval only when API sends it — never scene text in gaps. */
  const lessonCaptionPrimary = useMemo(() => {
    if (sessionMeta?.audio_timeline && sessionMeta.audio_timeline.length > 0) {
      const idx = activeAudioTimelineIndex(
        currentTime,
        sessionMeta.audio_timeline,
      );
      if (idx !== null) {
        return String(sessionMeta.audio_timeline[idx].text ?? "").trim();
      }
      return "";
    }
    return String(currentScene?.text ?? "").trim();
  }, [sessionMeta, currentTime, currentScene]);

  const speedFactor =
    cognitiveState === "OVERLOAD"
      ? 0.4
      : cognitiveState === "OPTIMAL"
        ? 0.75
        : 1.2;
  const speedLabel = `${speedFactor.toFixed(2)}×`;

  const narrationPrefetch = useNarrationPrefetch(prefetchSensoryOverlay);
  const sensoryAudioOn = useSensoryStore((s) => s.audioEnabled);

  return (
    <View style={panelSt.root}>
      {/* ── Header row ── */}
      {playbackScript && (
        <View style={panelSt.headerRow}>
          <BiometricBanner />
          <Text style={panelSt.titleText} numberOfLines={1}>
            {playbackScript.title || "Animation"}
          </Text>
          <View style={panelSt.timerBox}>
            <Text style={panelSt.timerText}>
              {formatTime(currentTime)} / {formatTime(playbackScript.duration)}
            </Text>
          </View>
        </View>
      )}

      {/* ── Main canvas ── */}
      <View style={panelSt.canvasWrap}>
        {loading && (
          <View style={panelSt.overlay}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={panelSt.overlayTitle}>Adapting visuals…</Text>
            <Text style={panelSt.overlaySub}>
              Applying {stateConf.label.split("·")[1]?.trim() ?? ""} principle
            </Text>
          </View>
        )}
        {error && !loading && (
          <View style={panelSt.overlay}>
            <Text style={{ fontSize: 34, marginBottom: 8 }}>⚠️</Text>
            <Text style={panelSt.errorTitle}>Animation Error</Text>
            <Text style={panelSt.errorMsg}>{error}</Text>
            {onRetry && (
              <Pressable style={panelSt.retryBtn} onPress={onRetry}>
                <Text style={panelSt.retryText}>Try again</Text>
              </Pressable>
            )}
          </View>
        )}
        {!script && !error && !loading && (
          <View style={panelSt.overlay}>
            <Text style={{ fontSize: 42, marginBottom: 8, opacity: 0.45 }}>
              🎬
            </Text>
            <Text style={panelSt.emptyTitle}>No Animation Loaded</Text>
            <Text style={panelSt.emptySub}>
              Enter a concept to generate an animation
            </Text>
          </View>
        )}

        {script && !error && (
          <>
            <AnimationCanvasNative
              isPlaying={isPlaying}
              script={playbackScript}
              currentTimeMs={currentTime}
            />
          </>
        )}

        {/* Bottom progress bar */}
        {playbackScript && (
          <View style={panelSt.progressBar}>
            <View
              style={[panelSt.progressFill, { width: `${progress}%` as any }]}
            />
          </View>
        )}
      </View>

      {/* ── Caption: audio_timeline[n].text when in [at, at+duration); else scene text (no API timeline). ── */}
      {playbackScript && !loading && !error && (
        <View style={panelSt.sceneNarration}>
          <View style={panelSt.sceneNumPill}>
            <Text style={panelSt.sceneNumText}>
              {activeSceneIdx + 1}/{playbackScript.scenes.length}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {lessonCaptionPrimary.length > 0 ? (
              <Text style={panelSt.sceneNarrationText}>
                {lessonCaptionPrimary}
              </Text>
            ) : sessionMeta?.audio_timeline?.length ? (
              <Text style={panelSt.sceneBetweenCue}>
                Between narration clips…
              </Text>
            ) : (
              <Text style={panelSt.sceneNarrationText}>
                {currentScene?.text ?? ""}
              </Text>
            )}
            {sessionMeta?.audio_timeline &&
              sessionMeta.audio_timeline.length > 0 &&
              currentScene?.text &&
              lessonCaptionPrimary !== String(currentScene.text).trim() && (
                <Text style={panelSt.sceneVisualCue} numberOfLines={2}>
                  Visual · Scene {activeSceneIdx + 1}: {currentScene.text}
                </Text>
              )}
          </View>
        </View>
      )}

      {playbackScript && !loading && !error && narrationPrefetch.overlay && (
        <NarrationTimelineCaption
          overlay={narrationPrefetch.overlay}
          currentTimeMs={currentTime}
          segmentStates={narrationPrefetch.segmentStates}
          audioEnabled={sensoryAudioOn}
        />
      )}

      {playbackScript &&
        !loading &&
        !error &&
        sensoryAudioOn &&
        narrationPrefetch.hasNarration &&
        narrationPrefetch.prefetchPhase === "error" && (
          <View style={panelSt.prefetchErrRow}>
            <Text style={panelSt.prefetchErrText}>
              {narrationPrefetch.playDisabledReason ?? "Narration failed"}
            </Text>
            <Pressable
              style={panelSt.prefetchRetry}
              onPress={() => void narrationPrefetch.retryPrefetch()}
            >
              <Text style={panelSt.prefetchRetryText}>Retry</Text>
            </Pressable>
          </View>
        )}

      {/* ── Controls ── */}
      {playbackScript && (
        <View style={panelSt.controls}>
          {sensoryAudioOn &&
            narrationPrefetch.hasNarration &&
            narrationPrefetch.prefetchPhase === "loading" && (
              <View style={panelSt.prefetchSpinner}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={panelSt.prefetchHint}>Preparing narration…</Text>
              </View>
            )}
          <Pressable
            disabled={!narrationPrefetch.canStartPlayback}
            style={[
              panelSt.btn,
              isPlaying && panelSt.btnActive,
              !narrationPrefetch.canStartPlayback && panelSt.btnMuted,
            ]}
            onPress={() => {
              if (!narrationPrefetch.canStartPlayback) return;
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                if (currentTime >= (playbackScript.duration ?? 0)) setCurrentTime(0);
                setIsPlaying(true);
              }
            }}
          >
            <Text style={[panelSt.btnText, isPlaying && panelSt.btnTextActive]}>
              {isPlaying ? "⏸  Pause" : "▶  Play"}
            </Text>
          </Pressable>
          <Pressable
            style={panelSt.btn}
            onPress={() => {
              setCurrentTime(0);
              setActiveSceneIdx(0);
              setIsPlaying(true);
            }}
          >
            <Text style={panelSt.btnText}>↺ Reset</Text>
          </Pressable>
          <SensoryToggle />
          <View style={panelSt.speedBox}>
            <Text style={panelSt.speedBoxLabel}>SPEED</Text>
            <Text style={panelSt.speedBoxVal}>{speedLabel}</Text>
          </View>
        </View>
      )}

      {/* ── Neuro equation ── */}
      {playbackScript && <NeuroEquation cognitiveState={cognitiveState} />}

      {/* ── Scene thumbnail strip ── */}
      {playbackScript && playbackScript.scenes.length > 0 && (
        <View style={panelSt.stripWrap}>
          <View style={panelSt.stripHead}>
            <Text style={panelSt.stripTitle}>SCENES</Text>
            <Text style={panelSt.stripSub}>
              Tap to jump · Temporal Contiguity — one bullet at a time
            </Text>
          </View>
          <FlatList
            ref={listRef}
            data={playbackScript.scenes}
            horizontal
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item, index }) => (
              <SceneThumbnail
                scene={item}
                index={index}
                isActive={index === activeSceneIdx}
                isDone={index < activeSceneIdx}
                onPress={() => jumpToScene(index)}
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

// ─── Panel styles ──────────────────────────────────────────────────────────────
const panelSt = StyleSheet.create({
  root: { width: "100%", gap: 12 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  stateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  stateDot: { width: 7, height: 7, borderRadius: 3.5 },
  stateLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  titleText: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1F2937" },
  timerBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerText: { fontSize: 10, fontWeight: "600", color: "#64748B" },

  canvasWrap: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#0F172A",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(248,250,255,0.97)",
    zIndex: 10,
  },
  overlayTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  overlaySub: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 4,
  },
  errorMsg: { fontSize: 13, color: "#64748B", textAlign: "center" },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },
  retryText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },

  sceneNarration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sceneNumPill: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 32,
    alignItems: "center",
  },
  sceneNumText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  sceneNarrationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 20,
  },
  sceneVisualCue: {
    marginTop: 6,
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 15,
  },
  sceneBetweenCue: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#94A3B8",
  },

  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(37,99,235,0.12)",
  },
  progressFill: { height: "100%", backgroundColor: "#2563EB", borderRadius: 2 },

  controls: { flexDirection: "row", gap: 10, alignItems: "center" },
  btn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  btnActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  btnText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  btnTextActive: { color: "#FFFFFF" },
  btnMuted: { opacity: 0.45 },
  prefetchSpinner: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 4,
  },
  prefetchHint: {
    marginLeft: 6,
    fontSize: 11,
    color: "#64748B",
    maxWidth: 120,
  },
  prefetchErrRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  prefetchErrText: { flex: 1, fontSize: 12, color: "#991B1B", marginRight: 8 },
  prefetchRetry: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#DC2626",
    borderRadius: 8,
  },
  prefetchRetryText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  speedBox: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  speedBoxLabel: {
    fontSize: 7,
    color: "#94A3B8",
    letterSpacing: 1.5,
    fontWeight: "800",
  },
  speedBoxVal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 1,
  },

  stripWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingTop: 12,
    paddingBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  stripHead: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 14,
    marginBottom: 2,
    gap: 8,
  },
  stripTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  stripSub: { fontSize: 9, color: "#94A3B8", flex: 1 },
});

// ─────────────────────────────────────────────────────────────────────────────
// LessonPlayerScreen
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

  const { script, sessionMeta, loading, error, refetch } = useNeuroAdaptiveScript({
    lessonId: params.lesson_id,
    studentId: user?.id,
    sessionId: undefined,
    cognitiveState: neuroState.currentState,
  });

  useEffect(() => {
    logInteraction("SECTION_START", {
      screen: "lesson-player",
      lesson_id: params.lesson_id,
    });
    return () =>
      logInteraction("SECTION_END", {
        screen: "lesson-player",
        lesson_id: params.lesson_id,
      });
  }, [logInteraction, params.lesson_id]);

  const handleForceState = (newState: "LOW_LOAD" | "OPTIMAL" | "OVERLOAD") => {
    forceStateOverride(newState);
    logInteraction("NAV_FORWARD", {
      screen: "lesson-player",
      forced_state: newState,
    });
  };

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleTestYourself = async () => {
    if (!params.lesson_id) return;
    setIsGeneratingQuiz(true);
    try {
      logInteraction("SECTION_END", {
        screen: "lesson-player",
        reason: "test_yourself",
      });
      const quiz = await generateQuiz({ lesson_id: params.lesson_id });
      router.push({
        pathname: "/lessons/quiz",
        params: {
          quiz_id: quiz.id,
          lesson_id: params.lesson_id,
        },
      });
    } catch {
      /* TODO: show error to user */
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const stateConf =
    STATE_CONFIG[neuroState.currentState as keyof typeof STATE_CONFIG] ??
    STATE_CONFIG.OPTIMAL;

  return (
    <SafeAreaView style={screenSt.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={screenSt.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cognitive state header */}
        {/* <View style={screenSt.neuroCard}>
          <View style={screenSt.neuroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={screenSt.neuroSmall}>Cognitive Load</Text>
              <Text style={[screenSt.neuroState, { color: stateConf.color }]}>
                {stateConf.label}
              </Text>
            </View>
            <View
              style={[
                screenSt.neuroPill,
                {
                  backgroundColor: stateConf.bg,
                  borderColor: stateConf.color + "55",
                },
              ]}
            >
              <View
                style={[
                  screenSt.neuroDot,
                  { backgroundColor: stateConf.color },
                ]}
              />
              <Text
                style={[screenSt.neuroPillText, { color: stateConf.color }]}
              >
                {neuroState.currentState}
              </Text>
              {neuroState.isForced && (
                <Text style={[screenSt.forcedTag, { color: stateConf.color }]}>
                  FORCED
                </Text>
              )}
            </View>
          </View>
          <View style={screenSt.neuroActions}>
            <Pressable
              style={screenSt.btnDark}
              onPress={() => handleForceState("OVERLOAD")}
            >
              <Text style={screenSt.btnDarkText}>🧠 Simplify me</Text>
            </Pressable>
            <Pressable
              style={screenSt.btnGhost}
              onPress={() => handleForceState("LOW_LOAD")}
            >
              <Text style={screenSt.btnGhostText}>🔍 Deep dive</Text>
            </Pressable>
          </View>
        </View> */}

        {/* Animation panel */}
        <LessonAnimationPanel
          lessonId={params.lesson_id}
          studentId={user?.id}
          sessionId={undefined}
          script={script}
          sessionMeta={sessionMeta}
          loading={loading}
          error={error}
          onRetry={refetch}
          cognitiveState={neuroState.currentState}
        />

        {/* Test yourself */}
        <View style={screenSt.footer}>
          <Pressable
            style={[
              screenSt.nextBtn,
              isGeneratingQuiz && screenSt.nextBtnDisabled,
            ]}
            onPress={handleTestYourself}
            disabled={!params.lesson_id || isGeneratingQuiz}
          >
            {isGeneratingQuiz ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={screenSt.nextBtnText}>Test yourself</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenSt = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F1F5F9" },
  scroll: { padding: 16, paddingBottom: 48, gap: 14 },
  neuroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  neuroTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  neuroSmall: {
    fontSize: 10,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  neuroState: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  neuroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  neuroDot: { width: 8, height: 8, borderRadius: 4 },
  neuroPillText: { fontSize: 11, fontWeight: "700" },
  forcedTag: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 2,
    opacity: 0.7,
  },
  neuroActions: { flexDirection: "row", gap: 10 },
  btnDark: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDarkText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  btnGhost: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  footer: { alignItems: "flex-end" },
  nextBtn: {
    minWidth: 150,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  nextBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  nextBtnDisabled: { opacity: 0.7 },
});
