/**
 * AnimationCanvasNative.android.tsx — Android uses WebView instead of GLView.
 *
 * expo-2d-context (GLView) has known issues on Android: crashes, gradient bugs,
 * text not rendering. This file delegates to AnimationCanvasWebView so playback
 * uses a real HTML canvas inside a WebView.
 */

import { StyleSheet, View } from "react-native";

import { AnimationCanvasWebView } from "./AnimationCanvasWebView";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
  onTogglePlayRequest?: () => void;
};

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
