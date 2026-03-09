import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { normalizeScript } from "../animation/scriptNormalizer";
import { AnimationEngine } from "../visual";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
};

type Size = { width: number; height: number };

function getCanvasSize(host: HTMLDivElement | null): Size {
  if (!host) return { width: 800, height: 600 };
  const rect = host.getBoundingClientRect();
  return {
    width: Math.max(320, Math.round(rect.width || 800)),
    height: Math.max(220, Math.round(rect.height || 600)),
  };
}

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width, height } = getCanvasSize(host);
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engineRef.current?.setSize(width, height);
    };

    resizeCanvas();

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(host);
    // Use fixed coordinate space expected by AnimationEngine (matches native/WebView).
    const W = 800;
    const H = 600;
    canvas.width = W;
    canvas.height = H;

    const engine = new AnimationEngine(ctx as any, W, H, scriptRef.current);
    engineRef.current = engine;
    engine.draw?.();

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !normalizedScript) {
      engineRef.current?.dispose();
      engineRef.current = null;
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const host = hostRef.current;
    const { width, height } = getCanvasSize(host);

    engineRef.current?.dispose();
    const engine = new AnimationEngine(
      ctx as any,
      width,
      height,
      normalizedScript as any,
      normalizedScript.concept || normalizedScript.title || "",
    );
    engineRef.current = engine;
    engine.seek(currentTimeMs ?? 0);

    if (isPlaying) engine.play();
    else engine.draw();

    return () => {
      engine.dispose();
    };
  }, [normalizedScript]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isPlaying) engine.play();
    else engine.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (currentTimeMs == null) return;
    const engine = engineRef.current;
    if (!engine) return;
    engine.seek(currentTimeMs);
  }, [currentTimeMs]);

  return (
    <View style={styles.container}>
      <div ref={hostRef as any} style={styles.host as any}>
        <canvas ref={canvasRef} style={styles.canvas as any} />
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
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
