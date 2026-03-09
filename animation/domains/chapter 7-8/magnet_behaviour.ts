/**
 * domains/magnet_behaviour.ts
 */

import {
  drawBarMagnet,
  drawCardinalMarks,
  drawCompassNeedle,
  drawFloatingRaft,
  drawWaterSurface,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "behaviour of a magnet",
  "magnet aligns north south",
  "suspended magnet",
  "floating magnet",
  "compass direction",
  "magnet orientation",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.68);
  sky.addColorStop(0, "#d2eeff");
  sky.addColorStop(1, "#f7fbff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#7bcf69";
  ctx.fillRect(0, H * 0.68, W, H * 0.32);

  drawWaterSurface(ctx, W * 0.5, H * 0.56, W * 0.46, 1);
  drawCardinalMarks(ctx, W * 0.5, H * 0.56, 1.0, 0.8);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const ang = Math.sin(t * 0.8) * 0.12;
  drawFloatingRaft(ctx, W * 0.5, H * 0.54, 0.92, 1, ang);
  drawBarMagnet(ctx, W * 0.5, H * 0.51, 0.82, 1, ang);
  drawCompassNeedle(ctx, W * 0.5, H * 0.26, 0.8, 0.9, 0);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 150, 500);
  const ang = Math.sin(t * 0.8) * 0.18;

  drawWaterSurface(ctx, W * 0.5, H * 0.6, W * 0.42, a);
  drawCardinalMarks(ctx, W * 0.5, H * 0.6, 0.9, a);
  drawFloatingRaft(ctx, W * 0.5, H * 0.58, 0.88, a, ang);
  drawBarMagnet(ctx, W * 0.5, H * 0.55, 0.76, a, ang);
}
