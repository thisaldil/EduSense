/**
 * domains/respiration.ts — Background, anchors, and keyword fallback for Respiration.
 */

import {
  C,
  drawLungs,
  drawO2Bubble,
  drawCO2Bubble,
  drawArrow,
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
  "respiratory movement",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, "#f8fafc");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.indoorWall;
  ctx.fillRect(W * 0.15, H * 0.22, W * 0.7, H * 0.65);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const breathe = Math.sin(t * 0.12) * 3 + 3;
  drawLungs(ctx, W * 0.5, H * 0.52, 1.15, t, breathe);
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
  const breathe = Math.sin(t * 0.12) * 3 + 3;
  const a = fadeIn(elapsed, 200, 700);
  drawLungs(ctx, W * 0.5, H * 0.52, 1.4, t, breathe, a);
  if (/inhal|oxygen/.test(txt)) {
    drawO2Bubble(ctx, W * 0.38, H * 0.48, 18, fadeIn(elapsed, 300, 400));
    drawArrow(ctx, W * 0.38, H * 0.55, W * 0.48, H * 0.48, a);
  }
  if (/exhal|carbon/.test(txt)) {
    drawCO2Bubble(ctx, W * 0.62, H * 0.48, 18, fadeIn(elapsed, 800, 400));
    drawArrow(ctx, W * 0.52, H * 0.48, W * 0.62, H * 0.55, a);
  }
}
