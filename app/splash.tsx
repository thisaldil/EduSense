import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false, // width animation
    }).start();
  }, [progress]);

  useEffect(() => {
    if (isLoading) return;

    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/onboarding");
        return;
      }

      const isCalibrated =
        (user as any)?.is_calibrated === true ||
        (user as any)?.baseline_cognitive_load != null;

      if (isCalibrated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/calibration");
      }
    }, 2600);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, user]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require("@/assets/images/splash-icon.png")}
            style={styles.logo}
            contentFit="contain"
          />

          <Text style={styles.title}>EduSense</Text>
          <Text style={styles.subtitle}>
            Learn by Seeing, Hearing &amp; Feeling
          </Text>
          {/* <Text style={styles.subtitle}>
          Learn Beyond Words — See, Hear & Feel Concepts
          </Text> */}
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Loading resources</Text>
            <ActivityIndicator color={Colors.deepBlue} size="small" />
          </View>

          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>

          <Text style={styles.footer}>v1.0.4 © Sensory Learning Co.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logo: {
    width: 160,
    height: 160,
  },
  bottomArea: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  progressHeader: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  progressLabel: {
    ...Typography.small,
    letterSpacing: 0.6,
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
  },
  progressBar: {
    width: "90%",
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.light.border,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.deepBlue,
  },
  footer: {
    ...Typography.small,
    marginTop: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
