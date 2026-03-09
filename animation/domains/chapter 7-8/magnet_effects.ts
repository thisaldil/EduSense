/**
 * domains/magnet_effects.ts
 */

import {
  C,
  drawArrowCurve,
  drawBarMagnet,
  drawIronNails,
  drawMetalShavings,
  drawNonMagneticObject,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "magnet effects",
  "attract",
  "magnetic attraction",
  "iron",
  "steel",
  "nickel",
  "cobalt",
  "magnetic materials",
  "non-magnetic",
  "effects of magnets",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, H * 0.68, W, H * 0.32);

  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.68);
  ctx.lineTo(W, H * 0.68);
  ctx.stroke();
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawBarMagnet(ctx, W * 0.5, H * 0.42, 1.1, 1);
  drawIronNails(ctx, W * 0.33, H * 0.42, 0.95, 1);
  drawIronNails(ctx, W * 0.67, H * 0.42, 0.95, 1);
  drawMetalShavings(ctx, W * 0.5, H * 0.6, 0.95, 0.75);
  drawArrowCurve(ctx, W * 0.36, H * 0.4, -1, 46, 1);
  drawArrowCurve(ctx, W * 0.64, H * 0.4, 1, 46, 1);
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

  if (/non-magnetic|wood|plastic|rubber/.test(txt)) {
    drawNonMagneticObject(ctx, W * 0.72, H * 0.42, 0.95, a);
    return;
  }

  drawIronNails(ctx, W * 0.3, H * 0.42, 0.9, a);
  drawIronNails(ctx, W * 0.7, H * 0.42, 0.9, a);
  drawArrowCurve(ctx, W * 0.36, H * 0.4, -1, 42, a);
  drawArrowCurve(ctx, W * 0.64, H * 0.4, 1, 42, a);
}
