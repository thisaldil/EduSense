import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import { VisualTask } from "./index";
import { Colors } from "@/constants/theme";

export default function CalibrationVisualTaskScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Standalone view of Task 2 for debugging/preview.
          onComplete is a no-op here because BrainSyncScreen orchestrates
          the real calibration flow. */}
      <VisualTask onComplete={() => {}} />
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

