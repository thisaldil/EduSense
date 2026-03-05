/**
 * Animation Engine - Neuro-Adaptive Edition
 *
 * Key change from previous version:
 *   When a scene has a matching entry in SCENE_RENDERERS (scene_1…scene_8),
 *   the engine delegates rendering to the concept-specific renderer instead of
 *   the generic actor system.  This is the bridge that makes sceneRenderers.ts
 *   actually run on device.
 *
 *   Legacy actor-based scenes still work unchanged (backward compatible).
 */

import { actorRegistry } from "./actors/index";
import { SCENE_RENDERERS } from "./sceneRenderers";

// ─── Easing / Interpolation helpers ──────────────────────────────────────────

const applyEasing = (t: number, type: string = "linear"): number => {
  if (type === "easeInOut") return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  if (type === "easeOut") return t * (2 - t);
  return t;
};

const interpolate = (
  from: number,
  to: number,
  t: number,
  easing: string = "linear",
): number => from + (to - from) * applyEasing(t, easing);

// ─────────────────────────────────────────────────────────────────────────────

export class AnimationEngine {
  canvas: any;
  ctx: any;
  script: any;
  currentTime: number;
  isPlaying: boolean;
  animationId: number | null;
  speed: number;
  lastFrameTime: number | null;
  actorRegistry: Record<string, any>;

  constructor(canvas: any, script: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.script = script;
    this.currentTime = 0;
    this.isPlaying = false;
    this.animationId = null;
    this.speed = 1.0;
    this.lastFrameTime = null;

    this.canvas.width = canvas.width ?? 800;
    this.canvas.height = canvas.height ?? 600;

    this.ctx.imageSmoothingEnabled = true;

    // Legacy, engine-local actors (kept separate to avoid duplicate key
    // warnings when merging with the central actorRegistry).
    const legacyActors: Record<string, any> = {
      plant: { draw: this.drawPlant.bind(this) },
      sun: { draw: this.drawSun.bind(this) },
      water: { draw: this.drawWater.bind(this) },
      co2: { draw: this.drawCO2.bind(this) },
      glucose: { draw: this.drawGlucose.bind(this) },
      oxygen: { draw: this.drawOxygen.bind(this) },
    };

    // Central registry wins by default; legacy implementations override only
    // where a key is not defined in actorRegistry.
    this.actorRegistry = {
      ...actorRegistry,
      ...legacyActors,
    };
  }

