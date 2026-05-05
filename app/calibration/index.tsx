/**
 * BrainSyncScreen v3  —  Grade 6 Cognitive Calibration
 * Redesigned for 11–12 year olds:
 *   • Chunky, rounded, playful aesthetic
 *   • Bold color-per-task branding
 *   • Large tap targets (≥56 px tall)
 *   • Animated progress star trail
 *   • Friendly, emoji-rich copy
 *   • Bouncy feedback animations
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
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
import { getCurrentUser } from "@/services/user";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const IDLE_THRESHOLD_MS = 3500;
const SENTENCE_DISPLAY_MS = 5000;
const PULSE_ROUNDS = 3;
const MIN_PULSE_DELAY_MS = 800;
const MAX_PULSE_DELAY_MS = 2000;

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────

const C = {
  bg: "#F0F4FF",
  card: "#FFFFFF",
  ink: "#1A1A2E",
  gray: "#7B8794",
  border: "#E2E8F0",
  white: "#FFFFFF",

  // Task 1 – warm amber
  t1Bg: "#FFF8ED",
  t1Accent: "#F97316",
  t1Light: "#FEF3C7",

  // Task 2 – leaf green
  t2Bg: "#EDFFF4",
  t2Accent: "#22C55E",
  t2Light: "#DCFCE7",

  // Task 3 – electric violet
  t3Bg: "#F3EEFF",
  t3Accent: "#8B5CF6",
  t3Light: "#EDE9FE",

  // Primary CTA
  cta: "#4F46E5",
  ctaLight: "#EEF2FF",

  correct: "#16A34A",
  wrong: "#EF4444",
};

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
  cli: number;
  dominantChannel: "nlp" | "visual" | "sensory";
  overloadSignal: boolean;
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
// Shared: BounceIn wrapper
// ─────────────────────────────────────────────────────────────

const BounceIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      delay,
      friction: 6,
      tension: 120,
    }).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────
// Task 1 · NLP — Reading & Recall
// ─────────────────────────────────────────────────────────────

const NLPTask: React.FC<TaskProps & { config: typeof NLP_VARIANTS[0] }> = ({ onComplete, config }) => {
  const [phase, setPhase] = useState<"read" | "answer">("read");
  const [countdown, setCountdown] = useState(5);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerChanges, setChanges] = useState(0);
  const [done, setDone] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const taskStart = useRef(Date.now());
  const shownAt = useRef<number | null>(null);
  const tapTimes = useRef<number[]>([]);
  const {
    gaps,
    reset: resetIdle,
    stop: stopIdle,
  } = useIdleTracker(phase === "answer");

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

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
    const CORRECT = config.correctIndex;
    const correct = selected === CORRECT;
    if (!correct) shake();
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

  const options = config.options;

  return (
    <BounceIn>
      <View
        style={[s.taskCard, { borderTopColor: C.t1Accent, borderTopWidth: 5 }]}
      >
        {/* Badge */}
        <View style={s.taskHeader}>
          <View style={[s.taskBadge, { backgroundColor: C.t1Light }]}>
            <Text style={[s.taskBadgeText, { color: C.t1Accent }]}>
              📖 Task 1 of 3
            </Text>
          </View>
          <Text style={s.taskTitle}>Quick Memory Check</Text>
          <Text style={s.taskSubtitle}>
            Read the sentence, then answer the question below!
          </Text>
        </View>

        {phase === "read" ? (
          <View style={[s.sentenceBox, { borderLeftColor: C.t1Accent }]}>
            <Text style={s.sentenceText}>
              {config.sentence.split(config.highlight).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <React.Fragment key={i}>
                    {part}
                    <Text style={[s.highlight, { color: C.t1Accent }]}>{config.highlight}</Text>
                  </React.Fragment>
                ) : part
              )}
            </Text>
            <View style={s.countdownRow}>
              <Text style={s.countdownLabel}>Disappears in </Text>
              <View
                style={[s.countdownBubble, { backgroundColor: C.t1Accent }]}
              >
                <Text style={s.countdownNum}>{countdown}s</Text>
              </View>
            </View>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <Text style={s.questionText}>{config.question}</Text>
            <View style={s.optionsCol}>
              {options.map((opt, idx) => (
                <Pressable
                  key={opt.label}
                  style={[
                    s.optBtn,
                    selected === idx && [
                      s.optBtnSelected,
                      { borderColor: C.t1Accent, backgroundColor: C.t1Light },
                    ],
                  ]}
                  onPress={() => handleSelect(idx)}
                >
                  <Text style={s.optEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      s.optText,
                      selected === idx && {
                        color: C.t1Accent,
                        fontWeight: "800",
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selected === idx && <Text style={s.optCheck}>✓</Text>}
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[
                s.ctaBtn,
                { backgroundColor: C.t1Accent },
                selected === null && s.btnDisabled,
              ]}
              disabled={selected === null}
              onPress={handleConfirm}
            >
              <Text style={s.ctaBtnText}>That's my answer! ✓</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </BounceIn>
  );
};

// ─────────────────────────────────────────────────────────────
// Task 2 · Visual — Plant Diagram Tap
// ─────────────────────────────────────────────────────────────

type PlantZone = {
  label: string;
  left: `${number}%`;
  top: `${number}%`;
  width: `${number}%`;
  height: `${number}%`;
  isTarget: boolean;
};

const buildZonesOld = (target: "Leaf" | "Root"): PlantZone[] => [
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

const VisualTask: React.FC<TaskProps & { config: typeof VISUAL_VARIANTS[0] }> = ({ onComplete, config }) => {
  const [round, setRound] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const taskStart = useRef(Date.now());
  const roundAt = useRef(Date.now());
  const tapTimes = useRef<number[]>([]);
  const { gaps, reset: resetIdle, stop: stopIdle } = useIdleTracker(!done);

  const ROUNDS = config.rounds;
  const buildZones = config.buildZones;
  const currentTarget = ROUNDS[round]?.target ?? "Leaf";
  const zones = buildZones(currentTarget);

  const handleTap = (zone: PlantZone) => {
    if (done || feedback !== null) return;
    resetIdle();
    const rt = Date.now() - roundAt.current;

    if (zone.isTarget) {
      tapTimes.current.push(rt);
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        const nextRound = round + 1;
        if (nextRound >= ROUNDS.length) {
          stopIdle();
          setDone(true);
          const { avg, variability } = computeTimingStats(tapTimes.current);
          const accuracy =
            tapTimes.current.length / (tapTimes.current.length + errors);
          onComplete({
            taskId: "visual",
            answerChanges: 0,
            currentErrorStreak: errors > 0 ? 1 : 0,
            totalScore: Math.max(0, 1 - errors * 0.2),
            accuracyRate: accuracy,
            errors,
            idleGapsOverThreshold: gaps,
            responseTimeVariability: variability,
            completionTime: Date.now() - taskStart.current,
            avgResponseTime: avg,
          });
        } else {
          setRound(nextRound);
          roundAt.current = Date.now();
        }
      }, 700);
    } else {
      tapTimes.current.push(rt);
      setErrors((n) => n + 1);
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        roundAt.current = Date.now();
      }, 600);
    }
  };

  const IMG_W = 300;
  const IMG_H = Math.round(300 * (610 / 576));

  const feedbackBg =
    feedback === "correct"
      ? C.t2Light
      : feedback === "wrong"
        ? "#FFF1F2"
        : C.t2Bg;
  const feedbackBorder =
    feedback === "correct"
      ? C.t2Accent
      : feedback === "wrong"
        ? C.wrong
        : C.t2Accent;

  return (
    <BounceIn>
      <View
        style={[s.taskCard, { borderTopColor: C.t2Accent, borderTopWidth: 5 }]}
      >
        <View style={s.taskHeader}>
          <View style={[s.taskBadge, { backgroundColor: C.t2Light }]}>
            <Text style={[s.taskBadgeText, { color: C.t2Accent }]}>
              🌿 Task 2 of 3
            </Text>
          </View>
          <Text style={s.taskTitle}>Find the Part!</Text>
          <Text style={s.taskSubtitle}>
            Look at the plant diagram and tap the right part.
          </Text>
        </View>

        {/* Round dots */}
        <View style={s.roundRow}>
          {ROUNDS.map((_, i) => (
            <View
              key={i}
              style={[
                s.roundDot,
                i < round && [s.roundDotDone, { backgroundColor: C.t2Accent }],
                i === round && [
                  s.roundDotActive,
                  { backgroundColor: C.t2Accent },
                ],
              ]}
            />
          ))}
          <Text style={s.roundLabel}>
            Round {round + 1} of {ROUNDS.length}
          </Text>
        </View>

        {/* Target banner */}
        <View
          style={[
            s.targetBanner,
            {
              backgroundColor: feedbackBg,
              borderColor: feedbackBorder,
              borderWidth: 2,
            },
          ]}
        >
          <Text
            style={[
              s.targetText,
              {
                color:
                  feedback === "wrong"
                    ? C.wrong
                    : feedback === "correct"
                      ? C.t2Accent
                      : C.ink,
              },
            ]}
          >
            {feedback === "correct"
              ? "✅  Awesome! Moving to next round…"
              : feedback === "wrong"
                ? "❌  Oops! Try again 💪"
                : `👉  Tap the  "${currentTarget}"`}
          </Text>
        </View>

        {/* Diagram */}
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
            />
          ))}
        </View>

        {errors > 0 && (
          <View style={s.mistakePill}>
            <Text style={s.mistakeNote}>
              {errors} miss{errors > 1 ? "es" : ""} so far — no worries, keep
              going! 💪
            </Text>
          </View>
        )}
      </View>
    </BounceIn>
  );
};

