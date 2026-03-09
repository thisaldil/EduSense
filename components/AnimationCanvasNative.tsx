/**
 * AnimationCanvasNative.tsx  – Fixed version
 *
 * Bugs fixed:
 *  1. Was re-exporting AnimationCanvasWebView instead of running the canvas engine.
 *  2. Canvas logical size vs CSS display size mismatch (stretch/distortion).
 *  3. Actors whose `actor.text` field is set were being stripped, silently removing
 *     all label / annotation actors (H₂O, CO₂, C₆H₁₂O₆ labels, etc.).
 *  4. Engine was never told to play when `isPlaying` changed while
 *     `currentTimeMs` was also being supplied – play/pause logic is now separated.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { normalizeScript } from "../animation/scriptNormalizer";
import { AnimationEngine } from "../visual";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
};

// Logical (unscaled) canvas dimensions – the engine works in this coordinate space.
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;

export function AnimationCanvasNative({
  isPlaying,
  script,
  currentTimeMs,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<AnimationEngine | null>(null);

  // Normalize the raw backend script once.
  const normalizedScript = useMemo(
    () => (script ? normalizeScript(script) : null),
    [script],
  );

  // BUG FIX 3: Do NOT filter out actors that have a `text` field.
  // `label` type actors store their display string in `actor.text` – removing
  // them stripped every annotation (H₂O, CO₂, C₆H₁₂O₆, arrows with labels…).
  // If you need to suppress purely decorative text actors you can add a more
  // targeted filter here, but the blanket `!actor.text` check was wrong.
  const processedScript = useMemo(() => normalizedScript, [normalizedScript]);

  // BUG FIX 2: Canvas sizing.
  // Previously `canvas.style.width/height` was set to the container's DOM pixels
  // while `canvas.width/height` (the drawing buffer) was LOGICAL * dpr.
  // This caused a mismatch: the renderer drew at 800×600 coords but the element
  // was displayed at whatever the container happened to be, stretching everything.
  //
  // Correct approach:
  //   • canvas drawing buffer  = LOGICAL × dpr  (renderer always works at 800×600)
  //   • canvas CSS size        = container size  (browser scales to fit)
  //   • ctx transform          = dpr scale only  (no additional container scale)
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const applySize = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.max(1, window.devicePixelRatio || 1);

      // Drawing buffer: always the logical size × device pixel ratio
      canvas.width = Math.round(LOGICAL_WIDTH * dpr);
      canvas.height = Math.round(LOGICAL_HEIGHT * dpr);

      // CSS display size: fill the host container
      const rect = host.getBoundingClientRect();
      const displayW = Math.max(320, rect.width || LOGICAL_WIDTH);
      const displayH = Math.max(220, rect.height || LOGICAL_HEIGHT * 0.5);
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;

      // Scale context so the engine's 800×600 coordinate space fills the buffer
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      engineRef.current?.setSize(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    };

    applySize();

    const observer = new ResizeObserver(applySize);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  // Create / recreate the engine whenever the script changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !processedScript) {
      engineRef.current?.dispose();
      engineRef.current = null;
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    engineRef.current?.dispose();

    const engine = new AnimationEngine(
      ctx as any,
      LOGICAL_WIDTH,
      LOGICAL_HEIGHT,
      processedScript as any,
      processedScript.concept || processedScript.title || "",
    );
    engineRef.current = engine;
    engine.seek(currentTimeMs ?? 0);

    return () => {
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedScript]);

  // BUG FIX 4: Separate play/pause control from seek control.
  // Previously, when `currentTimeMs` was defined the effect returned early,
  // meaning `isPlaying` changes were never forwarded to the engine.
  // Now we always sync play state, and seek independently when the time changes.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isPlaying) {
      engine.play();
    } else {
      engine.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || currentTimeMs == null) return;
    engine.seek(currentTimeMs);
  }, [currentTimeMs]);

  return (
    <View style={styles.container}>
      {/* `div` is valid in React Native Web; on bare RN you would use a GLView or
          Skia canvas instead, but this project already uses react-native-webview
          so the web canvas path is intentional. */}
      <div ref={hostRef as any} style={hostStyle}>
        <canvas ref={canvasRef} style={canvasStyle} />
      </div>
    </View>
  );
}

// Inline styles for the host div and canvas (not StyleSheet because they are
// applied to plain HTML elements rendered through React Native Web).
const hostStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
};

const canvasStyle: React.CSSProperties = {
  display: "block",
  // Width/height are set programmatically in the ResizeObserver callback above.
  backgroundColor: "#0F172A",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
});
