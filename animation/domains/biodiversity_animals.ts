/**
 * domains/biodiversity_animals.ts — Diversity of Animals (Grade 6 Chapter).
 * Uses inline canvas drawing instead of missing shape imports.
 */

import { C, drawArrow, drawSol } from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "diversity of animals",
  "vertebrate",
  "invertebrate",
  "mammal",
  "bird",
  "fish",
  "reptile",
  "amphibian",
  "insect",
  "classification",
  "animal diversity",
  "wildlife",
  "fauna",
  "habitat",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.62);
  ctx.fillStyle = "#5a9e40";
  ctx.fillRect(0, H * 0.62, W, H * 0.38);
  // grass texture
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(0, H * 0.62, W, 18);
}

// ── Inline animal shapes ────────────────────────────────────────────────────

function _drawFish(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const s = 28 * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#4FC3F7";
  ctx.beginPath();
  ctx.ellipse(cx, cy, s, s * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // tail
  ctx.fillStyle = "#0288D1";
  ctx.beginPath();
  ctx.moveTo(cx - s, cy);
  ctx.lineTo(cx - s - s * 0.7, cy - s * 0.4);
  ctx.lineTo(cx - s - s * 0.7, cy + s * 0.4);
  ctx.closePath();
  ctx.fill();
  // eye
  ctx.fillStyle = "#0D47A1";
  ctx.beginPath();
  ctx.arc(cx + s * 0.45, cy - s * 0.1, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawBird(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const flap = Math.sin(t * 6) * 8 * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#37474F";
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = "round";
  // Each wing = curved line
  ctx.beginPath();
  ctx.moveTo(cx - 24 * scale, cy + flap);
  ctx.quadraticCurveTo(cx - 12 * scale, cy - 14 * scale - flap, cx, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 24 * scale, cy + flap);
  ctx.quadraticCurveTo(cx + 12 * scale, cy - 14 * scale - flap, cx, cy);
  ctx.stroke();
  ctx.restore();
}

function _drawInsect(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  // body
  ctx.fillStyle = "#689F38";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 8 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // wings
  ctx.fillStyle = "rgba(200,230,255,0.7)";
  const wing = Math.sin(t * 12) * 4;
  [[-1, 1]].forEach(([dx]) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx * 18 * scale, cy - 4 * scale + wing, 16 * scale, 8 * scale, -0.4 * dx, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function _drawFrog(ctx: Ctx, cx: number, cy: number, scale: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#66BB6A";
  // body
  ctx.beginPath();
  ctx.ellipse(cx, cy, 18 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.arc(cx + 14 * scale, cy - 6 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();
  // eyes
  ctx.fillStyle = "#FFEE58";
  ctx.beginPath();
  ctx.arc(cx + 18 * scale, cy - 14 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#212121";
  ctx.beginPath();
  ctx.arc(cx + 18 * scale, cy - 14 * scale, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawDeer(ctx: Ctx, cx: number, cy: number, scale: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#D4A373";
  // body
  ctx.beginPath();
  ctx.ellipse(cx, cy, 20 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.arc(cx + 18 * scale, cy - 16 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();
  // antlers
  ctx.strokeStyle = "#8D6E63";
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = "round";
  [[-4, -1], [4, 1]].forEach(([dx]) => {
    ctx.beginPath();
    ctx.moveTo(cx + (18 + dx) * scale, cy - 26 * scale);
    ctx.lineTo(cx + (18 + dx) * scale, cy - 42 * scale);
    ctx.lineTo(cx + (14 + dx) * scale, cy - 36 * scale);
    ctx.stroke();
  });
  // legs
  ctx.strokeStyle = "#8D6E63";
  ctx.lineWidth = 3 * scale;
  [[-10, 12], [-2, 14], [6, 12], [14, 14]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * scale, cy + 8 * scale);
    ctx.lineTo(cx + dx * scale, cy + dy * scale + 12 * scale);
    ctx.stroke();
  });
  ctx.restore();
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const bob = Math.sin(t * 0.8) * 4;
  _drawFish(ctx, W * 0.12, H * 0.72 + bob * 0.5, 1.0, t, 1);
  _drawBird(ctx, W * 0.3, H * 0.3 + bob * 0.8, 1.0, t, 1);
  _drawInsect(ctx, W * 0.5, H * 0.68 + bob, 1.1, t, 1);
  _drawFrog(ctx, W * 0.68, H * 0.71, 1.0, 1);
  _drawDeer(ctx, W * 0.84, H * 0.64, 0.9, 1);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 200, 700);
  const txt = sceneText.toLowerCase();

  if (/fish|aquatic|water animal/.test(txt)) {
    _drawFish(ctx, W * 0.3, H * 0.5, 1.4, t, a);
    _drawFish(ctx, W * 0.55, H * 0.56, 1.1, t * 1.2, a * 0.8);
  } else if (/bird|avian|fly|feather/.test(txt)) {
    _drawBird(ctx, W * 0.3, H * 0.35, 1.4, t, a);
    _drawBird(ctx, W * 0.6, H * 0.28, 1.0, t * 0.8, a * 0.7);
  } else if (/insect|bug|invertebrate/.test(txt)) {
    _drawInsect(ctx, W * 0.3, H * 0.5, 1.5, t, a);
    _drawInsect(ctx, W * 0.55, H * 0.45, 1.2, t * 1.3, a * 0.8);
  } else if (/frog|reptile|amphibian|snake/.test(txt)) {
    _drawFrog(ctx, W * 0.4, H * 0.55, 1.4, a);
  } else if (/deer|mammal|animal|creature/.test(txt)) {
    _drawDeer(ctx, W * 0.45, H * 0.58, 1.2, a);
  } else {
    // Default: show all 5 animal groups
    _drawFish(ctx, W * 0.12, H * 0.72, 0.95, t, a);
    _drawBird(ctx, W * 0.3, H * 0.32, 1.0, t, a);
    _drawInsect(ctx, W * 0.5, H * 0.68, 1.05, t, a);
    _drawFrog(ctx, W * 0.68, H * 0.71, 0.9, a);
    _drawDeer(ctx, W * 0.84, H * 0.64, 0.85, a);
  }
}
