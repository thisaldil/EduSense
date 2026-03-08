/**
 * BrainSyncScreen v2  —  Grade 6 Cognitive Calibration
 *
 * Designed for 11–12 year olds:
 *   • Big tap targets, friendly language, emoji cues
 *   • No jargon ("Brain Sync" not "Calibration")
 *   • Real plant diagram for Task 2 (tap Leaf vs Root)
 *   • 3-round sensory task averaged for reliability
 *   • CLI (Cognitive Load Index) computed client-side
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
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
import { router } from "expo-router";

import { Colors, Typography } from "@/constants/theme";
import { useAnalyticsLogger } from "@/context/AnalyticsLoggerContext";
import { useNeuroState } from "@/context/NeuroStateContext";
import { neuroApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const IDLE_THRESHOLD_MS = 3500; // slightly more forgiving for kids
const SENTENCE_DISPLAY_MS = 5000;
const PULSE_ROUNDS = 3;
const MIN_PULSE_DELAY_MS = 800;
const MAX_PULSE_DELAY_MS = 2000;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type TaskMetrics = {
  taskId: "nlp" | "visual" | "sensory";
  answerChanges: number;
  currentErrorStreak: number;
  totalScore: number;
  accuracyRate: number;
  errors: number;
  idleGapsOverThreshold: number;
  responseTimeVariability: number;
  completionTime: number;
  avgResponseTime: number;
};

export type CognitiveLoadSummary = {
  cli: number; // 0–100, higher = more cognitive load
  dominantChannel: "nlp" | "visual" | "sensory";
  overloadSignal: boolean; // cli > 65
  perTask: Record<string, number>;
};

type TaskProps = { onComplete: (m: TaskMetrics) => void };

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const computeTimingStats = (
  times: number[],
): { avg: number; variability: number } => {
  if (times.length === 0) return { avg: 0, variability: 0 };
  const avg = times.reduce((s, t) => s + t, 0) / times.length;
  if (times.length === 1) return { avg, variability: 0 };
  const variance = times.reduce((s, t) => s + (t - avg) ** 2, 0) / times.length;
  return { avg, variability: Math.sqrt(variance) };
};

const scoreTask = (m: TaskMetrics): number => {
  const rt = Math.min(m.avgResponseTime / 4000, 1);
  const varS = Math.min(m.responseTimeVariability / 2000, 1);
  const idle = Math.min(m.idleGapsOverThreshold / 5, 1);
  const err = Math.min(m.errors / 3, 1);
  const chg = Math.min(m.answerChanges / 3, 1);
  const acc = m.accuracyRate;
  const raw =
    rt * 0.25 + varS * 0.2 + idle * 0.2 + err * 0.2 + chg * 0.05 - acc * 0.1;
  return Math.round(Math.max(0, Math.min(1, raw)) * 100);
};

const computeCLI = (metrics: TaskMetrics[]): CognitiveLoadSummary => {
  const perTask: Record<string, number> = {};
  metrics.forEach((m) => {
    perTask[m.taskId] = scoreTask(m);
  });
  const scores = Object.values(perTask);
  const cli = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const dominant = Object.entries(perTask).reduce((a, b) =>
    b[1] > a[1] ? b : a,
  );
  return {
    cli,
    dominantChannel: dominant[0] as CognitiveLoadSummary["dominantChannel"],
    overloadSignal: cli > 65,
    perTask,
  };
};

// ─────────────────────────────────────────────────────────────
// Shared: useIdleTracker
// ─────────────────────────────────────────────────────────────

const useIdleTracker = (active = true) => {
  const [gaps, setGaps] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (!active) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGaps((n) => n + 1);
      reset();
    }, IDLE_THRESHOLD_MS);
  }, [active]);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (active) reset();
    return stop;
  }, [active, reset, stop]);

  return { gaps, reset, stop };
};

// ─────────────────────────────────────────────────────────────
// Task 1 · NLP — Reading & Recall
// ─────────────────────────────────────────────────────────────

const NLPTask: React.FC<TaskProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"read" | "answer">("read");
  const [countdown, setCountdown] = useState(5);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerChanges, setChanges] = useState(0);
  const [done, setDone] = useState(false);

  const taskStart = useRef(Date.now());
  const shownAt = useRef<number | null>(null);
  const tapTimes = useRef<number[]>([]);
  const {
    gaps,
    reset: resetIdle,
    stop: stopIdle,
  } = useIdleTracker(phase === "answer");

  // Countdown timer
  useEffect(() => {
    if (phase !== "read") return;
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          shownAt.current = Date.now();
          setPhase("answer");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const handleSelect = (idx: number) => {
    if (done) return;
    resetIdle();
    if (selected !== null && selected !== idx) setChanges((n) => n + 1);
    setSelected(idx);
    if (shownAt.current) tapTimes.current.push(Date.now() - shownAt.current);
  };

  const handleConfirm = () => {
    if (selected === null || done) return;
    stopIdle();
    setDone(true);

    const CORRECT = 1; // "Autotrophs"
    const correct = selected === CORRECT;
    const { avg, variability } = computeTimingStats(tapTimes.current);

    onComplete({
      taskId: "nlp",
      answerChanges,
      currentErrorStreak: correct ? 0 : 1,
      totalScore: correct ? 1 : 0,
      accuracyRate: correct ? 1 : 0,
      errors: correct ? 0 : 1,
      idleGapsOverThreshold: gaps,
      responseTimeVariability: variability,
      completionTime: Date.now() - taskStart.current,
      avgResponseTime: avg,
    });
  };

  const options = ["Decomposers", "Autotrophs", "Predators"];

  return (
    <View style={s.taskCard}>
      <View style={s.taskHeader}>
        <View style={[s.taskBadge, { backgroundColor: "#FFF7ED" }]}>
          <Text style={[s.taskBadgeText, { color: "#C2410C" }]}>📖 Task 1</Text>
        </View>
        <Text style={s.taskTitle}>Quick Memory Check</Text>
      </View>

      {phase === "read" ? (
        <View style={s.sentenceBox}>
          <Text style={s.sentenceText}>
            Plants are called <Text style={s.highlight}>autotrophs</Text>{" "}
            because they make their own food using sunlight, water, and air. 🌿
          </Text>
          <View style={s.countdownRow}>
            <Text style={s.countdownLabel}>Disappears in</Text>
            <Text style={s.countdownNum}>{countdown}s</Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={s.questionText}>
            🤔 What do we call plants that make their own food?
          </Text>
          <View style={s.optionsCol}>
            {options.map((opt, idx) => (
              <Pressable
                key={opt}
                style={[s.optBtn, selected === idx && s.optBtnSelected]}
                onPress={() => handleSelect(idx)}
              >
                <Text
                  style={[s.optText, selected === idx && s.optTextSelected]}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[s.primaryBtn, selected === null && s.btnDisabled]}
            disabled={selected === null}
            onPress={handleConfirm}
          >
            <Text style={s.primaryBtnText}>That's my answer ✓</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Task 2 · Visual — Plant Diagram Tap (Leaf vs Root)
// ─────────────────────────────────────────────────────────────

/**
 * Uses the real "Parts of a Plant" diagram.
 * The image is 576×610 px. We render it at a fixed display width
 * and place invisible tap-zone <Pressable>s over the correct labels.
 *
 * Layout (approximate % of display width 320px):
 *   Leaf label  → top-left,  ~x:2%,  y:28%,  w:22%, h:8%
 *   Root label  → bot-left,  ~x:2%,  y:82%,  w:22%, h:8%
 *   Flower      → top-right, ~x:62%, y:14%,  w:28%, h:8%
 *   Stem        → mid-left,  ~x:16%, y:58%,  w:18%, h:8%
 *   Fruit       → mid-right, ~x:58%, y:52%,  w:18%, h:8%
 *
 * Task: The student must tap the label shown in `target` (Leaf or Root).
 * We alternate targets across rounds for more signal.
 */

