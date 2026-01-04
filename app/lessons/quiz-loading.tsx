import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

export default function QuizLoadingScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    correct?: string;
    total?: string;
    quiz_id?: string;
    lesson_id?: string;
  }>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace({
        pathname: "/lessons/quiz-result",
        params: {
          score: params.score,
          correct: params.correct,
          total: params.total,
          quiz_id: params.quiz_id,
          lesson_id: params.lesson_id,
        },
      });
    }, 2200);

    return () => clearTimeout(timeout);
  }, [
    params.score,
    params.correct,
    params.total,
    params.quiz_id,
    params.lesson_id,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.appBar}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={18} color={Colors.deepBlue} />
            </View>
            <Text style={styles.headerTitle}>Checking your answers</Text>
            <View style={styles.iconCircle} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.loaderCircle}>
            <ActivityIndicator size="large" color={Colors.deepBlue} />
          </View>
          <Text style={styles.title}>Generating feedback</Text>
          <Text style={styles.subtitle}>
            We’re reviewing your responses and preparing a summary. This will
            only take a moment.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loaderCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    ...Typography.h3,
    color: Colors.light.text,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
  },
});
