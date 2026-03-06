/**
 * domains/gravity.ts — Background, anchors, and keyword fallback for gravity.
 */

import { C, drawPlanet, drawRock, drawSol } from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp, rgba } from "../core/easing";

type Ctx = any;

export const keywords = [
  "gravity",
  "gravitational",
  "falling",
  "free fall",
  "orbit",
  "newton",
  "weight",
  "acceleration due",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sk.addColorStop(0, "#E3F2FD");
  sk.addColorStop(1, "#BBDEFB");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.62);
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, H * 0.62, W, H * 0.38);
  ctx.fillStyle = C.grass;
  ctx.fillRect(0, H * 0.62, W, 18);
  ctx.fillStyle = rgba(C.arrowDef, 0.28);
  for (let y = H * 0.06; y < H * 0.62; y += 18) {
    ctx.beginPath();
    ctx.arc(W * 0.72, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawSol(ctx, W * 0.84, H * 0.1, 40, t, 0.72);
  drawPlanet(ctx, W * 0.5, H * 0.78, 38, 1, "#4CAF50");
}

export function keywordFallback(
  ctx: Ctx,
  _sceneText: string,
  elapsed: number,
  _t: number,
  W: number,
  H: number,
): void {
  const cx = W * 0.62;
  const fall = easeOut(clamp01(elapsed / 2800));
  const ry = lerp(H * 0.1, H * 0.59, fall);
  const a = fadeIn(elapsed, 0, 400);
  drawRock(ctx, cx - 30, ry, 22, a);
  const a2 = fadeIn(elapsed, 600, 600);
  if (a2 > 0) {
    ctx.save();
    ctx.globalAlpha = a2;
    ctx.strokeStyle = "#F44336";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 30, ry + 28);
    ctx.lineTo(cx - 30, ry + 65);
    ctx.stroke();
    ctx.fillStyle = "#F44336";
    ctx.beginPath();
    ctx.moveTo(cx - 41, ry + 56);
    ctx.lineTo(cx - 30, ry + 67);
    ctx.lineTo(cx - 19, ry + 56);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
