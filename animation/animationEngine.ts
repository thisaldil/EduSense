import { detectDomain, renderUniversalScene, type ConceptDomain } from "./sceneRenderers";

export interface SceneActor {
  type: string;
  x?: number;
  y?: number;
  color?: string | null;
  size?: number;
  count?: number;
  animation?: string;
  angle?: number;
  length?: number;
  text?: string;
  fontSize?: number;
  timeline?: { at: number; action?: string; alpha?: number }[];
  [key: string]: any;
}

export interface Scene {
  id: string;
  startTime: number;
  duration: number;
  text: string;
  actors: SceneActor[];
  environment?: string;
  meta?: Record<string, any>;
}

export interface AnimationScript {
  title: string;
  duration: number;
  scenes: Scene[];
  concept?: string;
}

type Ctx = any;

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
  private postFrame?: () => void;
  private onSceneChange?: (idx: number, scene: Scene) => void;
  private onTimeUpdate?: (time: number) => void;
  private onComplete?: () => void;
  private lastSceneIndex = -1;

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
      postFrame?: () => void;
    },
  ) {
    this.ctx = ctx;
    this.W = W;
    this.H = H;
    this.script = script;
    this.concept = concept || script.concept || script.title || "";
    this.domain = detectDomain(this.concept, this.script.scenes);
    this.onSceneChange = callbacks?.onSceneChange;
    this.onTimeUpdate = callbacks?.onTimeUpdate;
    this.onComplete = callbacks?.onComplete;
    this.postFrame = callbacks?.postFrame;
  }

  setScript(script: AnimationScript, concept = "") {
    this.script = script;
    this.concept = concept || script.concept || script.title || "";
    this.domain = detectDomain(this.concept, this.script.scenes);
    this.currentTime = 0;
    this.lastSceneIndex = -1;
  }

  setSize(W: number, H: number) {
    if (!Number.isFinite(W) || !Number.isFinite(H) || W <= 0 || H <= 0) return;
    this.W = W;
    this.H = H;
    this.draw();
  }

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
    this.currentTime = Math.max(0, Math.min(ms, this.script.duration || 0));
    this.renderFrame(this.currentTime);
    this.onTimeUpdate?.(this.currentTime);
  }

  seekToScene(idx: number) {
    const s = this.script.scenes[idx];
    if (s) this.seek(s.startTime);
  }

  reset() {
    this.pause();
    this.currentTime = 0;
    this.concept = this.script.concept || this.script.title || this.concept;
    this.domain = detectDomain(this.concept, this.script.scenes);
    this.lastSceneIndex = -1;
    this.renderFrame(0);
  }

  dispose() {
    this.pause();
  }

  getCurrentTime() { return this.currentTime; }
  getDuration() { return this.script.duration; }
  getScenes() { return this.script.scenes; }
  getIsPlaying() { return this.isPlaying; }

  getCurrentSceneIndex() {
    const t = this.currentTime;
    for (let i = this.script.scenes.length - 1; i >= 0; i--) {
      if (t >= this.script.scenes[i].startTime) return i;
    }
    return 0;
  }

  private tick() {
    if (!this.isPlaying) return;
    this.rafId = requestAnimationFrame((ts: number) => {
      if (this.lastTS !== null) {
        this.currentTime = Math.min(this.currentTime + (ts - this.lastTS), this.script.duration || 0);
      }
      this.lastTS = ts;
      this.renderFrame(this.currentTime);
      this.onTimeUpdate?.(this.currentTime);
      if (this.currentTime >= (this.script.duration || 0)) {
        this.isPlaying = false;
        this.onComplete?.();
        return;
      }
      this.tick();
    });
  }

  renderFrame(timeMs: number) {
    const { ctx, W, H, script, domain } = this;
    const scenes = script.scenes || [];
    if (!scenes.length) {
      ctx.clearRect(0, 0, W, H);
      return;
    }

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
    if (sceneIndex !== this.lastSceneIndex) {
      this.lastSceneIndex = sceneIndex;
      this.onSceneChange?.(sceneIndex, currentScene);
    }
    ctx.clearRect(0, 0, W, H);
    renderUniversalScene(currentScene, domain, ctx, W, H, sceneElapsed);
    this.postFrame?.();
  }

  draw() {
    this.renderFrame(this.currentTime);
  }
}

export default AnimationEngine;
