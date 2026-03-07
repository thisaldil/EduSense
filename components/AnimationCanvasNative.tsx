import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { AnimationEngine } from "@/visual";
import { exampleUsage } from "@/animation/scriptGenerator";

type Props = {
  /** Whether the animation should currently be playing */
  isPlaying: boolean;
  /** Engine-ready script from backend. Falls back to exampleUsage() if not provided. */
  script?: any | null;
};

export function AnimationCanvasNative({ isPlaying, script }: Props) {
  const engineRef = useRef<AnimationEngine | null>(null);

  // ─── FIX 1: Always keep scriptRef in sync with the latest prop.
  // The original code initialised scriptRef once at mount, meaning any
  // subsequent script changes (e.g. OVERLOAD → LOW state change) were
  // ignored when the GLView was already mounted.
  const scriptRef = useRef<any>(script ?? exampleUsage());
  useEffect(() => {
    if (script) scriptRef.current = script;
  }, [script]);

  // Web fallback — expo-2d-context requires a native GL context
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, styles.webFallback]}>
        <Text style={styles.webFallbackText}>
          Canvas animation is available on the mobile app.
        </Text>
      </View>
    );
  }

  // Lazy-require native-only modules so they are not bundled on web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GLView } = require("expo-gl") as typeof import("expo-gl");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Expo2DContext = require("expo-2d-context").default as any;

  const handleContextCreate = async (gl: any) => {
    const ctx = new Expo2DContext(gl as any, {
      maxGradStops: 8,
      renderWithOffscreenBuffer: false,
      fastFillTesselation: false,
    });

    // Polyfill ctx.ellipse — not present in all expo-2d-context versions
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

    // Shadow props are not supported — make them no-ops to prevent crashes
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
              /* no-op */
            },
          });
        } catch {
          /* ignore if already defined */
        }
      },
    );

    // Font assignment — extract size only, ignore family
    try {
      Object.defineProperty(ctx, "font", {
        configurable: true,
        enumerable: true,
        get() {
          return "12px sans-serif";
        },
        set(value: string) {
          const match = /(\d+)px/.exec(value);
          (this as any)._fontSize = match ? parseInt(match[1], 10) : 12;
        },
      });
    } catch {
      /* rely on default behavior */
    }

    // Text drawing is not reliable on native — make all text calls no-ops.
    // Scene renderers (sceneRenderers.ts) use only shapes, so this is safe.
    (ctx as any).fillText = () => {};
    (ctx as any).strokeText = () => {};
    (ctx as any).measureText = () => ({ width: 0 });

    const canvas = {
      width: gl.drawingBufferWidth ?? 800,
      height: gl.drawingBufferHeight ?? 600,
      getContext: () => ctx as any,
    };

    // Normalise to a logical 800×600 space so the whole scene fits
    // inside the GLView, even on high‑DPI devices where the backing
    // buffer is much larger than the visible view.
    const LOGICAL_WIDTH = 800;
    const LOGICAL_HEIGHT = 600;
    const displayWidth = canvas.width || LOGICAL_WIDTH;
    const displayHeight = canvas.height || LOGICAL_HEIGHT;
    const scaleX = displayWidth / LOGICAL_WIDTH;
    const scaleY = displayHeight / LOGICAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY) || 1;

    // Apply this once; all engine coordinates are now in 800×600 space.
    ctx.save();
    ctx.scale(scale, scale);

    // Use scriptRef.current so we always get the latest script,
    // even if the prop changed between mount and GLView init.
    const engine = new AnimationEngine(
      ctx as any,
      LOGICAL_WIDTH,
      LOGICAL_HEIGHT,
      scriptRef.current,
      "",
      {
        // On native we must explicitly flush the 2D context and
        // end the GL frame so that drawings become visible.
        postFrame: () => {
          try {
            (ctx as any).flush?.();
          } catch {
            /* ignore flush errors */
          }
          try {
            gl.endFrameEXP?.();
          } catch {
            /* ignore GL frame errors */
          }
        },
      },
    );
    engineRef.current = engine;

    if (isPlaying) {
      engine.play();
    } else {
      engine.draw?.();
    }
  };

  // ─── Play / pause control
  useEffect(() => {
    if (!engineRef.current) return;
    if (isPlaying) {
      engineRef.current.play();
    } else {
      engineRef.current.pause();
    }
  }, [isPlaying]);

  // ─── FIX 2: When a NEW script arrives (cognitive state changed),
  // fully reset the engine so the student sees the new visual from the start.
  useEffect(() => {
    if (!script) return;
    scriptRef.current = script;

    if (engineRef.current) {
      // 1. Stop any in-flight animation frame loop
      engineRef.current.pause();

      // 2. Swap the script on the existing engine instance
      (engineRef.current as any).script = script;

      // 3. Reset playhead to zero
      (engineRef.current as any).currentTime = 0;
      (engineRef.current as any).reset?.();

      // 4. Resume if we were already playing
      if (isPlaying) {
        engineRef.current.play();
      } else {
        // Draw the first frame of the new script as a still
        engineRef.current.draw?.();
      }
    }
    // isPlaying intentionally excluded — handled by its own sibling effect above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  return (
    <View style={styles.container}>
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={handleContextCreate}
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
