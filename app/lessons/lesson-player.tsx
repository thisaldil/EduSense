import React, { useEffect, useRef, useState } from "react";
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

// Default screen component for /lessons/lesson-player route
export default function LessonPlayerScreen() {
  const params = useLocalSearchParams<{ lesson_id?: string }>();

  // TODO: use lesson_id and backend to fetch a real script.
  // For now we use the local example script from scriptGenerator.
  const demoScript = exampleUsage() as AnimationScript;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <LessonAnimationPanel script={demoScript} />
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
