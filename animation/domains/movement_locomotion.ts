/**
 * domains/movement_locomotion.ts — Movement & Locomotion in animals and plants.
 * Uses inline canvas drawing — no missing shape imports.
 */

import { C, drawArrow, drawSunny, drawSol } from "../core/shapes";
import { fadeIn, clamp01, easeOut } from "../core/easing";

type Ctx = any;

export const keywords = [
  "movement",
  "locomotion",
  "walking",
  "swimming",
  "flying",
  "creeping",
  "movement in animals",
  "movement in plants",
  "bending towards light",
  "motion",
  "migrate",
  "run",
  "jump",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.65);
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, H * 0.65, W, H * 0.35);
  ctx.fillStyle = C.grass;
  ctx.fillRect(0, H * 0.65, W, 16);
  // Water section
  ctx.fillStyle = "#0288D1";
  ctx.fillRect(W * 0.55, H * 0.68, W * 0.45, H * 0.32);
  ctx.fillStyle = "#29B6F6";
  ctx.fillRect(W * 0.55, H * 0.68, W * 0.45, 12);
}

// ── Inline animal shapes ────────────────────────────────────────────────────

function _drawWalkingAnimal(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const step = Math.sin(t * 4) * 8 * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#D4A373";
  // body
  ctx.beginPath();
  ctx.ellipse(cx, cy, 22 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.arc(cx + 20 * scale, cy - 8 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();
  // legs (walking animation)
  ctx.strokeStyle = "#8D6E63"; ctx.lineWidth = 3 * scale; ctx.lineCap = "round";
  [[cx - 10, cy + 12 + step], [cx, cy + 14 - step], [cx + 10, cy + 12 + step]].forEach(([lx, ly]) => {
    ctx.beginPath();
    ctx.moveTo(lx as number, cy + 8 * scale);
    ctx.lineTo(lx as number, ly as number + 14 * scale);
    ctx.stroke();
  });
  // tail
  ctx.beginPath();
  ctx.moveTo(cx - 22 * scale, cy - 4 * scale);
  ctx.quadraticCurveTo(cx - 34 * scale, cy - 16 * scale + step, cx - 28 * scale, cy - 24 * scale);
  ctx.stroke();
  ctx.restore();
}

function _drawFlyingBird(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const flap = Math.sin(t * 6) * 12 * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#37474F";
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = "round";
  // wings
  ctx.beginPath();
  ctx.moveTo(cx - 28 * scale, cy + flap);
  ctx.quadraticCurveTo(cx - 14 * scale, cy - 14 * scale - flap, cx, cy - 2 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 28 * scale, cy + flap);
  ctx.quadraticCurveTo(cx + 14 * scale, cy - 14 * scale - flap, cx, cy - 2 * scale);
  ctx.stroke();
  // body
  ctx.fillStyle = "#37474F";
  ctx.beginPath();
  ctx.ellipse(cx + 14 * scale, cy - 2 * scale, 12 * scale, 5 * scale, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawSwimmingFish(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const wobble = Math.sin(t * 3) * 5;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy + wobble);
  // body
  ctx.fillStyle = "#4FC3F7";
  ctx.beginPath();
  ctx.ellipse(0, 0, 28 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // tail fin (wagging)
  ctx.fillStyle = "#0288D1";
  const tailWag = Math.sin(t * 4) * 0.4;
  ctx.save(); ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-28 * scale, 0);
  ctx.lineTo(-44 * scale, -12 * scale);
  ctx.lineTo(-44 * scale, 12 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // eye
  ctx.fillStyle = "#0D47A1";
  ctx.beginPath();
  ctx.arc(22 * scale, -3 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  // Bird flying left side, fish swimming right side, animal walking on ground
  _drawFlyingBird(ctx, W * 0.22, H * 0.28, 1.0, t, 1);
  _drawSwimmingFish(ctx, W * 0.7, H * 0.76, 1.0, t, 1);
  _drawWalkingAnimal(ctx, W * 0.5, H * 0.64, 0.9, t, 1);
  // Plant bending toward sun
  drawSol(ctx, W * 0.88, H * 0.12, 30, t, 0.7);
  drawSunny(ctx, W * 0.18, H * 0.65, t * 0.5, false, 0.7, 0.8);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const txt = sceneText.toLowerCase();
  const a = fadeIn(elapsed, 150, 650);

  if (/fly|bird|wing|air/.test(txt)) {
    _drawFlyingBird(ctx, W * 0.35, H * 0.3, 1.4, t, a);
    _drawFlyingBird(ctx, W * 0.6, H * 0.22, 1.1, t * 0.8, a * 0.7);
    // motion arrow
    const arrowA = fadeIn(elapsed, 600, 500);
    drawArrow(ctx, W * 0.2, H * 0.3, 0, easeOut(clamp01(elapsed / 1500)) * W * 0.55, "#90A4AE", 2, arrowA);
    return;
  }

  if (/swim|fish|water|aquatic/.test(txt)) {
    _drawSwimmingFish(ctx, W * 0.4, H * 0.55, 1.4, t, a);
    const arrowA = fadeIn(elapsed, 600, 500);
    drawArrow(ctx, W * 0.25, H * 0.55, 0, easeOut(clamp01(elapsed / 1400)) * W * 0.4, "#29B6F6", 3, arrowA);
    return;
  }

  if (/walk|run|creep|slither|crawl/.test(txt)) {
    _drawWalkingAnimal(ctx, W * 0.45, H * 0.58, 1.2, t, a);
    const arrowA = fadeIn(elapsed, 600, 500);
    drawArrow(ctx, W * 0.3, H * 0.58, 0, easeOut(clamp01(elapsed / 1400)) * W * 0.35, "#8D6E63", 3, arrowA);
    return;
  }

  if (/plant|bend|light|photo/.test(txt)) {
    drawSunny(ctx, W * 0.28, H * 0.65, t, false, 1.1, a);
    drawSol(ctx, W * 0.8, H * 0.1, 36, t, a * 0.8);
    return;
  }

  // Default: all 3
  _drawFlyingBird(ctx, W * 0.25, H * 0.28, 1.0, t, a);
  _drawSwimmingFish(ctx, W * 0.65, H * 0.75, 1.0, t, a);
  _drawWalkingAnimal(ctx, W * 0.5, H * 0.63, 0.85, t, a);
}
