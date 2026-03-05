/**
 * adaptiveAnimationEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight engine wrapper that consumes the backend
 * /api/animation/neuro-adaptive JSON and drives the light-themed
 * scene renderers in `sceneRenderers.ts`.
 *
 * This is optional and can live alongside the existing generic
 * `AnimationEngine`. It is tuned for Member 2 research demos where the
 * backend sends fixed scene IDs (scene_1 ... scene_8) and explicit
 * startTime / duration per scene.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { renderAdaptiveScene, type Ctx2D } from "./sceneRenderers";

// Mirror of the backend script shape we care about for playback.
export interface BackendScene {
  id: string;
  startTime: number;
  duration: number;
  text?: string;
  meta?: {
    cognitiveState?: string;
    tier?: string;
    ctmlPrinciples?: string[];
    salienceLevel?: string;
    [key: string]: unknown;
  };
}

export interface BackendScript {
  title?: string;
  duration: number;
  scenes: BackendScene[];
}

// Minimal interface matching the current Member 2 response in services/api.ts
export interface BackendResponse {
  script: BackendScript;
  source?: string;
  cognitive_state?: string;
  tier?: string;
  student_id?: string;
  lesson_id?: string | null;
  session_id?: string | null;
}

// Canvas interface compatible with expo-2d-context wrapper in AnimationCanvasNative.
interface CanvasLike {
  width: number;
  height: number;
  getContext: (type: "2d") => Ctx2D;
}

export class AdaptiveAnimationEngine {
  private canvas: CanvasLike;
  private ctx: Ctx2D;
  private script: BackendScript;
  private rafId: number | null = null;
  private _isPlaying = false;
  private _pausedAt: number | null = null;
  private _elapsed = 0;

  constructor(canvas: CanvasLike, response: BackendResponse) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.script = response.script;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  /** Current elapsed time in ms since start of script. */
  get elapsed() {
    return this._elapsed;
  }

  /** Render a single frame at the given elapsed time (ms). */
  draw(elapsed: number = 0) {
    this._elapsed = Math.max(0, Math.min(elapsed, this.script.duration));

    renderAdaptiveScene(
      this.ctx,
      this.canvas.width,
      this.canvas.height,
      this.script,
      this._elapsed,
    );

    // expo-gl flush
    (this.ctx as any).endFrameEXP?.();
  }

  /** Start or resume playback from current position. */
  play() {
    if (this._isPlaying) return;
    this._isPlaying = true;

    const offset = this._pausedAt ?? 0;
    const startWall = performance.now() - offset;

    const tick = () => {
      if (!this._isPlaying) return;

      const now = performance.now();
      const elapsed = now - startWall;
      this._elapsed = Math.max(0, Math.min(elapsed, this.script.duration));

      this.draw(this._elapsed);

      if (this._elapsed < this.script.duration) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        // Hold last frame
        this._isPlaying = false;
        this._pausedAt = null;
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  /** Pause playback without resetting position. */
  pause() {
    if (!this._isPlaying) return;
    this._isPlaying = false;
    this._pausedAt = this._elapsed;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Seek to an absolute time in ms and render a still frame. */
  seek(ms: number) {
    const clamped = Math.max(0, Math.min(ms, this.script.duration));
    this._elapsed = clamped;
    this._pausedAt = clamped;
    this.draw(clamped);
  }

  /** Full reset back to t = 0 with a still frame. */
  reset() {
    this.pause();
    this._elapsed = 0;
    this._pausedAt = null;
    this.draw(0);
  }

  /** Stop all animation and release resources. */
  destroy() {
    this.pause();
  }
}

