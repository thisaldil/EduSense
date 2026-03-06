/**
 * animationEngine.ts  —  Actor-Driven Cartoon Edition
 *
 * WHAT CHANGED FROM THE PREVIOUS VERSION
 * ────────────────────────────────────────
 * OLD: Bridge checked SCENE_RENDERERS["scene_1"…"scene_10"] — hardcoded
 *      photosynthesis cartoon. Broke for any other science topic.
 *
 * NEW render pipeline (per frame):
 *   1. drawSceneContext(ctx, W, H, concept, elapsed)
 *        → draws the right background for the domain
 *          (biology = green meadow, physics = grid room,
 *           earth = soil layers, space = starfield, etc.)
 *   2. For each actor in currentScene.actors:
 *        ACTOR_RENDERERS[actor.type]?.(ctx, actor, elapsed, W, H)
 *        → draws the cartoon character for that actor type
 *          using the backend's x/y/size/color/angle/length data
 *
 * This means the engine is fully data-driven:
 *   - Backend controls WHAT to draw (type, position, colour, size)
 *   - Frontend controls HOW to draw it (cartoon style, timing, animation)
 *   - Works for any Grade 6 science topic without code changes
 *   - Adding new topic = add actor types on backend + renderer in actorRenderers.ts
 *
 * BACKWARDS COMPATIBILITY
 * ────────────────────────
 * SCENE_RENDERERS is still imported as an optional override.
 * If concept contains "photo/chloro" AND a matching scene id exists,
 * the old photosynthesis cartoon takes priority.  Otherwise the new
 * actor-driven path runs.
 *
 * EXPO-2D-CONTEXT SAFE — no banned APIs in this file.
 */

import {
  detectDomain,
  renderUniversalScene,
  type ConceptDomain,
} from "./sceneRenderers";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SceneActor {
  type: string;
  x: number;
  y: number;
  color?: string | null;
  size?: number;
  count?: number;
  animation?: string;
  angle?: number;
  length?: number;
  text?: string;
  fontSize?: number;
  timeline?: { at: number; action: string; alpha?: number }[];
  [key: string]: any;
}

export interface Scene {
  id: string;
  startTime: number;
  duration: number;
  text: string;
  actors: SceneActor[];
  environment?: string;
  meta?: {
    cognitiveState?: string;
    tier?: string;
    ctmlPrinciples?: string[];
    salienceLevel?: string;
  };
}

export interface AnimationScript {
  title: string;
  duration: number;
  scenes: Scene[];
  concept?: string;
}

type Ctx = any;

// ─── AnimationEngine ──────────────────────────────────────────────────────────
export class AnimationEngine {
  private ctx: Ctx;
  private W: number;
  private H: number;
  private script: AnimationScript;
  private concept: string;
  private domain: ConceptDomain;
  private currentTime = 0;
  private isPlaying = false;
  private lastTS: number | null = null;
  private rafId: any = null;

  private onSceneChange?: (idx: number, scene: Scene) => void;
  private onTimeUpdate?: (time: number) => void;
  private onComplete?: () => void;

  constructor(
    ctx: Ctx,
    W: number,
    H: number,
    script: AnimationScript,
    concept = "",
    callbacks?: {
      onSceneChange?: (idx: number, scene: Scene) => void;
      onTimeUpdate?: (time: number) => void;
      onComplete?: () => void;
    },
  ) {
    this.ctx = ctx;
    this.W = W;
    this.H = H;
    this.script = script;
    this.concept = concept || script.concept || script.title || "";
    this.domain = detectDomain(this.concept, this.script.scenes);
    if (callbacks) {
      this.onSceneChange = callbacks.onSceneChange;
      this.onTimeUpdate = callbacks.onTimeUpdate;
      this.onComplete = callbacks.onComplete;
    }
  }

  // ── Playback ──────────────────────────────────────────────────────────────
  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastTS = null;
    this.tick();
  }

  pause() {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  seek(ms: number) {
    this.currentTime = Math.max(0, Math.min(ms, this.script.duration));
    this.renderFrame(this.currentTime);
    this.onTimeUpdate?.(this.currentTime);
  }

  seekToScene(idx: number) {
    const s = this.script.scenes[idx];
    if (s) this.seek(s.startTime);
  }

  reset() {
    // When the script has been hot-swapped (e.g. Photosynthesis → Water Cycle),
    // make sure we also re‑derive concept + domain so backgrounds/anchors update.
    this.concept = this.script.concept || this.script.title || this.concept;
    this.domain = detectDomain(this.concept, this.script.scenes);

    this.pause();
    this.currentTime = 0;
    this.renderFrame(0);
  }
  dispose() {
    this.pause();
  }

  getCurrentTime() {
    return this.currentTime;
  }
  getDuration() {
    return this.script.duration;
  }
  getScenes() {
    return this.script.scenes;
  }
  getIsPlaying() {
    return this.isPlaying;
  }
  getCurrentSceneIndex() {
    const t = this.currentTime;
    for (let i = this.script.scenes.length - 1; i >= 0; i--) {
      if (t >= this.script.scenes[i].startTime) return i;
    }
    return 0;
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  private tick() {
    if (!this.isPlaying) return;
    this.rafId = requestAnimationFrame((ts: number) => {
      if (this.lastTS !== null) {
        this.currentTime = Math.min(
          this.currentTime + (ts - this.lastTS),
          this.script.duration,
        );
      }
      this.lastTS = ts;
      this.renderFrame(this.currentTime);
      this.onTimeUpdate?.(this.currentTime);
      if (this.currentTime >= this.script.duration) {
        this.isPlaying = false;
        this.onComplete?.();
        return;
      }
      this.tick();
    });
  }

  // ── Core render ───────────────────────────────────────────────────────────
  renderFrame(timeMs: number) {
    const { ctx, W, H, script, domain } = this;
    const scenes = script.scenes;

    // Find current scene
    let currentScene: Scene = scenes[0];
    let sceneIndex = 0;
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (timeMs >= scenes[i].startTime) {
        currentScene = scenes[i];
        sceneIndex = i;
        break;
      }
    }

    const sceneElapsed = Math.max(0, timeMs - currentScene.startTime);
    this.onSceneChange?.(sceneIndex, currentScene);

    ctx.clearRect(0, 0, W, H);

    // Single universal renderer for all concepts/domains.
    renderUniversalScene(currentScene, domain, ctx, W, H, sceneElapsed);
  }

  // Convenience: render current frame without advancing time (used on web)
  draw() {
    this.renderFrame(this.currentTime);
  }
}

function _pulseCenter(ctx: Ctx, W: number, H: number, e: number) {
  ctx.save();
  ctx.globalAlpha = 0.07 + Math.sin(e * 0.004) * 0.04;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default AnimationEngine;
