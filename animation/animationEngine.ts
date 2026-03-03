/**
 * Animation Engine - Enhanced Version
 * Renders JSON animation scripts to HTML5 Canvas with expanded actor library
 */

// Import all actors from central registry
import { actorRegistry } from "./actors/index";

// Lightweight easing + interpolation helpers (local, no extra module)
const applyEasing = (t: number, type: string = "linear"): number => {
  if (type === "easeInOut") {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  if (type === "easeOut") {
    return t * (2 - t);
  }
  return t;
};

const interpolate = (
  from: number,
  to: number,
  t: number,
  easing: string = "linear",
): number => {
  const eased = applyEasing(t, easing);
  return from + (to - from) * eased;
};

export class AnimationEngine {
  constructor(canvas, script) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.script = script;
    this.currentTime = 0;
    this.isPlaying = false;
    this.animationId = null;
    this.speed = 1.0;
    this.lastFrameTime = null;

    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 600;

    // Enable smooth rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";

    // Actor registry - combine central registry with legacy actors
    this.actorRegistry = {
      // Legacy actors (backward compatibility)
      plant: { draw: this.drawPlant.bind(this) },
      sun: { draw: this.drawSun.bind(this) },
      water: { draw: this.drawWater.bind(this) },
      co2: { draw: this.drawCO2.bind(this) },
      glucose: { draw: this.drawGlucose.bind(this) },
      oxygen: { draw: this.drawOxygen.bind(this) },

      // All new actors from central registry
      ...actorRegistry,
    };
  }

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

  setSpeed(speed) {
    this.speed = speed;
  }

  animate() {
    if (!this.isPlaying) return;

    // Use actual frame time for smoother animation
    const now = performance.now();
    if (!this.lastFrameTime) {
      this.lastFrameTime = now;
    }
    const deltaTime = Math.min((now - this.lastFrameTime) * this.speed, 50); // Cap at 50ms to prevent jumps
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

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();

    // Get current and next scenes for smooth transitions
    const currentScene = this.getCurrentScene();
    const nextScene = this.getNextScene();

    if (!currentScene) return;

    // Calculate transition progress (0 to 1) for smooth cross-fade
    let transitionProgress = 0;
    if (nextScene && this.currentTime >= nextScene.startTime - 500) {
      // Start transitioning 500ms before next scene
      const transitionStart = nextScene.startTime - 500;
      const transitionDuration = 500;
      transitionProgress = Math.max(
        0,
        Math.min(1, (this.currentTime - transitionStart) / transitionDuration),
      );
      transitionProgress = applyEasing(transitionProgress, "easeInOut");
    }

    // Draw current scene actors
    currentScene.actors.forEach((actor) => {
      const alpha = 1 - transitionProgress;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.drawActor(actor, currentScene);
      this.ctx.restore();
    });

    // Draw next scene actors (fading in)
    if (nextScene && transitionProgress > 0) {
      nextScene.actors.forEach((actor) => {
        this.ctx.save();
        this.ctx.globalAlpha = transitionProgress;
        this.drawActor(actor, nextScene, transitionProgress);
        this.ctx.restore();
      });
    }

    // Draw text with smooth transition
    this.drawText(
      currentScene.text,
      currentScene,
      transitionProgress,
      nextScene,
    );
  }

  getNextScene() {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return null;

    const currentIndex = this.script.scenes.findIndex(
      (s) => s.id === currentScene.id,
    );
    if (currentIndex === -1 || currentIndex >= this.script.scenes.length - 1) {
      return null;
    }

    return this.script.scenes[currentIndex + 1];
  }

  getCurrentScene() {
    return this.script.scenes.find((scene) => {
      return (
        this.currentTime >= scene.startTime &&
        this.currentTime < scene.startTime + scene.duration
      );
    });
  }

  drawActor(actor, scene, transitionProgress = 0) {
    const sceneTime = this.currentTime - scene.startTime;

    // NEW: Timeline-based cartoon choreography (backward compatible)
    if (
      actor.timeline &&
      Array.isArray(actor.timeline) &&
      actor.timeline.length > 0
    ) {
      this.drawActorWithTimeline(actor, scene, sceneTime);
      return;
    }

    // LEGACY: Original animation system (backward compatible)
    const rawProgress = Math.max(0, Math.min(1, sceneTime / scene.duration));
    const progress = applyEasing(rawProgress, "easeInOut");

    // Validate progress is a finite number
    if (!isFinite(progress) || progress < 0 || progress > 1) {
      console.warn(
        "Invalid progress value:",
        progress,
        "for actor:",
        actor.type,
      );
      return;
    }

    const ActorClass = this.actorRegistry[actor.type];
    if (ActorClass) {
      if (ActorClass.draw) {
        // New actor classes with static draw method
        ActorClass.draw(this.ctx, actor, progress, actor.animation);
      } else if (typeof ActorClass === "object" && ActorClass.draw) {
        // Old-style actors with bound draw method
        ActorClass.draw(actor, progress, actor.animation);
      }
    } else {
      console.warn(`Unknown actor type: ${actor.type}`);
    }
  }

  drawActorWithTimeline(actor, scene, sceneTime) {
    /**
     * Timeline-based cartoon choreography renderer.
     *
     * Interprets actor.timeline array:
     * [
     *   { "at": 0, "action": "appear", "alpha": 0.0 },
     *   { "at": 500, "action": "moveDown", "fromY": 300, "toY": 450 },
     *   { "at": 2000, "action": "fadeOut", "alpha": 0.0 }
     * ]
     *
     * Calculates current state based on sceneTime and applies transformations.
     */
    const timeline = actor.timeline;

    // Find the current and next timeline steps
    let currentStep = null;
    let nextStep = null;
    let stepIndex = -1;

    for (let i = 0; i < timeline.length; i++) {
      if (sceneTime >= timeline[i].at) {
        currentStep = timeline[i];
        stepIndex = i;
      } else {
        nextStep = timeline[i];
        break;
      }
    }

    // If no step found, actor hasn't appeared yet
    if (!currentStep) {
      return;
    }

    // Calculate interpolation between current and next step
    let progress = 0;
    let activeAction = currentStep.action;
    let activeAlpha = 1.0;
    let activeScale = 1.0;
    let activeX = actor.x || 400;
    let activeY = actor.y || 300;

    if (nextStep) {
      const stepDuration = nextStep.at - currentStep.at;
      const elapsed = sceneTime - currentStep.at;
      progress = Math.max(0, Math.min(1, elapsed / stepDuration));
      progress = applyEasing(progress, "easeInOut");
    } else {
      // Last step - hold the final state
      progress = 1.0;
    }

    // Apply transformations from timeline steps
    this.ctx.save();

    // Handle alpha (fade in/out)
    if (currentStep.alpha !== undefined) {
      if (nextStep && nextStep.alpha !== undefined) {
        activeAlpha = interpolate(
          currentStep.alpha,
          nextStep.alpha,
          progress,
          "linear",
        );
      } else {
        activeAlpha = currentStep.alpha;
      }
    }
    this.ctx.globalAlpha = activeAlpha;

    // Handle scale (grow/shrink)
    if (currentStep.scale !== undefined) {
      if (nextStep && nextStep.scale !== undefined) {
        activeScale = interpolate(
          currentStep.scale,
          nextStep.scale,
          progress,
          "easeOut",
        );
      } else {
        activeScale = currentStep.scale;
      }
    }

    // Handle position changes (moveDown, moveUp, etc.)
    // Support duration field for smoother, longer movements
    if (
      currentStep.action === "moveDown" &&
      currentStep.fromY !== undefined &&
      currentStep.toY !== undefined
    ) {
      const moveDuration =
        currentStep.duration ||
        (nextStep ? nextStep.at - currentStep.at : 1000);
      const moveProgress = Math.min(
        1,
        (sceneTime - currentStep.at) / moveDuration,
      );
      activeY = interpolate(
        currentStep.fromY,
        currentStep.toY,
        applyEasing(moveProgress, "easeOut"),
        "easeOut",
      );
    } else if (
      currentStep.action === "moveUp" &&
      currentStep.fromY !== undefined &&
      currentStep.toY !== undefined
    ) {
      const moveDuration =
        currentStep.duration ||
        (nextStep ? nextStep.at - currentStep.at : 1000);
      const moveProgress = Math.min(
        1,
        (sceneTime - currentStep.at) / moveDuration,
      );
      activeY = interpolate(
        currentStep.fromY,
        currentStep.toY,
        applyEasing(moveProgress, "easeOut"),
        "easeOut",
      );
    } else if (
      currentStep.action === "moveLeft" &&
      currentStep.fromX !== undefined &&
      currentStep.toX !== undefined
    ) {
      const moveDuration =
        currentStep.duration ||
        (nextStep ? nextStep.at - currentStep.at : 1000);
      const moveProgress = Math.min(
        1,
        (sceneTime - currentStep.at) / moveDuration,
      );
      activeX = interpolate(
        currentStep.fromX,
        currentStep.toX,
        applyEasing(moveProgress, "easeOut"),
        "easeOut",
      );
    } else if (
      currentStep.action === "moveRight" &&
      currentStep.fromX !== undefined &&
      currentStep.toX !== undefined
    ) {
      const moveDuration =
        currentStep.duration ||
        (nextStep ? nextStep.at - currentStep.at : 1000);
      const moveProgress = Math.min(
        1,
        (sceneTime - currentStep.at) / moveDuration,
      );
      activeX = interpolate(
        currentStep.fromX,
        currentStep.toX,
        applyEasing(moveProgress, "easeOut"),
        "easeOut",
      );
    }

    // Apply scale transformation
    if (activeScale !== 1.0) {
      this.ctx.translate(activeX, activeY);
      this.ctx.scale(activeScale, activeScale);
      this.ctx.translate(-activeX, -activeY);
    }

    // Create a modified actor object with current position and animation
    const timelineActor = {
      ...actor,
      x: activeX,
      y: activeY,
      animation:
        activeAction === "idle" ? actor.animation || "idle" : activeAction,
    };

    // Handle line actors - connect from current position to target
    if (
      actor.type === "line" &&
      actor.toX !== undefined &&
      actor.toY !== undefined
    ) {
      timelineActor.x1 = activeX;
      timelineActor.y1 = activeY;
      timelineActor.x2 = actor.toX;
      timelineActor.y2 = actor.toY;
    }

    // Handle label actors - preserve text property
    if (actor.type === "label" && actor.text) {
      timelineActor.text = actor.text;
    }

    // Calculate animation progress for continuous actions (rotate, pulse, etc.)
    let animationProgress = 0;
    if (currentStep.continuous) {
      // For continuous actions, calculate progress based on time since step started
      const continuousTime = sceneTime - currentStep.at;
      animationProgress = (continuousTime % 2000) / 2000; // 2 second cycle
    } else {
      animationProgress = progress;
    }

    // Draw the actor using the registry
    const ActorClass = this.actorRegistry[actor.type];
    if (ActorClass) {
      if (ActorClass.draw) {
        ActorClass.draw(
          this.ctx,
          timelineActor,
          animationProgress,
          timelineActor.animation,
        );
      } else if (typeof ActorClass === "object" && ActorClass.draw) {
        ActorClass.draw(
          timelineActor,
          animationProgress,
          timelineActor.animation,
        );
      }
    } else {
      console.warn(`Unknown actor type: ${actor.type}`);
    }

    this.ctx.restore();
  }

  // ========== Original Drawing Functions (for backward compatibility) ==========

  drawPlant(actor, progress, animation) {
    const ctx = this.ctx;
    const x = actor.x || 400;
    const y = actor.y || 300;
    const color = actor.color || "#4CAF50";

    // Validate values are finite numbers
    if (!isFinite(x) || !isFinite(y)) {
      console.warn("Invalid plant position:", { x, y });
      return;
    }

    ctx.save();

    // Smooth appear animation with easing
    if (animation === "appear") {
      const scale = applyEasing(progress, "easeOut");
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }

    // Smooth glow animation
    if (animation === "glow") {
      const glowIntensity = 0.5 + Math.sin(progress * Math.PI * 4) * 0.5;
      ctx.shadowBlur = 15 + glowIntensity * 15;
      ctx.shadowColor = "#FFD700";
    }

    // Smooth idle animation (gentle sway)
    if (animation === "idle") {
      const sway = Math.sin(progress * Math.PI * 2) * 3;
      ctx.translate(sway, 0);
    }

    // Enhanced Stem with shadow and gradient
    const stemGradient = ctx.createLinearGradient(x - 10, y, x + 10, y + 100);
    stemGradient.addColorStop(0, "#A0522D");
    stemGradient.addColorStop(0.5, "#8B4513");
    stemGradient.addColorStop(1, "#654321");

    // Stem shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(x - 9, y + 2, 20, 100);

    // Stem
    ctx.fillStyle = stemGradient;
    ctx.fillRect(x - 10, y, 20, 100);

    // Stem highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(x - 8, y, 4, 100);

    // Enhanced Leaves with gradients and shadows
    const drawLeaf = (leafX, leafY, width, height, rotation) => {
      // Leaf shadow
      ctx.save();
      ctx.translate(leafX + 2, leafY + 2);
      ctx.rotate(rotation);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Leaf with gradient
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(rotation);
      const leafGradient = ctx.createLinearGradient(
        -width,
        -height,
        width,
        height,
      );
      leafGradient.addColorStop(0, this.lightenColor(color, 30));
      leafGradient.addColorStop(0.5, color);
      leafGradient.addColorStop(1, this.darkenColor(color, 20));
      ctx.fillStyle = leafGradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
      ctx.fill();

      // Leaf highlight
      const highlightGradient = ctx.createRadialGradient(
        -width * 0.3,
        -height * 0.3,
        0,
        0,
        0,
        width * 0.8,
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // Leaf vein
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -height);
      ctx.lineTo(0, height);
      ctx.stroke();
      ctx.restore();
    };

    drawLeaf(x - 30, y - 20, 40, 20, -0.5);
    drawLeaf(x + 30, y - 20, 40, 20, 0.5);
    drawLeaf(x, y - 50, 30, 25, 0);

    ctx.restore();
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
    const b = Math.min(255, (num & 0x0000ff) + percent);
    return `rgb(${r}, ${g}, ${b})`;
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
    const b = Math.max(0, (num & 0x0000ff) - percent);
    return `rgb(${r}, ${g}, ${b})`;
  }

  drawSun(actor, progress, animation) {
    const ctx = this.ctx;
    const x = actor.x || 400;
    const y = actor.y || 300;
    const radius = 40;

    // Validate values are finite numbers
    if (!isFinite(x) || !isFinite(y) || !isFinite(radius)) {
      console.warn("Invalid sun position or radius:", { x, y, radius });
      return;
    }

    ctx.save();

    // Smooth appear animation
    if (animation === "appear") {
      const scale = applyEasing(progress, "easeOut");
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }

    // Outer glow effect
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.8);
    glowGradient.addColorStop(0, "rgba(255, 215, 0, 0.6)");
    glowGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.3)");
    glowGradient.addColorStop(1, "rgba(255, 215, 0, 0)");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Calculate gradient center positions
    const gradientCenterX = x - radius * 0.3;
    const gradientCenterY = y - radius * 0.3;

    // Validate all gradient values
    if (
      !isFinite(gradientCenterX) ||
      !isFinite(gradientCenterY) ||
      !isFinite(radius)
    ) {
      console.warn("Invalid sun gradient values:", {
        gradientCenterX,
        gradientCenterY,
        radius,
      });
      ctx.restore();
      return;
    }

    // Main sun body with radial gradient
    const sunGradient = ctx.createRadialGradient(
      gradientCenterX,
      gradientCenterY,
      0,
      x,
      y,
      radius,
    );
    sunGradient.addColorStop(0, "#FFEB3B"); // Bright yellow center
    sunGradient.addColorStop(0.4, "#FFD700"); // Gold
    sunGradient.addColorStop(0.8, "#FFA000"); // Orange
    sunGradient.addColorStop(1, "#FF6F00"); // Dark orange edge
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight for 3D effect
    const highlightRadius = radius * 0.6;
    if (isFinite(highlightRadius)) {
      const highlightGradient = ctx.createRadialGradient(
        gradientCenterX,
        gradientCenterY,
        0,
        gradientCenterX,
        gradientCenterY,
        highlightRadius,
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(gradientCenterX, gradientCenterY, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sunspots for texture
    ctx.fillStyle = "rgba(255, 140, 0, 0.4)";
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const spotX = x + Math.cos(angle) * radius * 0.5;
      const spotY = y + Math.sin(angle) * radius * 0.5;
      ctx.beginPath();
      ctx.arc(spotX, spotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rays with gradient
    if (actor.rays !== false) {
      // Validate progress before using it
      if (!isFinite(progress)) {
        console.warn("Invalid progress for sun rays:", progress);
        ctx.restore();
        return;
      }

      const rayProgress = applyEasing(progress, "easeInOut");
      const rayLength = 20 + Math.sin(rayProgress * Math.PI * 2) * 5;

      // Validate rayLength
      if (!isFinite(rayLength)) {
        console.warn(
          "Invalid rayLength:",
          rayLength,
          "progress:",
          progress,
          "rayProgress:",
          rayProgress,
        );
        ctx.restore();
        return;
      }

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startX = x + Math.cos(angle) * radius;
        const startY = y + Math.sin(angle) * radius;
        const endX = x + Math.cos(angle) * (radius + rayLength);
        const endY = y + Math.sin(angle) * (radius + rayLength);

        // Validate all calculated values before creating gradient
        if (
          isFinite(startX) &&
          isFinite(startY) &&
          isFinite(endX) &&
          isFinite(endY)
        ) {
          // Ray gradient
          const rayGradient = ctx.createLinearGradient(
            startX,
            startY,
            endX,
            endY,
          );
          rayGradient.addColorStop(0, "#FFD700");
          rayGradient.addColorStop(1, "rgba(255, 215, 0, 0)");
          ctx.strokeStyle = rayGradient;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }
    }

    // Smooth shine animation
    if (animation === "shine") {
      const shineIntensity = 0.3 + Math.sin(progress * Math.PI * 4) * 0.2;
      ctx.globalAlpha = shineIntensity;
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  drawWater(actor, progress, animation) {
    const ctx = this.ctx;
    const count = actor.count || 1;
    const startY = actor.y || 300;
    const endY = (actor.y || 300) - 200;
    const baseX = actor.x || 400;

    // Validate values are finite numbers
    if (!isFinite(baseX) || !isFinite(startY)) {
      console.warn("Invalid water position:", { x: baseX, y: startY });
      return;
    }

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * 0.5;
      const rawProgress = Math.max(0, Math.min(1, (progress - offset) * 2));
      // Use easing for smooth movement
      const dropProgress = applyEasing(rawProgress, "easeOut");
      const y = interpolate(startY, endY, dropProgress, "easeOut");
      const x = baseX + (i - count / 2) * 20;

      // Validate all values before creating gradient
      if (!isFinite(x) || !isFinite(y) || !isFinite(dropProgress)) {
        continue; // Skip this drop if values are invalid
      }

      // Drop shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.ellipse(x + 1, y + 2, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main drop with gradient
      const waterGradient = ctx.createLinearGradient(x, y - 12, x, y + 12);
      waterGradient.addColorStop(0, "#64B5F6"); // Light blue top
      waterGradient.addColorStop(0.3, "#42A5F5"); // Medium blue
      waterGradient.addColorStop(0.7, "#2196F3"); // Base blue
      waterGradient.addColorStop(1, "#1565C0"); // Dark blue bottom
      ctx.fillStyle = waterGradient;
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight (water reflection)
      const highlightGradient = ctx.createRadialGradient(
        x - 3,
        y - 6,
        0,
        x - 3,
        y - 6,
        6,
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.ellipse(x - 3, y - 6, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Edge highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawCO2(actor, progress, animation) {
    const ctx = this.ctx;
    const count = actor.count || 1;
    const startX = actor.x || 400;
    const endX = (actor.x || 400) + 200;
    const baseY = actor.y || 300;

    // Validate values are finite numbers
    if (!isFinite(startX) || !isFinite(baseY)) {
      console.warn("Invalid CO2 position:", { x: startX, y: baseY });
      return;
    }

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * 0.3;
      const rawProgress = Math.max(0, Math.min(1, (progress - offset) * 1.5));
      // Use easing for smooth floating motion
      const bubbleProgress = applyEasing(rawProgress, "easeInOut");
      const x = interpolate(startX, endX, bubbleProgress, "easeInOut");
      // Smooth sine wave for floating effect
      const floatY = Math.sin(bubbleProgress * Math.PI) * 50;
      const y = baseY + floatY;

      ctx.strokeStyle = "#9E9E9E";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("CO₂", x, y + 4);
    }
  }

  drawGlucose(actor, progress, animation) {
    const ctx = this.ctx;
    const x = actor.x || 400;
    const y = actor.y || 300;

    // Validate values are finite numbers
    if (!isFinite(x) || !isFinite(y)) {
      console.warn("Invalid glucose position:", { x, y });
      return;
    }

    // Smooth appear with easing
    const scale = animation === "appear" ? applyEasing(progress, "easeOut") : 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#FF9800";
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#F57C00";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("C₆H₁₂O₆", 0, 5);

    ctx.restore();
  }

  drawOxygen(actor, progress, animation) {
    const ctx = this.ctx;
    const count = actor.count || 1;
    const startY = actor.y || 300;
    const endY = (actor.y || 300) - 150;
    const baseX = actor.x || 400;

    // Validate values are finite numbers
    if (!isFinite(baseX) || !isFinite(startY)) {
      console.warn("Invalid oxygen position:", { x: baseX, y: startY });
      return;
    }

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * 0.2;
      const rawProgress = Math.max(0, Math.min(1, (progress - offset) * 1.2));
      // Use easing for smooth bubble rise
      const bubbleProgress = applyEasing(rawProgress, "easeOut");
      const y = interpolate(startY, endY, bubbleProgress, "easeOut");
      const x = baseX + (i - count / 2) * 15;

      ctx.strokeStyle = "#4CAF50";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#4CAF50";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("O₂", x, y + 4);
    }
  }

  drawText(text, scene, transitionProgress = 0, nextScene = null) {
    const ctx = this.ctx;
    const y = 50;

    // Fade out current text
    if (transitionProgress > 0 && nextScene) {
      ctx.globalAlpha = 1 - transitionProgress;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(20, y - 30, this.canvas.width - 40, 50);

    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.fillText(text, 30, y);

    ctx.globalAlpha = 1;

    // Fade in next text
    if (transitionProgress > 0 && nextScene && nextScene.text) {
      ctx.globalAlpha = transitionProgress;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(20, y - 30, this.canvas.width - 40, 50);
      ctx.fillStyle = "white";
      ctx.fillText(nextScene.text, 30, y);
      ctx.globalAlpha = 1;
    }
  }

  drawBackground() {
    const ctx = this.ctx;

    // Modern, clean gradient background - subtle and professional
    const mainGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    mainGradient.addColorStop(0, "#F8F9FA"); // Very light gray top
    mainGradient.addColorStop(0.5, "#FFFFFF"); // Pure white middle
    mainGradient.addColorStop(1, "#F5F7FA"); // Light gray bottom
    ctx.fillStyle = mainGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle radial gradient overlay for depth (very subtle)
    const radialGradient = ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) * 0.8,
    );
    radialGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    radialGradient.addColorStop(0.7, "rgba(248, 249, 250, 0.3)");
    radialGradient.addColorStop(1, "rgba(245, 247, 250, 0.5)");
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Very subtle grid pattern for professional look (optional, very light)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.02)";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }
}