// ─────────────────────────────────────────────────────────────
// Task 3 · Sensory — Vibration Reaction
// ─────────────────────────────────────────────────────────────

const SensoryTask: React.FC<TaskProps & { config: typeof SENSORY_VARIANTS[0] }> = ({ onComplete, config }) => {
  const [phase, setPhase] = useState<"idle" | "waiting" | "done">("idle");
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const taskStart = useRef(Date.now());
  const pulseAt = useRef<number | null>(null);
  const reactionTimes = useRef<number[]>([]);
  const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    gaps,
    reset: resetIdle,
    stop: stopIdle,
  } = useIdleTracker(phase !== "done");
  const PULSE_ROUNDS = config.rounds;

  useEffect(
    () => () => {
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
    },
    [],
  );

  useEffect(() => {
    if (phase !== "waiting") return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [phase]);

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
        setFeedback(`⚡ ${rt} ms — nice reflexes!`);
      }
    } else {
      setFeedback("Too fast — wait for the buzz first 😄");
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
    <BounceIn>
      <View
        style={[s.taskCard, { borderTopColor: C.t3Accent, borderTopWidth: 5 }]}
      >
        <View style={s.taskHeader}>
          <View style={[s.taskBadge, { backgroundColor: C.t3Light }]}>
            <Text style={[s.taskBadgeText, { color: C.t3Accent }]}>
              📳 Task 3 of 3
            </Text>
          </View>
          <Text style={s.taskTitle}>{config.label}</Text>
          <Text style={s.taskSubtitle}>
            Tap{" "}
            <Text style={{ fontWeight: "800", color: C.t3Accent }}>
              ▶ Play buzz
            </Text>
            , wait for your phone to vibrate, then tap{" "}
            <Text style={{ fontWeight: "800", color: C.t3Accent }}>
              I felt it!
            </Text>{" "}
            🤙
          </Text>
        </View>

        {/* Round dots */}
        <View style={s.roundRow}>
          {Array.from({ length: PULSE_ROUNDS }).map((_, i) => (
            <View
              key={i}
              style={[
                s.roundDot,
                i < round && [s.roundDotDone, { backgroundColor: C.t3Accent }],
                i === round && [
                  s.roundDotActive,
                  { backgroundColor: C.t3Accent },
                ],
              ]}
            />
          ))}
          <Text style={s.roundLabel}>
            {phase === "done"
              ? "All done! 🎉"
              : `Round ${round + 1} of ${PULSE_ROUNDS}`}
          </Text>
        </View>

        {feedback && (
          <View style={[s.feedbackPill, { backgroundColor: C.t3Light }]}>
            <Text style={[s.feedbackText, { color: C.t3Accent }]}>
              {feedback}
            </Text>
          </View>
        )}

        {/* Big buzz button with pulse animation */}
        <Animated.View
          style={{
            transform: [{ scale: phase === "waiting" ? pulseAnim : 1 }],
          }}
        >
          <Pressable
            style={[
              s.buzzBtn,
              {
                borderColor: C.t3Accent,
                backgroundColor: phase === "waiting" ? C.t3Light : C.t3Bg,
              },
            ]}
            onPress={triggerPulse}
            disabled={phase === "waiting" || phase === "done"}
          >
            <Text style={[s.buzzBtnText, { color: C.t3Accent }]}>
              {phase === "waiting" ? "🔔  Waiting for buzz…" : "▶  Play buzz"}
            </Text>
          </Pressable>
        </Animated.View>

        <Pressable
          style={[
            s.ctaBtn,
            { backgroundColor: C.t3Accent },
            phase !== "waiting" && s.btnDisabled,
          ]}
          disabled={phase !== "waiting"}
          onPress={handleFelt}
        >
          <Text style={s.ctaBtnText}>I felt it! 👋</Text>
        </Pressable>
      </View>
    </BounceIn>
  );
};

