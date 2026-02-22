import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import * as Haptics from "expo-haptics";
// @ts-expect-error - Audio is exported but types may not be fully recognized
import { Audio } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography } from "@/constants/theme";
import { API_BASE_URL } from "@/config/api";

type HapticEvent = {
  entity: string;
  word: string;
  start: number;
};

type LogEntry = {
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
};

type HapticProfile = {
  intensity: "light" | "medium" | "heavy";
  color: string;
  emoji: string;
};

// Map entities to color / emoji / intensity for RN UI
const getHapticProfile = (entity: string): HapticProfile => {
  const emojiMap: Record<string, string> = {
    HEAT: "🔥",
    SUN: "☀️",
    FRICTION: "⚡",
    FUEL: "⛽",
    ELECTRICITY: "⚡",
    BATTERY: "🔋",
    GENERATOR: "🔌",
    LIGHT: "💡",
    MIRROR: "🪞",
    PRISM: "🌈",
    LENS: "🔍",
    SHADOW: "🌑",
    STAR: "⭐",
    WATER: "💧",
    RAIN: "🌧️",
    STEAM: "💨",
    CLOUD: "☁️",
    SMOKE: "💨",
    AIR: "💨",
    WIND: "💨",
    MAGMA: "🌋",
    SOLID: "🟦",
    IRON: "⚙️",
    COPPER: "🟫",
    GOLD: "🪙",
    WOOD: "🪵",
    PLASTIC: "🔴",
    RUBBER: "⚫",
    GLASS: "🪟",
    DIAMOND: "💎",
    ICE: "🧊",
    SALT: "🧂",
    MAGNET: "🧲",
    POLE: "🧭",
    COMPASS: "🧭",
    GRAVITY: "🌍",
    PLANET: "🪐",
    MOON: "🌙",
    SOUND: "🔊",
    VIBRATION: "📳",
    EAR: "👂",
    ANIMAL: "🐾",
    BLOOD: "🩸",
    MUSCLE: "💪",
    LEAF: "🍃",
    ROOT: "🌳",
  };

  const entityKey = entity.replace("B-", "").replace("I-", "").toUpperCase();
  const emoji = emojiMap[entityKey] || "❓";

  // Simple intensity mapping based on type
  let intensity: HapticProfile["intensity"] = "light";
  if (["ELECTRICITY", "MAGNET", "GRAVITY", "MAGMA"].includes(entityKey)) {
    intensity = "heavy";
  } else if (
    ["HEAT", "SUN", "IRON", "COPPER", "GOLD", "FRICTION"].includes(entityKey)
  ) {
    intensity = "medium";
  }

  const colorMap: Record<HapticProfile["intensity"], string> = {
    light: "#6c63ff",
    medium: "#ff9800",
    heavy: "#f44336",
  };

  return {
    intensity,
    color: colorMap[intensity],
    emoji,
  };
};

