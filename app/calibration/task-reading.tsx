import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import { NLPTask } from "./index";
import { Colors } from "@/constants/theme";

export default function CalibrationReadingTaskScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Standalone view of Task 1 for debugging/preview.
          onComplete is a no-op here because BrainSyncScreen orchestrates
          the real calibration flow. */}
      <NLPTask onComplete={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 16,
  },
});

