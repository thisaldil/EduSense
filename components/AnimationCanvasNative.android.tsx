/**
 * AnimationCanvasNative.android.tsx — Android uses WebView instead of GLView.
 *
 * expo-2d-context (GLView) has known issues on Android: crashes, gradient bugs,
 * text not rendering. test-visual works because it uses WebView with a real
 * HTML canvas. This file delegates to AnimationCanvasWebView for Android.
 */

import { AnimationCanvasWebView } from "./AnimationCanvasWebView";

type Props = {
  isPlaying: boolean;
  script?: any | null;
};

export function AnimationCanvasNative({ isPlaying, script }: Props) {
  return <AnimationCanvasWebView isPlaying={isPlaying} script={script} />;
}
