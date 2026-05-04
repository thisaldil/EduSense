/**
 * AnimationCanvasNative.android.tsx — Android uses WebView instead of GLView.
 *
 * expo-2d-context (GLView) has known issues on Android: crashes, gradient bugs,
 * text not rendering. This file delegates to AnimationCanvasWebView so playback
 * uses a real HTML canvas inside a WebView.
 */

import { AnimationCanvasWebView } from "./AnimationCanvasWebView";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
};

export function AnimationCanvasNative({ isPlaying, script, currentTimeMs }: Props) {
  return (
    <AnimationCanvasWebView
      isPlaying={isPlaying}
      script={script}
      currentTimeMs={currentTimeMs}
    />
  );
}