// ─────────────────────────────────────────────────────────────
// BrainSyncScreen — Orchestrator
// ─────────────────────────────────────────────────────────────

type TaskStep = 1 | 2 | 3;

const STEP_META: Record<
  TaskStep,
  { emoji: string; label: string; color: string; lightColor: string }
> = {
  1: {
    emoji: "📖",
    label: "Memory Check",
    color: C.t1Accent,
    lightColor: C.t1Light,
  },
  2: {
    emoji: "🌿",
    label: "Find the Part",
    color: C.t2Accent,
    lightColor: C.t2Light,
  },
  3: {
    emoji: "📳",
    label: "Feel the Buzz",
    color: C.t3Accent,
    lightColor: C.t3Light,
  },
};

// ─── Task variant pools ───────────────────────────────────────

const NLP_VARIANTS = [
  {
    sentence: `Plants are called autotrophs because they make their own food using sunlight, water, and air. 🌿`,
    highlight: "autotrophs",
    question: "🤔 What do we call plants that make their own food?",
    options: [
      { label: "Decomposers", emoji: "🍄" },
      { label: "Autotrophs",  emoji: "🌱" },
      { label: "Predators",   emoji: "🦁" },
    ],
    correctIndex: 1,
  },
  {
    sentence: `Animals that eat only plants are called herbivores. A rabbit eating grass is a classic example. 🐇`,
    highlight: "herbivores",
    question: "🤔 What are animals that eat only plants called?",
    options: [
      { label: "Carnivores",  emoji: "🦁" },
      { label: "Omnivores",   emoji: "🐻" },
      { label: "Herbivores",  emoji: "🐇" },
    ],
    correctIndex: 2,
  },
  {
    sentence: `The process by which plants make food using sunlight is called photosynthesis. It happens in the leaves. ☀️`,
    highlight: "photosynthesis",
    question: "🤔 What is the process plants use to make food from sunlight?",
    options: [
      { label: "Respiration",    emoji: "💨" },
      { label: "Photosynthesis", emoji: "🌞" },
      { label: "Digestion",      emoji: "🍽️" },
    ],
    correctIndex: 1,
  },
];

