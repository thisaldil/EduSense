import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

const SUBJECT_CHIPS = [
  { id: "science", label: "Science", icon: "flask", color: "#E8F5E9" },
  { id: "physics", label: "Physics", icon: "planet", color: "#E3F2FD" },
  { id: "literature", label: "Literature", icon: "book", color: "#FFF3E0" },
  { id: "math", label: "Math", icon: "calculator", color: "#F3E5F5" },
] as const;

type SubjectId = (typeof SUBJECT_CHIPS)[number]["id"];

export default function NewLessonScreen() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>("science");
  const [text, setText] = useState("");
  const maxChars = 2000;

  const handlePaste = async () => {
    // Implement paste functionality
    // For now, just a placeholder
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
              Choose a subject and add your lesson content. We'll transform it
              into an amazing sensory experience!
            </Text>
          </View>
        </View>

        {/* Select Subject */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose subject</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectScroll}
          >
            {SUBJECT_CHIPS.map((chip) => {
              const isActive = selectedSubject === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  style={[
                    styles.subjectCard,
                    isActive && styles.subjectCardActive,
                  ]}
                  onPress={() => setSelectedSubject(chip.id)}
                >
                  <View
                    style={[
                      styles.subjectIconCircle,
                      {
                        backgroundColor: isActive
                          ? Colors.deepBlue
                          : chip.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={chip.icon as any}
                      size={28}
                      color={isActive ? "#FFFFFF" : Colors.deepBlue}
                    />
                  </View>
                  <Text
                    style={[
                      styles.subjectLabel,
                      isActive && styles.subjectLabelActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                  {isActive && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
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
              <Pressable style={styles.pasteButton} onPress={handlePaste}>
                <Ionicons name="clipboard" size={16} color={Colors.deepBlue} />
                <Text style={styles.pasteButtonText}>Paste</Text>
              </Pressable>
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
              {text.length > 0 && (
                <Pressable onPress={() => setText("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.light.textSecondary}
                  />
                </Pressable>
              )}
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
          ]}
          onPress={() => router.push("/processing")}
          disabled={text.length === 0}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="rocket" size={24} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>
              Generate Sensory Lesson
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

  // Subject Cards
  subjectScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  subjectCard: {
    width: 110,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  subjectCardActive: {
    borderColor: Colors.deepBlue,
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.2,
  },
  subjectIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectLabel: {
    ...Typography.label,
    color: Colors.light.text,
    textAlign: "center",
  },
  subjectLabelActive: {
    color: Colors.deepBlue,
    fontFamily: "Inter_600SemiBold",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.teal,
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
