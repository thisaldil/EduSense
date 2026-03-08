/**
 * photosynthesisChoreographer.ts — Scene choreography for photosynthesis/Energy.
 *
 * Adds test-visual-style overlays when rendering JSON scripts:
 * - Light beams from sun to plant (when sun + plant + arrow exist)
 * - CO₂ bubbles drifting in (when CO₂ label exists)
 * - Water drops rising from roots (when H₂O label exists)
 * - Speech bubbles (when scene text suggests narrative)
 *
 * Uses actor positions from the script; draws BEFORE actors so actors render on top.
 * EXPO-2D-CONTEXT SAFE — uses only shapes from core/shapes.
 */

import {
  C,
  drawCO2,
  drawLightRay,
  drawWaterDrop,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;
type Actor = { type: string; x?: number; y?: number; text?: string; [k: string]: any };

/** Extract first actor of given type(s) from scene. */
function findActor(actors: Actor[], ...types: string[]): Actor | undefined {
  const set = new Set(types.map((t) => t.toLowerCase()));
  return (actors || []).find((a) => set.has((a.type || "").toLowerCase()));
}

/** Get position from actor, with fallbacks */
function getPos(actor: Actor | undefined, x: number, y: number): { x: number; y: number } {
  if (!actor) return { x, y };
  return { x: actor.x ?? x, y: actor.y ?? y };
}

/** Check if scene has actors that warrant choreography (not just keyword fallback) */
export function hasChoreography(scene: { actors?: Actor[] }): boolean {
  const actors = scene.actors || [];
  const hasPlant = actors.some((a) => /plant|leaf/.test((a.type || "").toLowerCase()));
  const hasSun = actors.some((a) => /sun|star/.test((a.type || "").toLowerCase()));
  const hasLabels = actors.some((a) => (a.type || "").toLowerCase() === "label" && a.text);
  return (hasPlant && hasSun) || hasLabels;
}

/** Skip anchor characters when plant + sun come from actors (avoids duplication) */
export function shouldSkipAnchors(scene: { actors?: Actor[] }): boolean {
  const actors = scene.actors || [];
  const hasPlant = actors.some((a) => /plant|leaf/.test((a.type || "").toLowerCase()));
  const hasSun = actors.some((a) => /sun|star/.test((a.type || "").toLowerCase()));
  return hasPlant && hasSun;
}

/** Draw light beams from sun to plant when sun + plant + arrow exist */
function drawLightBeamChoreography(
  ctx: Ctx,
  scene: { actors?: Actor[] },
  W: number,
  H: number,
  elapsed: number,
): void {
  const actors = scene.actors || [];
  const sunActor = findActor(actors, "sun", "star");
  const plantActor = findActor(actors, "plant", "leaf");
  const arrowActor = findActor(actors, "arrow");

  if (!sunActor || !plantActor) return;

  const sunPos = getPos(sunActor, W * 0.78, H * 0.14);
  const plantPos = getPos(plantActor, W * 0.28, H * 0.65);

  // Sun bottom edge → plant top (leaf area)
  const x1 = sunPos.x;
  const y1 = sunPos.y + (sunActor.size ?? 52) * 0.6;
  const x2 = plantPos.x + 20;
  const y2 = plantPos.y - 120;

  const beamAlpha = fadeIn(elapsed, arrowActor ? 400 : 600, 800);
  if (beamAlpha <= 0) return;

  // Draw 2–3 staggered rays (like test-visual)
  [0, 180, 360].forEach((delay, i) => {
    const ra = fadeIn(elapsed, delay, 500);
    const wobble = Math.sin(elapsed * 0.05 * 0.05 + i) * 8;
    drawLightRay(ctx, x1 - 20, y1, x2 + wobble, y2, beamAlpha * ra * 0.85);
  });
}

/** Draw CO₂ bubbles drifting from right toward plant when CO₂ label exists */
function drawCO2Choreography(
  ctx: Ctx,
  scene: { actors?: Actor[]; text?: string },
  W: number,
  H: number,
  elapsed: number,
): void {
  const actors = scene.actors || [];
  const hasCO2Label = actors.some(
    (a) =>
      (a.type || "").toLowerCase() === "label" &&
      /co₂|co2|carbon/i.test((a.text || "").replace(/\s/g, "")),
  );
  const plantActor = findActor(actors, "plant", "leaf");
  const plantPos = getPos(plantActor, W * 0.28, H * 0.65);
  const txt = (scene.text || "").toLowerCase();

  if (!hasCO2Label && !/dioxide|co2|carbon/.test(txt)) return;

  const cx = plantPos.x + 30;
  const cy = plantPos.y - 80;
  const startX = W * 0.9;

  [0, 300, 600].forEach((delay, i) => {
    const travel = easeOut(clamp01((elapsed - delay) / 2400));
    const bx = lerp(startX, cx + i * 10, travel);
    const by = cy - i * 35 + Math.sin(elapsed * 0.05 * 0.05 + i * 2) * 12;
    const ba = fadeIn(elapsed, delay, 400);
    drawCO2(ctx, bx, by, 26, ba);
  });
}

/** Draw water drops rising from roots when H₂O label exists */
function drawWaterChoreography(
  ctx: Ctx,
  scene: { actors?: Actor[]; text?: string },
  W: number,
  H: number,
  elapsed: number,
): void {
  const actors = scene.actors || [];
  const hasH2OLabel = actors.some(
    (a) =>
      (a.type || "").toLowerCase() === "label" &&
      /h₂o|h2o|water/i.test((a.text || "").replace(/\s/g, "")),
  );
  const plantActor = findActor(actors, "plant", "leaf");
  const plantPos = getPos(plantActor, W * 0.28, H * 0.65);
  const txt = (scene.text || "").toLowerCase();

  if (!hasH2OLabel && !/water|h2o|soak|roots/.test(txt)) return;

  const groundY = plantPos.y;
  const stemTop = plantPos.y - 80;

  [0, 500, 1000].forEach((delay, i) => {
    const rise = easeOut(clamp01((elapsed - delay) / 2000));
    const dx = plantPos.x - 12 + i * 12;
    const dy = lerp(groundY + 80, stemTop, rise);
    const da = fadeIn(elapsed, delay, 400);
    drawWaterDrop(ctx, dx, dy, 14 + i * 2, da, C.water);
  });
}

/** Draw speech bubble above plant when scene text suggests narrative */
function drawSpeechBubbleChoreography(
  ctx: Ctx,
  scene: { actors?: Actor[]; text?: string },
  W: number,
  H: number,
  elapsed: number,
): void {
  const text = (scene.text || "").trim();
  if (!text || text.length > 60) return;

  const plantActor = findActor(scene.actors || [], "plant", "leaf");
  const plantPos = getPos(plantActor, W * 0.28, H * 0.65);

  const bubbleAlpha = fadeIn(elapsed, 1500, 600);
  if (bubbleAlpha <= 0) return;

  // Shorten text for bubble (first sentence or first 40 chars)
  const bubbleText = text.split(/[.!?]/)[0]?.slice(0, 40) || text.slice(0, 40);
  const bx = plantPos.x;
  const by = plantPos.y - 155;

  drawSpeechBubble(ctx, bubbleText, bx, by, bubbleAlpha);
}

/**
 * Draw a simple speech bubble (shape only — fillText may be no-op on native).
 * EXPO-2D-CONTEXT: fillText is stubbed, so we draw the bubble shape.
 */
function drawSpeechBubble(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  alpha: number,
): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  const pad = 10;
  const fontSize = 13;
  const tw = typeof (ctx as any).measureText === "function"
    ? (ctx as any).measureText(text).width
    : text.length * 8;
  const bw = Math.max(tw + pad * 2, 60);
  const bh = 30;
  const bx = x - bw / 2;
  const by = y - bh - 14;

  // Bubble body (rounded rect)
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#E0E0E0";
  ctx.lineWidth = 1;
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(bx, by, bw, bh, 8);
  } else {
    ctx.rect(bx, by, bw, bh);
  }
  ctx.fill();
  ctx.stroke();

  // Tail
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(x - 8, by + bh);
  ctx.lineTo(x + 8, by + bh);
  ctx.lineTo(x, by + bh + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#E0E0E0";
  ctx.stroke();

  // Text (works on web; may be no-op on native)
  ctx.fillStyle = "#1A237E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${fontSize}px sans-serif`;
  (ctx as any).fillText?.(text, x, by + bh / 2);

  ctx.restore();
}

/**
 * Draw choreography that goes UNDER actors (light beams, CO₂, water).
 * Call this BEFORE renderActors.
 */
export function drawPhotosynthesisChoreographyUnder(
  scene: { actors?: Actor[]; text?: string },
  ctx: Ctx,
  W: number,
  H: number,
  elapsed: number,
): void {
  if (!hasChoreography(scene)) return;

  drawLightBeamChoreography(ctx, scene, W, H, elapsed);
  drawCO2Choreography(ctx, scene, W, H, elapsed);
  drawWaterChoreography(ctx, scene, W, H, elapsed);
}

/**
 * Draw choreography that goes OVER actors (speech bubbles).
 * Call this AFTER renderActors.
 */
export function drawPhotosynthesisChoreographyOver(
  scene: { actors?: Actor[]; text?: string },
  ctx: Ctx,
  W: number,
  H: number,
  elapsed: number,
): void {
  if (!hasChoreography(scene)) return;

  drawSpeechBubbleChoreography(ctx, scene, W, H, elapsed);
}
