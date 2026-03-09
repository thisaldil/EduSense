/**
 * domains/magnetic_poles.ts
 */

import {
  C,
  drawBarMagnet,
  drawCompassNeedle,
  drawCompassRose,
  drawPoleLabelArrow,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "magnetic poles",
  "north pole",
  "south pole",
  "n pole",
  "s pole",
  "compass",
  "pole of a magnet",
  "compass needle",
  "finding direction",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  sky.addColorStop(0, "#d7f0ff");
  sky.addColorStop(1, "#f8fcff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#8ad06b";
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  drawCompassRose(ctx, W * 0.16, H * 0.56, 0.8, 0.65);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawBarMagnet(ctx, W * 0.54, H * 0.42, 1.1, 1);
  drawCompassRose(ctx, W * 0.22, H * 0.56, 1.0, 1);
  drawCompassNeedle(ctx, W * 0.22, H * 0.56, 0.95, 1, 0);
  drawPoleLabelArrow(ctx, W * 0.45, H * 0.3, "N", -1, 1);
  drawPoleLabelArrow(ctx, W * 0.63, H * 0.3, "S", 1, 1);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  _t: number,
  W: number,
  H: number,
): void {
  const txt = sceneText.toLowerCase();
  const a = fadeIn(elapsed, 150, 500);

  drawBarMagnet(ctx, W * 0.5, H * 0.42, 1.0, a);

  if (/compass|direction|north/.test(txt)) {
    drawCompassRose(ctx, W * 0.5, H * 0.68, 0.95, a);
    drawCompassNeedle(ctx, W * 0.5, H * 0.68, 0.85, a, 0);
    return;
  }

  drawPoleLabelArrow(ctx, W * 0.41, H * 0.28, "N", -1, a);
  drawPoleLabelArrow(ctx, W * 0.59, H * 0.28, "S", 1, a);
}