  // ── Playback controls ─────────────────────────────────────────────────────

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.animate();
  }

  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset() {
    this.pause();
    this.currentTime = 0;
    this.lastFrameTime = null;
    this.draw();
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  animate() {
    if (!this.isPlaying) return;

    const now = performance.now();
    if (!this.lastFrameTime) this.lastFrameTime = now;

    const deltaTime = Math.min((now - this.lastFrameTime) * this.speed, 50);
    this.lastFrameTime = now;
    this.currentTime += deltaTime;

    this.draw();

    if (this.currentTime < this.script.duration) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isPlaying = false;
      this.lastFrameTime = null;
    }
  }

  // ─── Main draw ────────────────────────────────────────────────────────────

  draw() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    this.ctx.clearRect(0, 0, W, H);

    const currentScene = this.getCurrentScene();
    if (!currentScene) {
      this.drawBackground();
      return;
    }

    // ── KEY BRIDGE ──────────────────────────────────────────────────────────
    // If a concept-specific renderer exists for this scene ID,
    // use it and skip the generic actor pipeline entirely.
    const conceptRenderer = SCENE_RENDERERS[currentScene.id];
    if (conceptRenderer) {
      const sceneElapsed = this.currentTime - currentScene.startTime;
      conceptRenderer(this.ctx, W, H, Math.max(0, sceneElapsed));

      // expo-gl flush (no-op on web/HTML canvas)
      (this.ctx as any).endFrameEXP?.();
      return;
    }

    // ── Fallback: generic actor system (legacy scenes) ───────────────────────
    this.drawBackground();

    const nextScene = this.getNextScene();

    let transitionProgress = 0;
    if (nextScene && this.currentTime >= nextScene.startTime - 500) {
      const t = (this.currentTime - (nextScene.startTime - 500)) / 500;
      transitionProgress = applyEasing(
        Math.max(0, Math.min(1, t)),
        "easeInOut",
      );
    }

    currentScene.actors.forEach((actor: any) => {
      this.ctx.save();
      this.ctx.globalAlpha = 1 - transitionProgress;
      this.drawActor(actor, currentScene);
      this.ctx.restore();
    });

    if (nextScene && transitionProgress > 0) {
      nextScene.actors.forEach((actor: any) => {
        this.ctx.save();
        this.ctx.globalAlpha = transitionProgress;
        this.drawActor(actor, nextScene, transitionProgress);
        this.ctx.restore();
      });
    }

    this.drawText(
      currentScene.text,
      currentScene,
      transitionProgress,
      nextScene,
    );
  }

  // ── Scene lookup ──────────────────────────────────────────────────────────

  getCurrentScene() {
    return (
      this.script.scenes.find(
        (s: any) =>
          this.currentTime >= s.startTime &&
          this.currentTime < s.startTime + s.duration,
      ) ?? null
    );
  }

  getNextScene() {
    const current = this.getCurrentScene();
    if (!current) return null;
    const idx = this.script.scenes.findIndex((s: any) => s.id === current.id);
    if (idx === -1 || idx >= this.script.scenes.length - 1) return null;
    return this.script.scenes[idx + 1];
  }

  // ── Generic actor renderer (legacy / non-photosynthesis scenes) ───────────

  drawActor(actor: any, scene: any, transitionProgress = 0) {
    const sceneTime = this.currentTime - scene.startTime;

    if (Array.isArray(actor.timeline) && actor.timeline.length > 0) {
      this.drawActorWithTimeline(actor, scene, sceneTime);
      return;
    }

    const rawProgress = Math.max(0, Math.min(1, sceneTime / scene.duration));
    const progress = applyEasing(rawProgress, "easeInOut");
    if (!isFinite(progress)) return;

    const ActorClass = this.actorRegistry[actor.type];
    if (!ActorClass) {
      console.warn(`Unknown actor type: ${actor.type}`);
      return;
    }
    if (ActorClass.draw) {
      ActorClass.draw(this.ctx, actor, progress, actor.animation);
    }
  }

  drawActorWithTimeline(actor: any, scene: any, sceneTime: number) {
    const timeline = actor.timeline;
    let currentStep: any = null;
    let nextStep: any = null;

    for (let i = 0; i < timeline.length; i++) {
      if (sceneTime >= timeline[i].at) {
        currentStep = timeline[i];
      } else {
        nextStep = timeline[i];
        break;
      }
    }

    if (!currentStep) return;

    let progress = 0;
    if (nextStep) {
      const stepDuration = nextStep.at - currentStep.at;
      const elapsed = sceneTime - currentStep.at;
      progress = applyEasing(
        Math.max(0, Math.min(1, elapsed / stepDuration)),
        "easeInOut",
      );
    } else {
      progress = 1.0;
    }

    this.ctx.save();

    let activeAlpha = 1.0;
    let activeScale = 1.0;
    let activeX = actor.x || 400;
    let activeY = actor.y || 300;

    if (currentStep.alpha !== undefined) {
      activeAlpha =
        nextStep?.alpha !== undefined
          ? interpolate(currentStep.alpha, nextStep.alpha, progress, "linear")
          : currentStep.alpha;
    }
    this.ctx.globalAlpha = activeAlpha;

    if (currentStep.scale !== undefined) {
      activeScale =
        nextStep?.scale !== undefined
          ? interpolate(currentStep.scale, nextStep.scale, progress, "easeOut")
          : currentStep.scale;
    }

    const handleMove = (
      fromKey: "fromY" | "fromX",
      toKey: "toY" | "toX",
      axis: "Y" | "X",
    ) => {
      if (
        currentStep[fromKey] !== undefined &&
        currentStep[toKey] !== undefined
      ) {
        const dur =
          currentStep.duration ||
          (nextStep ? nextStep.at - currentStep.at : 1000);
        const p = applyEasing(
          Math.min(1, (sceneTime - currentStep.at) / dur),
          "easeOut",
        );
        if (axis === "Y")
          activeY = interpolate(
            currentStep[fromKey],
            currentStep[toKey],
            p,
            "easeOut",
          );
        else
          activeX = interpolate(
            currentStep[fromKey],
            currentStep[toKey],
            p,
            "easeOut",
          );
      }
    };

    if (currentStep.action === "moveDown" || currentStep.action === "moveUp")
      handleMove("fromY", "toY", "Y");
    if (currentStep.action === "moveLeft") handleMove("fromX", "toX", "X");
    if (currentStep.action === "moveRight") handleMove("fromX", "toX", "X");

    if (activeScale !== 1.0) {
      this.ctx.translate(activeX, activeY);
      this.ctx.scale(activeScale, activeScale);
      this.ctx.translate(-activeX, -activeY);
    }

    const timelineActor = { ...actor, x: activeX, y: activeY };
    const ActorClass = this.actorRegistry[actor.type];
    if (ActorClass?.draw) {
      ActorClass.draw(
        this.ctx,
        timelineActor,
        progress,
        timelineActor.animation,
      );
    }

    this.ctx.restore();
  }

  // ── Background (light theme — matches AnimationEngine original) ───────────

  drawBackground() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#F8F9FA");
    grad.addColorStop(0.5, "#FFFFFF");
    grad.addColorStop(1, "#F5F7FA");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(0,0,0,0.02)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  // ── Text HUD (no-op on native since fillText is patched out) ─────────────

  drawText(
    text: string,
    scene: any,
    transitionProgress = 0,
    nextScene: any = null,
  ) {
    // fillText is a no-op on expo-2d-context native.
    // sceneRenderers.ts handles all visual communication via shapes.
    // This method is retained for web/fallback environments only.
    const ctx = this.ctx;
    try {
      if (transitionProgress > 0) ctx.globalAlpha = 1 - transitionProgress;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(20, 20, this.canvas.width - 40, 50);
      ctx.fillStyle = "white";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "left";
      ctx.fillText(text, 30, 50);
      ctx.globalAlpha = 1;

      if (transitionProgress > 0 && nextScene?.text) {
        ctx.globalAlpha = transitionProgress;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(20, 20, this.canvas.width - 40, 50);
        ctx.fillStyle = "white";
        ctx.fillText(nextScene.text, 30, 50);
        ctx.globalAlpha = 1;
      }
    } catch {
      /* safe no-op */
    }
  }

  // ── Legacy actor draw methods (backward compatibility) ────────────────────

  lightenColor(color: string, percent: number) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + percent);
    const b = Math.min(255, (num & 0xff) + percent);
    return `rgb(${r},${g},${b})`;
  }

  darkenColor(color: string, percent: number) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0xff) - percent);
    const b = Math.max(0, (num & 0xff) - percent);
    return `rgb(${r},${g},${b})`;
  }

  drawPlant(actor: any, progress: number, animation: string) {
    const ctx = this.ctx;
    const x = actor.x || 400;
    const y = actor.y || 300;
    const color = actor.color || "#4CAF50";
    if (!isFinite(x) || !isFinite(y)) return;

    ctx.save();
    if (animation === "appear") {
      const scale = applyEasing(progress, "easeOut");
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }
    ctx.fillStyle = color;
    ctx.fillRect(x - 10, y, 20, 100);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x - 30, y - 20, 40, 20, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 30, y - 20, 40, 20, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSun(actor: any, progress: number, animation: string) {
    const ctx = this.ctx;
    const x = actor.x || 400;
    const y = actor.y || 300;
    const radius = 40;
    if (!isFinite(x) || !isFinite(y)) return;

    ctx.save();
    if (animation === "appear") {
      const scale = applyEasing(progress, "easeOut");
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (isFinite(progress)) {
      const rayLength =
        20 + Math.sin(applyEasing(progress, "easeInOut") * Math.PI * 2) * 5;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const sx = x + Math.cos(angle) * radius;
        const sy = y + Math.sin(angle) * radius;
        const ex = x + Math.cos(angle) * (radius + rayLength);
        const ey = y + Math.sin(angle) * (radius + rayLength);
        if (isFinite(sx) && isFinite(sy) && isFinite(ex) && isFinite(ey)) {
          ctx.strokeStyle = "#FFD700";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  drawWater(actor: any, progress: number, animation: string) {
    const ctx = this.ctx;
    const count = actor.count || 1;
    const startY = actor.y || 300;
    const endY = startY - 200;
    const baseX = actor.x || 400;
    if (!isFinite(baseX) || !isFinite(startY)) return;

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * 0.5;
      const p = applyEasing(
        Math.max(0, Math.min(1, (progress - offset) * 2)),
        "easeOut",
      );
      const y = interpolate(startY, endY, p, "easeOut");
      const x = baseX + (i - count / 2) * 20;
      if (!isFinite(x) || !isFinite(y)) continue;
      ctx.fillStyle = "#2196F3";
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawCO2(actor: any, progress: number, animation: string) {
    const ctx = this.ctx;
    const count = actor.count || 1;
    const startX = actor.x || 400;
    const endX = startX + 200;
    const baseY = actor.y || 300;
    if (!isFinite(startX) || !isFinite(baseY)) return;

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * 0.3;
      const p = applyEasing(
        Math.max(0, Math.min(1, (progress - offset) * 1.5)),
        "easeInOut",
      );
      const x = interpolate(startX, endX, p, "easeInOut");
      const y = baseY + Math.sin(p * Math.PI) * 50;
      ctx.strokeStyle = "#9E9E9E";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawGlucose(actor: any, progress: number, animation: string) {
    const ctx = this.ctx;
    const x = actor.x || 400;
    const y = actor.y || 300;
    if (!isFinite(x) || !isFinite(y)) return;
    const scale = animation === "appear" ? applyEasing(progress, "easeOut") : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#FF9800";
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawOxygen(actor: any, progress: number, animation: string) {
    const ctx = this.ctx;
    const count = actor.count || 1;
    const startY = actor.y || 300;
    const endY = startY - 150;
    const baseX = actor.x || 400;
    if (!isFinite(baseX) || !isFinite(startY)) return;

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * 0.2;
      const p = applyEasing(
        Math.max(0, Math.min(1, (progress - offset) * 1.2)),
        "easeOut",
      );
      const y = interpolate(startY, endY, p, "easeOut");
      const x = baseX + (i - count / 2) * 15;
      ctx.strokeStyle = "#4CAF50";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