const VISUAL_VARIANTS = [
  {
    label: "Plant",
    rounds: [
      { target: "Leaf" as const },
      { target: "Root" as const },
      { target: "Leaf" as const },
    ],
    buildZones: (target: string) => [
      { label: "Leaf",   left: "1%",  top: "27%", width: "24%", height: "9%", isTarget: target === "Leaf"   },
      { label: "Root",   left: "1%",  top: "80%", width: "24%", height: "9%", isTarget: target === "Root"   },
      { label: "Flower", left: "60%", top: "13%", width: "30%", height: "9%", isTarget: false               },
      { label: "Stem",   left: "14%", top: "57%", width: "20%", height: "8%", isTarget: false               },
      { label: "Fruit",  left: "57%", top: "51%", width: "20%", height: "8%", isTarget: false               },
    ],
  },
  {
    label: "Plant",
    rounds: [
      { target: "Flower" as const },
      { target: "Stem"   as const },
      { target: "Flower" as const },
    ],
    buildZones: (target: string) => [
      { label: "Leaf",   left: "1%",  top: "27%", width: "24%", height: "9%", isTarget: target === "Leaf"   },
      { label: "Root",   left: "1%",  top: "80%", width: "24%", height: "9%", isTarget: target === "Root"   },
      { label: "Flower", left: "60%", top: "13%", width: "30%", height: "9%", isTarget: target === "Flower" },
      { label: "Stem",   left: "14%", top: "57%", width: "20%", height: "8%", isTarget: target === "Stem"   },
      { label: "Fruit",  left: "57%", top: "51%", width: "20%", height: "8%", isTarget: false               },
    ],
  },
  {
    label: "Plant",
    rounds: [
      { target: "Fruit" as const },
      { target: "Root"  as const },
      { target: "Stem"  as const },
    ],
    buildZones: (target: string) => [
      { label: "Leaf",   left: "1%",  top: "27%", width: "24%", height: "9%", isTarget: target === "Leaf"   },
      { label: "Root",   left: "1%",  top: "80%", width: "24%", height: "9%", isTarget: target === "Root"   },
      { label: "Flower", left: "60%", top: "13%", width: "30%", height: "9%", isTarget: false               },
      { label: "Stem",   left: "14%", top: "57%", width: "20%", height: "8%", isTarget: target === "Stem"   },
      { label: "Fruit",  left: "57%", top: "51%", width: "20%", height: "8%", isTarget: target === "Fruit"  },
    ],
  },
];

