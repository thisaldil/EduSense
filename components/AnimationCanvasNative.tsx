import React from "react";
import { StyleSheet, View } from "react-native";

import { AnimationCanvasWebView } from "./AnimationCanvasWebView";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
  onTogglePlayRequest?: () => void;
};

// Logical (unscaled) canvas dimensions – the engine works in this coordinate space.
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;

export function AnimationCanvasNative({
  isPlaying,
  script,
  currentTimeMs,
  onTogglePlayRequest,
}: Props) {
  return (
    <View style={styles.container}>
      <AnimationCanvasWebView
        isPlaying={isPlaying}
        script={script}
        currentTimeMs={currentTimeMs}
        onTogglePlayRequest={onTogglePlayRequest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
});
