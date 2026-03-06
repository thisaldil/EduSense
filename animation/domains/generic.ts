/**
 * domains/generic.ts — Safe fallback for unknown topics.
 */

import { C, drawCloud, drawConceptPill, drawSol, drawSunny } from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords: string[] = [];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.65);
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, H * 0.65, W, H * 0.35);
  ctx.fillStyle = C.grass;
  ctx.fillRect(0, H * 0.65, W, 22);
  drawCloud(ctx, W * 0.12, H * 0.09, 1.0);
  drawCloud(ctx, W * 0.72, H * 0.07, 0.75);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawSunny(ctx, W * 0.28, H * 0.65, t, true, 1, 1);
  drawSol(ctx, W * 0.78, H * 0.14, 52, t, 1);
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
  const cy = H * 0.38;
  drawConceptPill(ctx, cx, cy, fadeIn(elapsed, 300, 700));
}
