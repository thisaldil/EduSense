import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Colors, Typography } from "@/constants/theme";
import { createLesson } from "@/services/lessons";
import { analyzeNoteImage } from "@/services/vision";

const generateSessionId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;

const isWeb = Platform.OS === "web";
let webRecognition: any | null = null;

// Dynamically load native voice module so Expo Go (which does not bundle it)
// does not crash when this screen is imported.
let NativeVoice: any = null;

if (!isWeb) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const voiceModule = require("@react-native-voice/voice");
    NativeVoice = voiceModule.default ?? voiceModule;
  } catch {
    NativeVoice = null;
  }
}

function inferLessonMetaFromText(content: string): {
  title: string;
  subject: string;
} {
  const trimmed = content.trim();
  if (!trimmed) {
    return { title: "Lesson", subject: "General" };
  }

  const firstLine = trimmed.split(/\r?\n/)[0] ?? trimmed;
  const sentence = firstLine.split(/[.!?]/)[0] || firstLine;
  const match =
    sentence.match(/^(.{0,80}?)(?:\s+is\b|\s+are\b|[:\-—])/i) ??
    sentence.match(/^(.{0,80}?)\b(using|about|for)\b/i);

  let raw = (match && match[1]) || sentence;
  raw = raw.replace(/["“”]/g, "").trim();

  if (!raw || raw.length < 3) {
    return { title: "Lesson", subject: "General" };
  }

  const words = raw.split(/\s+/).slice(0, 6);
  const phrase = words.join(" ");
  const toTitleCase = (s: string) =>
    s
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const subject = toTitleCase(phrase);
  const title = subject;
  return { title, subject };
}

export default function NewLessonScreen() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const maxChars = 2000;

  React.useEffect(() => {
    if (isWeb || !NativeVoice) {
      // Voice is not supported on web; we use Web Speech API instead.
      return;
    }

    NativeVoice.onSpeechStart = () => {
      setIsRecording(true);
    };

    NativeVoice.onSpeechResults = (event: any) => {
      const value = event.value?.[0] ?? "";
      setText((prev) => (prev ? `${prev} ${value}` : value));
    };

    NativeVoice.onSpeechEnd = () => {
      setIsRecording(false);
    };

    NativeVoice.onSpeechError = (_event: any) => {
      setIsRecording(false);
    };

    return () => {
      NativeVoice.destroy().then(NativeVoice.removeAllListeners).catch(() => {});
    };
  }, []);

  const startRecording = async () => {
    if (isWeb) {
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          Alert.alert(
            "Speech not supported",
            "Your browser does not support speech recognition.",
          );
          return;
        }

        webRecognition = new SpeechRecognition();
        webRecognition.lang = "en-US";
        webRecognition.continuous = false;
        webRecognition.interimResults = false;
        webRecognition.onresult = (event: any) => {
          const value =
            event.results?.[0]?.[0]?.transcript ??
            event.results?.[0]?.[0]?.transcript;
          if (!value) return;
          setText((prev) => (prev ? `${prev} ${value}` : value));
        };
        webRecognition.onerror = () => {
          setIsRecording(false);
        };
        webRecognition.onend = () => {
          setIsRecording(false);
        };

        setIsRecording(true);
        webRecognition.start();
      } catch {
        setIsRecording(false);
      }
      return;
    }

    if (!NativeVoice) {
      Alert.alert(
        "Speech not available",
        "Voice input is not supported in this build.",
      );
      return;
    }

    try {
      await NativeVoice.start("en-US");
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (isWeb) {
      try {
        if (webRecognition) {
          webRecognition.stop();
        }
      } catch {
        // ignore
      } finally {
        setIsRecording(false);
      }
      return;
    }

    try {
      if (NativeVoice) {
        await NativeVoice.stop();
      }
    } catch {
      // ignore
    } finally {
      setIsRecording(false);
    }
  };

  const handlePaste = async () => {
    // Implement paste functionality
    // For now, just a placeholder
  };

  const handleScanNoteImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera permission is required to scan a note.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const uri = result.assets[0].uri;
      const extractedText = await analyzeNoteImage(uri);

      if (!extractedText?.trim()) {
        Alert.alert(
          "No text found",
          "We couldn't detect any text in this photo.",
        );
        return;
      }

      setText((prev) =>
        prev ? `${prev.trim()}\n\n${extractedText.trim()}` : extractedText.trim(),
      );
    } catch (error: any) {
      Alert.alert(
        "Scan failed",
        error?.message || "Unable to analyze the note image.",
      );
    }
  };

  const handleGenerate = async () => {
    if (text.length === 0) return;

    const sessionId = generateSessionId();

    setIsLoading(true);
    try {
      const { title, subject } = inferLessonMetaFromText(text);
      const lesson = await createLesson({
        title,
        subject,
        content: text,
      });

      // Navigate to processing screen with lesson_id and raw text so it can
      // call the transmutation endpoint based on the current cognitive state.
      router.push({
        pathname: "/lessons/processing",
        params: {
          lesson_id: lesson.id,
          raw_text: text,
          session_id: sessionId,
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to create lesson. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create New Lesson</Text>
            <Text style={styles.headerSubtitle}>
              Set up the content for your new lesson.
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Illustration Card */}
        <View style={styles.illustrationCard}>
          <View style={styles.illustrationContent}>
            <View style={styles.illustrationIcon}>
              <Ionicons name="bulb" size={48} color={Colors.brightOrange} />
            </View>
            <Text style={styles.illustrationTitle}>Start Your Journey</Text>
            <Text style={styles.illustrationText}>
              Add your lesson content below. We'll transform it into an amazing
              sensory experience!
            </Text>
          </View>
        </View>

        {/* Lesson Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Add your content</Text>
            <Pressable style={styles.tipButton} hitSlop={8}>
              <Ionicons name="help-circle" size={20} color={Colors.deepBlue} />
            </Pressable>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <View style={styles.inputHeaderLeft}>
                <View style={styles.dotIndicator} />
                <Text style={styles.inputHeaderText}>Lesson Text</Text>
              </View>
              <View style={styles.inputHeaderActions}>
                <Pressable style={styles.pasteButton} onPress={handlePaste}>
                  <Ionicons name="clipboard" size={16} color={Colors.deepBlue} />
                  <Text style={styles.pasteButtonText}>Paste</Text>
                </Pressable>
                <Pressable
                  style={styles.scanButton}
                  onPress={handleScanNoteImage}
                  hitSlop={8}
                >
                  <Ionicons name="camera" size={16} color={Colors.deepBlue} />
                  <Text style={styles.scanButtonText}>Scan note</Text>
                </Pressable>
              </View>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Paste your lesson here... 

Example: 'Photosynthesis is how plants make their food using sunlight, water, and air. It's like cooking with sunshine!' ☀️🌱"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              textAlignVertical="top"
              value={text}
              onChangeText={(value) =>
                value.length <= maxChars ? setText(value) : null
              }
            />

            <View style={styles.inputFooter}>
              <View style={styles.charCounter}>
                <Ionicons
                  name="text"
                  size={14}
                  color={Colors.light.textSecondary}
                />
                <Text style={styles.charCounterText}>
                  {text.length} / {maxChars}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {text.length > 0 && (
                  <Pressable onPress={() => setText("")}>
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.light.textSecondary}
                    />
                  </Pressable>
                )}
                <Pressable
                  style={[
                    styles.micButton,
                    isRecording && styles.micButtonActive,
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isRecording ? "mic-off" : "mic"}
                    size={18}
                    color={isRecording ? "#FFFFFF" : Colors.deepBlue}
                  />
                  <Text
                    style={[
                      styles.micButtonText,
                      isRecording && { color: "#FFFFFF" },
                    ]}
                  >
                    {isRecording ? "Stop" : "Speak"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="sparkles" size={20} color={Colors.teal} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sensory lesson generation</Text>
            <Text style={styles.infoText}>
              Your text will be turned into interactive visuals, sounds, and
              activities.
            </Text>
          </View>
        </View>

        {/* Generate Button */}
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
            (text.length === 0 || isLoading) && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={text.length === 0 || isLoading}
        >
          <View style={styles.buttonContent}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="rocket" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.generateButtonText}>
              {isLoading ? "Creating Lesson..." : "Generate Sensory Lesson"}
            </Text>
          </View>
          <View style={styles.buttonShine} />
        </Pressable>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Quick tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>
                Keep sentences simple and clear
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>
                Add fun facts to make it interesting
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>
                Use examples kids can relate to
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  headerSubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },

  // Illustration Card
  illustrationCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  illustrationContent: {
    alignItems: "center",
    gap: 12,
  },
  illustrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  illustrationTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  illustrationText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  tipButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  // Input Card
  inputCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  inputHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  inputHeaderText: {
    ...Typography.label,
    color: Colors.light.text,
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: `${Colors.deepBlue}10`,
  },
  pasteButtonText: {
    ...Typography.small,
    color: Colors.deepBlue,
    fontFamily: "Inter_600SemiBold",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: `${Colors.teal}10`,
  },
  scanButtonText: {
    ...Typography.small,
    color: Colors.deepBlue,
    fontFamily: "Inter_600SemiBold",
  },
  textInput: {
    ...Typography.body,
    color: Colors.light.text,
    minHeight: 160,
    marginBottom: 12,
  },
  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  charCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  charCounterText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },

  micButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: `${Colors.deepBlue}10`,
  },
  micButtonActive: {
    backgroundColor: Colors.brightOrange,
  },
  micButtonText: {
    ...Typography.small,
    color: Colors.deepBlue,
    fontFamily: "Inter_600SemiBold",
  },

  // Info Card
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: `${Colors.teal}15`,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: `${Colors.teal}30`,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
    marginBottom: 4,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },

  // Generate Button
  generateButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.deepBlue,
    overflow: "hidden",
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  generateButtonText: {
    ...Typography.button,
    fontSize: 18,
    color: "#FFFFFF",
  },
  buttonShine: {
    position: "absolute",
    top: 0,
    left: -100,
    width: 100,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ skewX: "-20deg" }],
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },

  // Tips Card
  tipsCard: {
    marginHorizontal: 20,
    backgroundColor: `${Colors.brightOrange}15`,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${Colors.brightOrange}30`,
  },
  tipsTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brightOrange,
    marginTop: 7,
  },
  tipText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    flex: 1,
  },
});
