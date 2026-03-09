/**
 * domains/respiration.ts — Background, anchors, and keyword fallback for Respiration.
 */

import {
  C,
  drawArrow,
  drawCO2,
  drawLungs,
  drawO2,
  drawChestArc,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "respiration",
  "breathing",
  "inhaling",
  "exhaling",
  "oxygen",
  "carbon dioxide",
  "chest",
  "lungs",
  "lung",
  "respiratory movement",
  "breathe",
  "inhale",
  "exhale",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, "#f8fafc");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.indoorWall;
  ctx.fillRect(W * 0.12, H * 0.18, W * 0.76, H * 0.7);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const breathe = 0.95 + Math.sin(t * 0.9) * 0.07;
  drawLungs(ctx, W * 0.5, H * 0.52, 1.2, 1, breathe);
  drawChestArc(ctx, W * 0.5, H * 0.66, W * 0.18, 0.5);
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
  const breathe = 0.95 + Math.sin(t * 0.9) * 0.07;
  const a = fadeIn(elapsed, 200, 700);
  drawLungs(ctx, W * 0.5, H * 0.52, 1.35, a, breathe);

  if (/inhal|oxygen/.test(txt)) {
    const travel = easeOut(clamp01((elapsed - 200) / 1500));
    const ox = lerp(W * 0.15, W * 0.38, travel);
    drawO2(ctx, ox, H * 0.46, 18, fadeIn(elapsed, 200, 400));
    // arrow from left toward lung
    drawArrow(ctx, W * 0.15, H * 0.46, 0, (W * 0.38 - W * 0.15) * travel, "#66BB6A", 3, a);
  }
  if (/exhal|carbon/.test(txt)) {
    const travel = easeOut(clamp01((elapsed - 600) / 1500));
    const co2x = lerp(W * 0.62, W * 0.85, travel);
    drawCO2(ctx, co2x, H * 0.46, 18, fadeIn(elapsed, 600, 400));
    drawArrow(ctx, W * 0.62, H * 0.46, 0, (W * 0.85 - W * 0.62) * travel, "#EF9A9A", 3, fadeIn(elapsed, 400, 500));
  }
  if (!/inhal|exhal|oxygen|carbon/.test(txt)) {
    // default: show O2 in, CO2 out
    const a2 = fadeIn(elapsed, 500, 600);
    drawO2(ctx, W * 0.22, H * 0.44, 20, a2);
    drawArrow(ctx, W * 0.22 + 24, H * 0.44, 0, W * 0.12, "#66BB6A", 3, a2);
    drawCO2(ctx, W * 0.78, H * 0.44, 20, a2);
    drawArrow(ctx, W * 0.62, H * 0.44, 0, W * 0.1, "#EF9A9A", 3, a2);
  }
}