const triggerHaptic = async (profile: HapticProfile) => {
  try {
    if (profile.intensity === "light") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (profile.intensity === "medium") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch {
    // ignore device haptic errors
  }
};

export default function HapticsTestScreen() {
  const [inputText, setInputText] = useState("");
  const [hapticEvents, setHapticEvents] = useState<HapticEvent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<HapticProfile | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time: timestamp, message, type }].slice(-5));
  };

  const clearScheduled = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setHapticEvents([]);
    setLogs([]);
    addLog("Sending text to AI model...", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status.toString()} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.haptics && data.haptics.length > 0) {
        setHapticEvents(data.haptics as HapticEvent[]);
        addLog(`Found ${data.haptics.length} sensory events!`, "success");
      } else {
        setHapticEvents([]);
        const errorMsg = data.error || "No sensory patterns detected";
        const suggestion = data.suggestion || "";
        addLog(`${errorMsg}${suggestion ? ` - ${suggestion}` : ""}`, "warning");
      }
    } catch (error: unknown) {
      setHapticEvents([]);
      const err = error as Error;
      addLog(`Backend connection failed: ${err.message}`, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playExperience = async () => {
    if (hapticEvents.length === 0 || isPlaying) return;

    setIsPlaying(true);
    setProgress(0);
    setCurrentWord(null);
    setActiveProfile(null);
    clearScheduled();
    addLog("Starting multimodal experience...", "info");
    addLog("Generating speech with Kokoro TTS...", "info");

    try {
      // Fetch audio from Kokoro TTS endpoint
      addLog("Fetching audio from TTS endpoint...", "info");
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          voice_name: "af_heart",
          language_code: "a",
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `TTS failed: ${response.status.toString()} ${
            response.statusText
          } - ${errorText}`
        );
      }

      addLog("TTS response received, processing audio...", "info");

      // Check content type to determine response format
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      let audioUri: string;

      if (contentType?.includes("application/json")) {
        // Response is JSON with base64 audio
        const data = await response.json();
        console.log("TTS JSON response keys:", Object.keys(data));

        // Try different possible keys for base64 audio
        const base64Audio =
          data.audio_base64 || data.audio || data.data || data.content;

        if (!base64Audio) {
          throw new Error(
            `No audio data found in response. Keys: ${Object.keys(data).join(
              ", "
            )}`
          );
        }

        // Create data URI
        const mimeType = data.mime_type || data.content_type || "audio/wav";
        audioUri = `data:${mimeType};base64,${base64Audio}`;
        addLog("Audio converted from base64 JSON", "info");
      } else {
        // Response is binary audio (blob)
        addLog("Response is binary audio, converting...", "info");
        const audioBlob = await response.blob();
        console.log(
          "Audio blob size:",
          audioBlob.size,
          "type:",
          audioBlob.type
        );

        // Convert blob to data URI using FileReader
        audioUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            if (reader.result && typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("Failed to convert blob to data URI"));
            }
          };

          reader.onerror = () => {
            reject(new Error("FileReader error while converting blob"));
          };

          reader.readAsDataURL(audioBlob);
        });
        addLog("Audio blob converted to data URI", "info");
      }

      console.log("Audio URI length:", audioUri.length);
      addLog("Creating audio sound object...", "info");

      // Create audio sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false }
      );

      soundRef.current = sound;
      addLog("Audio sound object created", "info");

      // Wait for audio to load and get duration
      // Sometimes duration is not immediately available, so we wait for it
      addLog("Waiting for audio to load...", "info");

      let duration: number | null = null;
      let retries = 0;
      const maxRetries = 20; // Wait up to 2 seconds (20 * 100ms)

      while (retries < maxRetries && !duration) {
        const status = await sound.getStatusAsync();
        console.log(
          `Audio status (attempt ${retries + 1}):`,
          JSON.stringify(status, null, 2)
        );

        if (status.isLoaded && status.durationMillis) {
          duration = status.durationMillis;
          break;
        }

        if (!status.isLoaded && status.error) {
          throw new Error(`Audio failed to load: ${status.error}`);
        }

        // Wait 100ms before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }

      if (!duration) {
        // If duration still not available, try using playback status listener
        addLog("Duration not available yet, using status listener...", "info");

        const resolvedDuration = await new Promise<number>(
          (resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30; // 3 seconds max wait
            let resolved = false;

            const checkStatus = async () => {
              const status = await sound.getStatusAsync();

              if (status.isLoaded && status.durationMillis) {
                resolved = true;
                resolve(status.durationMillis);
                return;
              }

              if (status.error) {
                resolved = true;
                reject(new Error(`Audio load error: ${status.error}`));
                return;
              }

              attempts++;
              if (attempts >= maxAttempts) {
                resolved = true;
                reject(new Error("Timeout waiting for audio duration"));
                return;
              }

              setTimeout(checkStatus, 100);
            };

            // Set up status listener as backup
            sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
              if (!resolved && status.isLoaded && status.durationMillis) {
                resolved = true;
                resolve(status.durationMillis);
              }
            });

            checkStatus();
          }
        );

        duration = resolvedDuration;
      }

      if (!duration) {
        throw new Error("Audio duration not available after waiting");
      }

      addLog(
        `Audio loaded: ${(duration / 1000).toFixed(2)}s duration`,
        "success"
      );

      // Progress tracking
      progressIntervalRef.current = setInterval(async () => {
        const currentStatus = await sound.getStatusAsync();
        if (currentStatus.isLoaded) {
          if (currentStatus.isPlaying && currentStatus.durationMillis) {
            const pct =
              (currentStatus.positionMillis! / currentStatus.durationMillis) *
              100;
            setProgress(Math.min(pct, 100));
          } else {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
        }
      }, 100);

      // Schedule haptic events based on audio duration
      hapticEvents.forEach((event, idx) => {
        const profile = getHapticProfile(event.entity);
        const textLength = inputText.length || 1;
        const estimatedDelay = (event.start / textLength) * duration;

        const timeout = setTimeout(async () => {
          addLog(`Triggering: ${event.entity}`, "success");
          setCurrentWord(event.word);
          setActiveProfile(profile);
          await triggerHaptic(profile);

          const clearTimeoutId = setTimeout(() => {
            if (idx === hapticEvents.length - 1) {
              setCurrentWord(null);
              setActiveProfile(null);
            }
          }, 600);
          timeoutsRef.current.push(clearTimeoutId);
        }, estimatedDelay);

        timeoutsRef.current.push(timeout);
      });

      // Set up playback status update listener
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setProgress(100);
            setCurrentWord(null);
            setActiveProfile(null);
            addLog("Experience completed!", "success");
            clearScheduled();
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
        } else if (status.error) {
          console.error("Audio playback error:", status.error);
          addLog(`Playback error: ${status.error}`, "error");
          setIsPlaying(false);
        }
      });

      // Start playback
      addLog("Starting audio playback...", "info");
      await sound.playAsync();
      addLog("Audio playback started", "success");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("TTS error:", err);
      console.error("Error stack:", err.stack);
      addLog(`TTS error: ${err.message}`, "error");
      setIsPlaying(false);
    }
  };

  const stopExperience = async () => {
    clearScheduled();

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }

    setIsPlaying(false);
    setProgress(0);
    setCurrentWord(null);
    setActiveProfile(null);
    addLog("Experience stopped", "info");
  };

  useEffect(() => {
    return () => {
      clearScheduled();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error);
        soundRef.current = null;
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Sensory Learning Companion</Text>
            <Text style={styles.subtitle}>
              Test haptic patterns on your Android device
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Educational Text Input</Text>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a science sentence (e.g., 'The magnet attracts iron nails')"
              style={styles.textArea}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                (isAnalyzing || !inputText.trim()) && styles.disabledButton,
              ]}
              onPress={analyzeText}
              disabled={isAnalyzing || !inputText.trim()}
            >
              <Ionicons
                name="flash-outline"
                size={20}
                color="#ffffff"
                style={styles.buttonIcon}
              />
              <Text style={styles.primaryButtonText}>
                {isAnalyzing ? "Analyzing..." : "1. Analyze Text"}
              </Text>
            </Pressable>

            {!isPlaying ? (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                  hapticEvents.length === 0 && styles.disabledSecondary,
                ]}
                onPress={playExperience}
                disabled={hapticEvents.length === 0}
              >
                <Ionicons
                  name="play-outline"
                  size={20}
                  color="#ffffff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.secondaryButtonText}>2. Play Haptics</Text>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.stopButton,
                  pressed && styles.pressed,
                ]}
                onPress={stopExperience}
              >
                <Ionicons
                  name="stop-circle-outline"
                  size={20}
                  color="#ffffff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.secondaryButtonText}>Stop</Text>
              </Pressable>
            )}
          </View>

          {isPlaying && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}

          <View
            style={[
              styles.feedbackCard,
              activeProfile && { backgroundColor: activeProfile.color },
            ]}
          >
            {activeProfile ? (
              <>
                <Text style={styles.feedbackEmoji}>{activeProfile.emoji}</Text>
                <Text style={styles.feedbackWord}>{currentWord}</Text>
                <Text style={styles.feedbackModeText}>
                  Haptic intensity: {activeProfile.intensity.toUpperCase()}
                </Text>
              </>
            ) : (
              <View style={styles.feedbackPlaceholder}>
                <Ionicons
                  name="information-circle-outline"
                  size={40}
                  color="#9e9e9e"
                />
                <Text style={styles.feedbackPlaceholderText}>
                  Sensory feedback will appear here
                </Text>
              </View>
            )}
          </View>

          {hapticEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={[Typography.h3, styles.sectionTitle]}>
                Detected Sensory Events ({hapticEvents.length})
              </Text>
              <View style={styles.eventsGrid}>
                {hapticEvents.map((event, idx) => {
                  const profile = getHapticProfile(event.entity);
                  return (
                    <View
                      key={idx.toString()}
                      style={[styles.eventCard, { borderColor: profile.color }]}
                    >
                      <Text style={styles.eventEmoji}>{profile.emoji}</Text>
                      <View style={styles.eventTextContainer}>
                        <Text style={styles.eventWord}>{event.word}</Text>
                        <Text style={styles.eventEntity}>
                          {event.entity.replace("B-", "")}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {logs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Log</Text>
              <View style={styles.logsContainer}>
                {logs.map((log, idx) => {
                  let borderColor = Colors.deepBlue;
                  if (log.type === "success") borderColor = "#28a745";
                  else if (log.type === "error") borderColor = "#dc3545";
                  else if (log.type === "warning") borderColor = "#ffc107";

                  return (
                    <View
                      key={idx.toString()}
                      style={[styles.logItem, { borderLeftColor: borderColor }]}
                    >
                      <Text style={styles.logTime}>{log.time}</Text>
                      <Text style={styles.logMessage}>{log.message}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F4FB",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  label: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E3EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#FAFBFF",
  },
  actions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.deepBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#dc3545",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  disabledButton: {
    backgroundColor: "#B0B7D0",
  },
  disabledSecondary: {
    backgroundColor: "#9AD9D1",
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    ...Typography.button,
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
  },
  secondaryButtonText: {
    ...Typography.button,
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
  },
  progressBarContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#ECEFF7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.deepBlue,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  feedbackCard: {
    marginTop: 20,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: "#F5F6FB",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  feedbackWord: {
    ...Typography.h3,
    color: "#ffffff",
    marginBottom: 4,
  },
  feedbackModeText: {
    ...Typography.caption,
    color: "#ffffff",
  },
  feedbackPlaceholder: {
    alignItems: "center",
  },
  feedbackPlaceholderText: {
    ...Typography.body,
    color: "#9e9e9e",
    marginTop: 4,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 8,
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: "#ffffff",
    minWidth: 140,
  },
  eventEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  eventTextContainer: {
    flex: 1,
  },
  eventWord: {
    ...Typography.caption,
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
  },
  eventEntity: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  logsContainer: {
    gap: 6,
    marginTop: 4,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  logTime: {
    ...Typography.caption,
    color: "#9e9e9e",
    marginRight: 8,
  },
  logMessage: {
    ...Typography.caption,
    color: Colors.light.text,
    flex: 1,
  },
});
