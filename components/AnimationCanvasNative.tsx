import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { AnimationEngine } from "@/animation/animationEngine";
import { exampleUsage } from "@/animation/scriptGenerator";

type Props = {
  /** Whether the animation should currently be playing */
  isPlaying: boolean;
};

export function AnimationCanvasNative({ isPlaying }: Props) {
  const engineRef = useRef<AnimationEngine | null>(null);
  const scriptRef = useRef(exampleUsage());

  // Render a simple placeholder on web to avoid importing expo-2d-context (which expects window)
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, styles.webFallback]}>
        <Text style={styles.webFallbackText}>
          Canvas animation is available on the mobile app.
        </Text>
      </View>
    );
  }

  // Lazy-require native-only modules so they are not loaded in the web bundle
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GLView } = require("expo-gl") as typeof import("expo-gl");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Expo2DContext = require("expo-2d-context").default as any;

  const handleContextCreate = async (gl: any) => {
    const ctx = new Expo2DContext(gl as any, {
      // Allow enough gradient stops for our backgrounds/actors
      maxGradStops: 8,
      renderWithOffscreenBuffer: false,
      fastFillTesselation: false,
    });

    // Polyfill ctx.ellipse for expo-2d-context if missing
    if (!(ctx as any).ellipse) {
      (ctx as any).ellipse = function (
        x: number,
        y: number,
        radiusX: number,
        radiusY: number,
        rotation: number,
        startAngle: number,
        endAngle: number,
        anticlockwise?: boolean,
      ) {
        this.save();
        this.translate(x, y);
        this.rotate(rotation);
        this.scale(radiusX, radiusY);
        this.beginPath();
        this.arc(0, 0, 1, startAngle, endAngle, anticlockwise);
        this.restore();
      };
    }

    // Some canvas shadow properties are not supported by expo-2d-context on all platforms.
    // Define safe no-op accessors so actor code can assign them without runtime errors.
    ["shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"].forEach(
      (prop) => {
        try {
          Object.defineProperty(ctx, prop, {
            configurable: true,
            enumerable: true,
            get() {
              return undefined;
            },
            set(_value) {
              // no-op – shadows are ignored on platforms that don't support them
            },
          });
        } catch {
          // Ignore if property cannot be redefined
        }
      },
    );

    // Some platforms/fonts are limited; avoid crashing when actors set unsupported font families.
    try {
      Object.defineProperty(ctx, "font", {
        configurable: true,
        enumerable: true,
        get() {
          return "12px sans-serif";
        },
        set(value: string) {
          // Best-effort: extract size, ignore family to keep expo-2d-context happy
          const match = /(\d+)px/.exec(value);
          const size = match ? parseInt(match[1], 10) : 12;
          (this as any)._fontSize = size;
        },
      });
    } catch {
      // If we can't override, rely on default behavior
    }

    // Text rendering relies on a font system that may not be initialized on native.
    // To avoid crashes during testing, make text drawing safe no-ops.
    (ctx as any).fillText = function () {
      // ignore text on native canvas for now
    };
    (ctx as any).strokeText = function () {
      // ignore text on native canvas for now
    };
    (ctx as any).measureText = function () {
      return { width: 0 };
    };

    // Minimal canvas-like wrapper that AnimationEngine expects
    const canvas = {
      width: gl.drawingBufferWidth ?? 800,
      height: gl.drawingBufferHeight ?? 600,
      getContext: () => ctx as any,
    };

    const engine = new AnimationEngine(canvas as any, scriptRef.current);
    engineRef.current = engine;

    if (isPlaying) {
      engine.play();
    } else {
      engine.draw?.();
    }
  };

  useEffect(() => {
    if (!engineRef.current) return;
    if (isPlaying) {
      engineRef.current.play();
    } else {
      engineRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={handleContextCreate} />
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
  webFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  webFallbackText: {
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});

