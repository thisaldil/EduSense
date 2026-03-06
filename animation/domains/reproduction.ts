/**
 * domains/reproduction.ts — Background, anchors, and keyword fallback for Reproduction.
 */

import {
  C,
  drawParentPlant,
  drawBabySprouts,
  drawSeed,
  drawArrow,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "reproduction",
  "offspring",
  "new organism",
  "seed",
  "egg",
  "budding",
  "vegetative reproduction",
  "asexual",
  "sexual reproduction",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.6);
  ctx.fillStyle = C.groundGrass;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawParentPlant(ctx, W * 0.42, H * 0.68, 1.3, t);
  const bob = Math.sin(t * 0.1) * 6;
  drawBabySprouts(ctx, W * 0.68, H * 0.72 + bob, 0.85, t);
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
  const a = fadeIn(elapsed, 200, 700);
  drawParentPlant(ctx, W * 0.35, H * 0.65, 1.6, t, a);
  drawArrow(ctx, W * 0.48, H * 0.62, W * 0.65, H * 0.72, a);
  drawBabySprouts(ctx, W * 0.72, H * 0.72, 1.1, t, a);
}