const SENSORY_VARIANTS = [
  { rounds: 3, label: "Feel the Buzz!",    instruction: "Wait for your phone to vibrate" },
  { rounds: 4, label: "Quick Reflexes!",   instruction: "Tap the moment you feel it" },
  { rounds: 3, label: "Stay Sharp!",       instruction: "React as fast as you can" },
];

// ─── Session picker (deterministic per user per day) ──────────

const pickSession = (userId: string) => {
  const today = new Date().toISOString().slice(0, 10);
  const seed = [...(userId + today)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    nlp:     NLP_VARIANTS[seed % NLP_VARIANTS.length],
    visual:  VISUAL_VARIANTS[(seed + 1) % VISUAL_VARIANTS.length],
    sensory: SENSORY_VARIANTS[(seed + 2) % SENSORY_VARIANTS.length],
  };
};

const BrainSyncScreen: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<TaskStep>(1);
  const [allMetrics, setAllMetrics] = useState<TaskMetrics[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const heroScale = useRef(new Animated.Value(0.9)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  const { setBaselineState } = useNeuroState();
  const { resetBuffer } = useAnalyticsLogger();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const session = useMemo(
    () => pickSession(user?.id ?? "guest"),
    [user?.id]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heroScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/welcome");
      return;
    }
    const hasBaseline =
      (user as any)?.is_calibrated === true ||
      (user as any)?.baseline_cognitive_load != null;
    if (hasBaseline) router.replace("/(tabs)");
  }, [isAuthenticated, isLoading, user]);

  // Animated progress bar
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: started ? step / 3 : 0,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [step, started]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

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
      if (response.baseline_state) {
        setBaselineState(response.baseline_state as any);
      }

      // Refresh the authenticated user so baseline_cognitive_load / is_calibrated
      // are up to date in AuthContext (used by the home banner & neuro state).
      try {
        const freshUser = await getCurrentUser();
        updateUser(freshUser);
      } catch (e) {
        console.warn("Failed to refresh user after calibration", e);
      }

      resetBuffer();
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Oops!", "Something went wrong. Let's try again 🙏", [
        { text: "Retry", onPress: () => setSubmitting(false) },
      ]);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero header — always shown */}
        <Animated.View
          style={[
            s.heroWrap,
            { opacity: heroOpacity, transform: [{ scale: heroScale }] },
          ]}
        >
          {/* Decorative blob */}
          <View style={s.heroBlob} />

          <Text style={s.superTitle}>🧠 Brain Sync</Text>
          <Text style={s.heroTitle}>
            Let's find your{"\n"}learning superpower!
          </Text>
          <Text style={s.heroSub}>
            3 quick activities · ~2 minutes · No wrong answers!{" "}
            <Text style={{ fontWeight: "800" }}>Just do your best 🌟</Text>
          </Text>
        </Animated.View>

        {!started ? (
          <BounceIn delay={200}>
            {/* Feature chips */}
            <View style={s.chipRow}>
              {[
                { emoji: "📖", text: "Memory" },
                { emoji: "🌿", text: "Visual" },
                { emoji: "📳", text: "Reflexes" },
              ].map((chip) => (
                <View key={chip.text} style={s.chip}>
                  <Text style={s.chipEmoji}>{chip.emoji}</Text>
                  <Text style={s.chipText}>{chip.text}</Text>
                </View>
              ))}
            </View>

            <Pressable style={s.startBtn} onPress={() => setStarted(true)}>
              <Text style={s.startBtnText}>Let's go! 🚀</Text>
            </Pressable>

            <Text style={s.privacyNote}>
              🔒 Private · Only used to personalise your lessons
            </Text>
          </BounceIn>
        ) : (
          <>
            {/* Step progress bar */}
            <View style={s.progressSection}>
              <View style={s.pillRow}>
                {([1, 2, 3] as TaskStep[]).map((n) => {
                  const meta = STEP_META[n];
                  const active = n === step;
                  const done = n < step;
                  return (
                    <View
                      key={n}
                      style={[
                        s.pill,
                        active && {
                          borderColor: meta.color,
                          backgroundColor: meta.lightColor,
                        },
                        done && {
                          borderColor: C.correct,
                          backgroundColor: "#DCFCE7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.pillText,
                          (active || done) && {
                            color: done ? C.correct : meta.color,
                          },
                        ]}
                      >
                        {done ? "✓ " : `${meta.emoji} `}
                        {meta.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={s.progressTrack}>
                <Animated.View
                  style={[
                    s.progressFill,
                    { width: barWidth, backgroundColor: STEP_META[step].color },
                  ]}
                />
              </View>
              <Text style={s.progressCaption}>
                Step {step} of 3 — You're doing great! 🎉
              </Text>
            </View>

            {/* Active task */}
            {step === 1 && <NLPTask    config={session.nlp}     onComplete={handleTaskComplete} />}
            {step === 2 && <VisualTask config={session.visual}  onComplete={handleTaskComplete} />}
            {step === 3 && <SensoryTask config={session.sensory} onComplete={handleTaskComplete} />}

            <Text style={s.privacyNote}>
              🔒 Private · Only used to personalise your lessons
            </Text>
          </>
        )}
      </ScrollView>

      {/* Submitting overlay */}
      {submitting && (
        <View style={s.overlay}>
          <BounceIn>
            <View style={s.overlayCard}>
              <Text style={s.overlayEmoji}>🧠</Text>
              <ActivityIndicator
                size="large"
                color={C.cta}
                style={{ marginVertical: 8 }}
              />
              <Text style={s.overlayTitle}>Syncing your brain…</Text>
              <Text style={s.overlayBody}>
                Setting up your personal learning profile!
              </Text>
            </View>
          </BounceIn>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BrainSyncScreen;
export { computeCLI, scoreTask, computeTimingStats };

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // ── Hero ──
  heroWrap: {
    paddingTop: 28,
    paddingBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  heroBlob: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#C7D2FE",
    opacity: 0.35,
  },
  superTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.cta,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: C.ink,
    lineHeight: 36,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    color: C.gray,
    lineHeight: 22,
  },

  // ── Start chips ──
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chipEmoji: { fontSize: 18 },
  chipText: { fontSize: 14, fontWeight: "700", color: C.ink },

  // ── Start button ──
  startBtn: {
    backgroundColor: C.cta,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: C.cta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  startBtnText: {
    color: C.white,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  // ── Progress section ──
  progressSection: { marginBottom: 16 },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.gray,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: C.border,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: { height: "100%", borderRadius: 5 },
  progressCaption: { fontSize: 12, color: C.gray },

  // ── Task card ──
  taskCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
    gap: 16,
    marginBottom: 16,
  },
  taskHeader: { gap: 6 },
  taskBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  taskBadgeText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
  taskTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
  },
  taskSubtitle: { fontSize: 14, color: C.gray, lineHeight: 20 },

  // ── Sentence box ──
  sentenceBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 5,
  },
  sentenceText: { fontSize: 16, color: C.ink, lineHeight: 26 },
  highlight: { fontWeight: "900" },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  countdownLabel: { fontSize: 13, color: C.gray },
  countdownBubble: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countdownNum: { fontSize: 16, fontWeight: "900", color: C.white },

  // ── Options ──
  questionText: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
    lineHeight: 24,
  },
  optionsCol: { gap: 10 },
  optBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: "#FAFAFA",
    minHeight: 56,
  },
  optBtnSelected: {},
  optEmoji: { fontSize: 22 },
  optText: { flex: 1, fontSize: 16, color: C.ink, fontWeight: "600" },
  optCheck: { fontSize: 18, color: C.cta },

  // ── CTA button ──
  ctaBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  btnDisabled: { opacity: 0.3 },

  // ── Visual task ──
  roundRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  roundDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.border,
  },
  roundDotActive: { width: 14, height: 14, borderRadius: 7 },
  roundDotDone: {},
  roundLabel: { fontSize: 12, color: C.gray, marginLeft: 4 },
  targetBanner: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  targetText: { fontSize: 15, fontWeight: "800" },
  diagramWrap: { alignSelf: "center", position: "relative" },
  tapZone: { position: "absolute" },
  mistakePill: {
    backgroundColor: "#FFF1F2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mistakeNote: { fontSize: 13, color: C.wrong, fontWeight: "600" },

  // ── Sensory task ──
  feedbackPill: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  feedbackText: { fontSize: 14, fontWeight: "800" },
  buzzBtn: {
    borderWidth: 2.5,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    minHeight: 64,
    justifyContent: "center",
  },
  buzzBtnText: { fontSize: 18, fontWeight: "900" },

  // ── Footer ──
  privacyNote: {
    fontSize: 12,
    color: C.gray,
    textAlign: "center",
    marginTop: 8,
  },

  // ── Overlay ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCard: {
    backgroundColor: C.card,
    borderRadius: 28,
    padding: 36,
    alignItems: "center",
    width: "82%",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  overlayEmoji: { fontSize: 48, marginBottom: 4 },
  overlayTitle: { fontSize: 22, fontWeight: "900", color: C.ink },
  overlayBody: {
    fontSize: 14,
    color: C.gray,
    textAlign: "center",
    lineHeight: 20,
  },
});
