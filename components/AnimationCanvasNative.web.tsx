import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { AnimationEngine } from "@/animation/animationEngine";
import { exampleUsage } from "@/animation/scriptGenerator";

type Props = {
  /** Whether the animation should currently be playing */
  isPlaying: boolean;
};

/**
 * Web-specific implementation of the animation canvas.
 * Uses a regular HTML <canvas> and the same AnimationEngine as the original React web app.
 */
export function AnimationCanvasNative({ isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<AnimationEngine | null>(null);
  const scriptRef = useRef(exampleUsage());

  // Initialize engine once when the canvas is ready
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new AnimationEngine(canvas as any, scriptRef.current);
    engineRef.current = engine;
    engine.draw?.();

    return () => {
      engine.pause?.();
    };
  }, []);

  // Play / pause based on prop
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isPlaying) {
      engine.play();
    } else {
      engine.pause();
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
});