type PlantZone = {
  label: string;
  left: `${number}%`;
  top: `${number}%`;
  width: `${number}%`;
  height: `${number}%`;
  isTarget: boolean;
};

const ROUNDS: Array<{ target: "Leaf" | "Root" }> = [
  { target: "Leaf" },
  { target: "Root" },
  { target: "Leaf" },
];

const buildZones = (target: "Leaf" | "Root"): PlantZone[] => [
  {
    label: "Leaf",
    left: "1%",
    top: "27%",
    width: "24%",
    height: "9%",
    isTarget: target === "Leaf",
  },
  {
    label: "Root",
    left: "1%",
    top: "80%",
    width: "24%",
    height: "9%",
    isTarget: target === "Root",
  },
  {
    label: "Flower",
    left: "60%",
    top: "13%",
    width: "30%",
    height: "9%",
    isTarget: false,
  },
  {
    label: "Stem",
    left: "14%",
    top: "57%",
    width: "20%",
    height: "8%",
    isTarget: false,
  },
  {
    label: "Fruit",
    left: "57%",
    top: "51%",
    width: "20%",
    height: "8%",
    isTarget: false,
  },
];

const VisualTask: React.FC<TaskProps> = ({ onComplete }) => {
  const [round, setRound] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const taskStart = useRef(Date.now());
  const roundAt = useRef(Date.now());
  const tapTimes = useRef<number[]>([]);
  const errPerRound = useRef<number[]>([]);
  const { gaps, reset: resetIdle, stop: stopIdle } = useIdleTracker(!done);

  const currentTarget = ROUNDS[round]?.target ?? "Leaf";
  const zones = buildZones(currentTarget);

  const handleTap = (zone: PlantZone) => {
    if (done || feedback !== null) return;
    resetIdle();

    const rt = Date.now() - roundAt.current;

    if (zone.isTarget) {
      tapTimes.current.push(rt);
      errPerRound.current.push(0);
      setFeedback("correct");

      setTimeout(() => {
        setFeedback(null);
        const nextRound = round + 1;
        if (nextRound >= ROUNDS.length) {
          stopIdle();
          setDone(true);
          const { avg, variability } = computeTimingStats(tapTimes.current);
          const totalErrors = errors;
          const accuracy =
            tapTimes.current.length / (tapTimes.current.length + totalErrors);
          onComplete({
            taskId: "visual",
            answerChanges: 0,
            currentErrorStreak: totalErrors > 0 ? 1 : 0,
            totalScore: Math.max(0, 1 - totalErrors * 0.2),
            accuracyRate: accuracy,
            errors: totalErrors,
            idleGapsOverThreshold: gaps,
            responseTimeVariability: variability,
            completionTime: Date.now() - taskStart.current,
            avgResponseTime: avg,
          });
        } else {
          setRound(nextRound);
          roundAt.current = Date.now();
        }
      }, 600);
    } else {
      tapTimes.current.push(rt);
      setErrors((n) => n + 1);
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        roundAt.current = Date.now(); // reset RT for retry
      }, 500);
    }
  };

  const IMG_W = 300;
  const IMG_H = Math.round(300 * (610 / 576)); // maintain aspect ratio ≈ 318

  return (
    <View style={s.taskCard}>
      <View style={s.taskHeader}>
        <View style={[s.taskBadge, { backgroundColor: "#F0FDF4" }]}>
          <Text style={[s.taskBadgeText, { color: "#166534" }]}>🌿 Task 2</Text>
        </View>
        <Text style={s.taskTitle}>Find the Part!</Text>
      </View>

      {/* Round indicator */}
      <View style={s.roundRow}>
        {ROUNDS.map((_, i) => (
          <View
            key={i}
            style={[
              s.roundDot,
              i < round && s.roundDotDone,
              i === round && s.roundDotActive,
            ]}
          />
        ))}
        <Text style={s.roundLabel}>
          Round {round + 1} of {ROUNDS.length}
        </Text>
      </View>

      {/* Target instruction */}
      <View
        style={[
          s.targetBanner,
          feedback === "correct" && s.targetBannerCorrect,
          feedback === "wrong" && s.targetBannerWrong,
        ]}
      >
        <Text style={s.targetText}>
          {feedback === "correct"
            ? "✅  Great job!"
            : feedback === "wrong"
              ? "❌  Not quite — try again!"
              : `👉  Tap the  "${currentTarget}"`}
        </Text>
      </View>

      {/* Plant diagram with tap zones */}
      <View style={[s.diagramWrap, { width: IMG_W, height: IMG_H }]}>
        <Image
          source={require("@/assets/images/parts-of-a-plant.png")}
          style={{ width: IMG_W, height: IMG_H, resizeMode: "contain" }}
        />
        {zones.map((zone) => (
          <Pressable
            key={zone.label}
            style={[
              s.tapZone,
              {
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
              },
            ]}
            onPress={() => handleTap(zone)}
          >
            {/* Invisible tap zone — labels are already in the image */}
          </Pressable>
        ))}
      </View>

      {errors > 0 && (
        <Text style={s.mistakeNote}>
          {errors} miss{errors > 1 ? "es" : ""} so far — no worries, keep going!
        </Text>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Task 3 · Sensory — Vibration Reaction
// ─────────────────────────────────────────────────────────────

const SensoryTask: React.FC<TaskProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"idle" | "waiting" | "done">("idle");
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const taskStart = useRef(Date.now());
  const pulseAt = useRef<number | null>(null);
  const reactionTimes = useRef<number[]>([]);
  const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    gaps,
    reset: resetIdle,
    stop: stopIdle,
  } = useIdleTracker(phase !== "done");

  useEffect(
    () => () => {
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
    },
    [],
  );

  const triggerPulse = async () => {
    if (phase === "waiting") return;
    setPhase("waiting");
    setFeedback(null);
    pulseAt.current = null;
    resetIdle();

    const delay =
      MIN_PULSE_DELAY_MS +
      Math.random() * (MAX_PULSE_DELAY_MS - MIN_PULSE_DELAY_MS);
    pulseTimeout.current = setTimeout(async () => {
      pulseAt.current = Date.now();
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }, delay);
  };

  const handleFelt = () => {
    if (phase !== "waiting") return;
    resetIdle();
    if (pulseTimeout.current) clearTimeout(pulseTimeout.current);

    if (pulseAt.current !== null) {
      const rt = Date.now() - pulseAt.current;
      if (rt >= 50) {
        reactionTimes.current.push(rt);
        setFeedback(`⚡ ${rt} ms — nice!`);
      }
    } else {
      setFeedback("Too fast — wait for the buzz 😄");
    }

    const nextRound = round + 1;
    setRound(nextRound);

    if (nextRound >= PULSE_ROUNDS) {
      stopIdle();
      setPhase("done");
      const { avg, variability } = computeTimingStats(reactionTimes.current);
      onComplete({
        taskId: "sensory",
        answerChanges: 0,
        currentErrorStreak: 0,
        totalScore: 1,
        accuracyRate: reactionTimes.current.length / PULSE_ROUNDS,
        errors: PULSE_ROUNDS - reactionTimes.current.length,
        idleGapsOverThreshold: gaps,
        responseTimeVariability: variability,
        completionTime: Date.now() - taskStart.current,
        avgResponseTime: avg,
      });
    } else {
      setPhase("idle");
    }
  };

  return (
    <View style={s.taskCard}>
      <View style={s.taskHeader}>
        <View style={[s.taskBadge, { backgroundColor: "#F5F3FF" }]}>
          <Text style={[s.taskBadgeText, { color: "#6D28D9" }]}>📳 Task 3</Text>
        </View>
        <Text style={s.taskTitle}>Feel the Buzz!</Text>
      </View>

      <Text style={s.bodyText}>
        Tap <Text style={s.highlight}>Play buzz</Text>, then as soon as your
        phone vibrates — tap <Text style={s.highlight}>I felt it!</Text> 🤙
      </Text>

      {/* Round dots */}
      <View style={s.roundRow}>
        {Array.from({ length: PULSE_ROUNDS }).map((_, i) => (
          <View
            key={i}
            style={[
              s.roundDot,
              i < round && s.roundDotDone,
              i === round && s.roundDotActive,
            ]}
          />
        ))}
        <Text style={s.roundLabel}>
          {phase === "done"
            ? "All done!"
            : `Round ${round + 1} of ${PULSE_ROUNDS}`}
        </Text>
      </View>

      {feedback && (
        <View style={s.feedbackPill}>
          <Text style={s.feedbackText}>{feedback}</Text>
        </View>
      )}

      <Pressable
        style={[s.buzzBtn, phase === "waiting" && s.buzzBtnWaiting]}
        onPress={triggerPulse}
        disabled={phase === "waiting" || phase === "done"}
      >
        <Text style={s.buzzBtnText}>
          {phase === "waiting" ? "🔔  Waiting for buzz…" : "▶  Play buzz"}
        </Text>
      </Pressable>

      <Pressable
        style={[s.primaryBtn, phase !== "waiting" && s.btnDisabled]}
        disabled={phase !== "waiting"}
        onPress={handleFelt}
      >
        <Text style={s.primaryBtnText}>I felt it! 👋</Text>
      </Pressable>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// BrainSyncScreen — Orchestrator
// ─────────────────────────────────────────────────────────────

type TaskStep = 1 | 2 | 3;

const STEP_META: Record<TaskStep, { emoji: string; label: string }> = {
  1: { emoji: "📖", label: "Memory Check" },
  2: { emoji: "🌿", label: "Find the Part" },
  3: { emoji: "📳", label: "Feel the Buzz" },
};

const BrainSyncScreen: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<TaskStep>(1);
  const [allMetrics, setAllMetrics] = useState<TaskMetrics[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const { setBaselineState } = useNeuroState();
  const { resetBuffer } = useAnalyticsLogger();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Only allow authenticated users who still need calibration to stay on this screen.
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/welcome");
      return;
    }

    const hasBaseline =
      (user as any)?.is_calibrated === true ||
      (user as any)?.baseline_cognitive_load != null;

    if (hasBaseline) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    Animated.spring(progress, {
      toValue: started ? (step - 1) / 3 : 0,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [step, started, progress]);

  const handleTaskComplete = useCallback(
    (metrics: TaskMetrics) => {
      const updated = [...allMetrics, metrics];
      setAllMetrics(updated);
      if (step < 3) {
        setStep((s) => (s + 1) as TaskStep);
      } else {
        submitCalibration(updated);
      }
    },
    [allMetrics, step],
  );

  const submitCalibration = async (metrics: TaskMetrics[]) => {
    setSubmitting(true);
    const summary = computeCLI(metrics);

    try {
      const body: neuroApi.CalibrationRequest = {
        total_time_seconds:
          metrics.reduce((s, m) => s + m.completionTime, 0) / 1000,
        total_questions: metrics.length,
        question_interactions: metrics,
        back_navigations: 0,
        forward_navigations: metrics.length - 1,
        answer_changes: metrics.reduce((s, m) => s + m.answerChanges, 0),
        cognitive_load_index: summary.cli,
        dominant_channel: summary.dominantChannel,
        overload_signal: summary.overloadSignal,
        per_task_scores: summary.perTask,
      };

      const response = await neuroApi.calibrate(body);
      if (response.baseline_state)
        setBaselineState(response.baseline_state as any);
      resetBuffer();
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Oops!", "Something went wrong. Let's try again 🙏", [
        { text: "Retry", onPress: () => setSubmitting(false) },
      ]);
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Animated fill for completed step
  const stepProgress = useRef(new Animated.Value(step / 3)).current;
  useEffect(() => {
    Animated.timing(stepProgress, {
      toValue: step / 3,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const barWidth = stepProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Intro / Start */}
        {!started && (
          <>
            <View style={s.header}>
              <Text style={s.superTitle}>🧠 Brain Sync</Text>
              <Text style={s.heroTitle}>Let's find your learning style!</Text>
              <Text style={s.heroSub}>
                3 quick activities — takes about 2 minutes. There are no wrong
                answers, just do your best! 🌟
              </Text>
            </View>
            <Pressable style={s.primaryBtn} onPress={() => setStarted(true)}>
              <Text style={s.primaryBtnText}>Start Brain Sync</Text>
            </Pressable>
            <Text style={s.privacyNote}>
              🔒 Your results are private — only used to personalise your
              lessons.
            </Text>
          </>
        )}

        {/* Flow when started */}
        {started && (
          <>
            {/* Header */}
            <View style={s.header}>
              <Text style={s.superTitle}>🧠 Brain Sync</Text>
              <Text style={s.heroTitle}>Let's find your learning style!</Text>
              <Text style={s.heroSub}>
                3 quick activities — takes about 2 minutes. There are no wrong
                answers, just do your best! 🌟
              </Text>
            </View>

            {/* Step pills */}
            <View style={s.pillRow}>
              {([1, 2, 3] as TaskStep[]).map((n) => {
                const meta = STEP_META[n];
                const active = n === step;
                const done = n < step;
                return (
                  <View
                    key={n}
                    style={[s.pill, active && s.pillActive, done && s.pillDone]}
                  >
                    <Text
                      style={[
                        s.pillText,
                        (active || done) && s.pillTextActive,
                      ]}
                    >
                      {done ? "✓" : meta.emoji} {meta.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Progress bar */}
            <View style={s.progressTrack}>
              <Animated.View style={[s.progressFill, { width: barWidth }]} />
            </View>
            <Text style={s.progressCaption}>Step {step} of 3</Text>

            {/* Active task */}
            {step === 1 && <NLPTask onComplete={handleTaskComplete} />}
            {step === 2 && <VisualTask onComplete={handleTaskComplete} />}
            {step === 3 && <SensoryTask onComplete={handleTaskComplete} />}

            <Text style={s.privacyNote}>
              🔒 Your results are private — only used to personalise your
              lessons.
            </Text>
          </>
        )}
      </ScrollView>

      {/* Submitting overlay */}
      {submitting && (
        <View style={s.overlay}>
          <View style={s.overlayCard}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={s.overlayTitle}>Syncing your brain… 🧠</Text>
            <Text style={s.overlayBody}>
              Setting up your personal learning profile!
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BrainSyncScreen;
export { computeCLI, scoreTask, computeTimingStats };

// ─────────────────────────────────────────────────────────────
// Styles  — warm, rounded, child-friendly palette
// ─────────────────────────────────────────────────────────────

const BLUE = "#4F46E5";
const BLUE_LT = "#EEF2FF";
const GREEN = "#16A34A";
const GREEN_LT = "#F0FDF4";
const GRAY = "#6B7280";
const BORDER = "#E5E7EB";
const WHITE = "#FFFFFF";
const INK = "#111827";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // ── Header ──
  header: { paddingTop: 24, paddingBottom: 8 },
  superTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BLUE,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: INK,
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSub: { fontSize: 15, color: GRAY, lineHeight: 22 },

  // ── Step pills ──
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  pillActive: { borderColor: BLUE, backgroundColor: BLUE_LT },
  pillDone: { borderColor: GREEN, backgroundColor: GREEN_LT },
  pillText: { fontSize: 12, fontWeight: "600", color: GRAY },
  pillTextActive: { color: INK },

  // ── Progress bar ──
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: BLUE },
  progressCaption: { fontSize: 12, color: GRAY, marginBottom: 12 },

  // ── Task card ──
  taskCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  taskHeader: { gap: 6 },
  taskBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeText: { fontSize: 12, fontWeight: "700" },
  taskTitle: { fontSize: 20, fontWeight: "800", color: INK },

  // ── NLP Task ──
  sentenceBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  sentenceText: { fontSize: 16, color: INK, lineHeight: 24 },
  highlight: { fontWeight: "800", color: BLUE },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  countdownLabel: { fontSize: 13, color: GRAY },
  countdownNum: { fontSize: 20, fontWeight: "800", color: "#F59E0B" },
  questionText: { fontSize: 17, fontWeight: "700", color: INK },
  optionsCol: { gap: 10 },
  optBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: "#FAFAFA",
  },
  optBtnSelected: { borderColor: BLUE, backgroundColor: BLUE_LT },
  optText: { fontSize: 16, color: INK, fontWeight: "500" },
  optTextSelected: { color: BLUE, fontWeight: "700" },

  // ── Visual Task ──
  roundRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  roundDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BORDER },
  roundDotActive: {
    backgroundColor: BLUE,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  roundDotDone: { backgroundColor: GREEN },
  roundLabel: { fontSize: 12, color: GRAY, marginLeft: 4 },
  targetBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  targetBannerCorrect: { backgroundColor: "#F0FDF4" },
  targetBannerWrong: { backgroundColor: "#FFF1F2" },
  targetText: { fontSize: 15, fontWeight: "700", color: INK },
  diagramWrap: { alignSelf: "center", position: "relative" },
  tapZone: { position: "absolute" },
  mistakeNote: { fontSize: 12, color: "#EF4444", fontStyle: "italic" },

  // ── Sensory Task ──
  bodyText: { fontSize: 15, color: INK, lineHeight: 22 },
  feedbackPill: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  feedbackText: { fontSize: 14, fontWeight: "700", color: GREEN },
  buzzBtn: {
    backgroundColor: BLUE_LT,
    borderWidth: 2,
    borderColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buzzBtnWaiting: { backgroundColor: "#C7D2FE" },
  buzzBtnText: { color: BLUE, fontSize: 17, fontWeight: "800" },

  // ── Shared ──
  primaryBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: WHITE, fontSize: 17, fontWeight: "800" },
  btnDisabled: { opacity: 0.35 },

  // ── Footer ──
  privacyNote: {
    fontSize: 12,
    color: GRAY,
    textAlign: "center",
    marginTop: 16,
  },

  // ── Submitting overlay ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "80%",
    gap: 12,
  },
  overlayTitle: { fontSize: 20, fontWeight: "800", color: INK },
  overlayBody: { fontSize: 14, color: GRAY, textAlign: "center" },
});
