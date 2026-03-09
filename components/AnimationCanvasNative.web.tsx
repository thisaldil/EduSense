import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { normalizeScript } from "../animation/scriptNormalizer";
import { AnimationEngine } from "../visual";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
};

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

  const normalizedScript = useMemo(
    () => (script ? normalizeScript(script) : null),
    [script],
  );

  const scriptWithoutTextActors = useMemo(() => {
    if (!normalizedScript) return null;
    try {
      return {
        ...normalizedScript,
        scenes: (normalizedScript.scenes || []).map((scene: any) => ({
          ...scene,
          actors: (scene.actors || []).filter(
            (actor: any) => actor && !actor.text,
          ),
        })),
      };
    } catch {
      return normalizedScript;
    }
  }, [normalizedScript]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const resizeCanvas = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width || LOGICAL_WIDTH));
      const height = Math.max(
        220,
        Math.round(rect.height || LOGICAL_HEIGHT * 0.5),
      );
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(LOGICAL_WIDTH * dpr);
      canvas.height = Math.round(LOGICAL_HEIGHT * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engineRef.current?.setSize(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    };

    resizeCanvas();

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(host);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scriptWithoutTextActors) {
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
      scriptWithoutTextActors as any,
      scriptWithoutTextActors.concept || scriptWithoutTextActors.title || "",
    );
    engineRef.current = engine;
    // Start from t=0; playback / seeking is handled in a separate effect.
    engine.seek(0);

    return () => {
      engine.dispose();
    };
  }, [scriptWithoutTextActors]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    // If an external clock is provided, drive the engine via seek().
    // Otherwise, fall back to the engine's internal play/pause loop.
    if (currentTimeMs != null) {
      engine.seek(currentTimeMs);
      return;
    }
    if (isPlaying) {
      engine.play();
    } else {
      engine.pause();
    }
  }, [currentTimeMs, isPlaying]);

  return (
    <View style={styles.container}>
      <div ref={hostRef as any} style={styles.host as any}>
        <canvas ref={canvasRef} style={styles.canvas as any} />
      </div>
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
  host: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  canvas: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0F172A",
  },
});
