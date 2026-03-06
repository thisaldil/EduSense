/**
 * domains/living_vs_nonliving.ts — Background, anchors, and keyword fallback for Living vs Nonliving.
 */

import {
  drawSproutingSeedling,
  drawGreyRock,
  drawSol,
  drawArrow,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "living things",
  "non-living",
  "living organisms",
  "growth",
  "environment",
  "components",
  "living world",
  "organisms",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.58);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.58);

  ctx.fillStyle = C.groundGrass;
  ctx.fillRect(0, H * 0.58, W * 0.5, H * 0.42); // lush garden
  ctx.fillStyle = C.groundRock;
  ctx.fillRect(W * 0.5, H * 0.58, W * 0.5, H * 0.42); // grey rocky
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const bob = Math.sin(t * 0.08) * 5;
  drawSproutingSeedling(ctx, W * 0.28, H * 0.65 + bob, 1.2, t);
  drawGreyRock(ctx, W * 0.72, H * 0.72, 1.1);
  drawSol(ctx, W * 0.5, H * 0.22, 55, t);
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
  const bob = Math.sin(t * 0.1) * 6;

  if (/growth|living|organism/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    drawSproutingSeedling(ctx, W * 0.35, H * 0.62 + bob, 1.5, t, a);
    const arrA = fadeIn(elapsed, 600, 500);
    if (arrA > 0) drawArrow(ctx, W * 0.35, H * 0.38, W * 0.35, H * 0.58, arrA); // upward growth
    return;
  }
  // default non-living
  const a = fadeIn(elapsed, 300, 800);
  drawGreyRock(ctx, W * 0.65, H * 0.68, 1.6, a);
}
