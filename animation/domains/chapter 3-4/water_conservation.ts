/**
 * domains/water_conservation.ts
 */

import {
  C,
  drawCrackedEarth,
  drawPlant,
  drawTapOff,
  drawWaterDrop,
} from "../core/shapes";
import { fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "water conservation",
  "limited resource",
  "water pollution",
  "water scarcity",
  "water management",
  "save water",
  "contamination",
  "water a limited resource",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#dbf8d4";
  ctx.fillRect(0, 0, W * 0.5, H);

  ctx.fillStyle = "#f9e7bf";
  ctx.fillRect(W * 0.5, 0, W * 0.5, H);

  ctx.fillStyle = "#76cc68";
  ctx.fillRect(0, H * 0.66, W * 0.5, H * 0.34);

  drawCrackedEarth(ctx, W * 0.75, H * 0.8, W * 0.44, H * 0.32, 1);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const bob = Math.sin(t * 1.2) * 6;
  drawWaterDrop(ctx, W * 0.57, H * 0.36 + bob, 26, 1, "#46bcff");
  drawTapOff(ctx, W * 0.26, H * 0.28, 0.9, 1);
  drawPlant(ctx, W * 0.22, H * 0.66, 0.95, 1);
  drawPlant(ctx, W * 0.78, H * 0.7, 0.7, 0.45);
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

  if (/save water|tap|management/.test(txt)) {
    drawTapOff(ctx, W * 0.5, H * 0.36, 1.05, a);
    return;
  }

  if (/scarcity|limited resource|drought/.test(txt)) {
    const r = lerp(28, 16, Math.min(1, elapsed / 1800));
    drawWaterDrop(ctx, W * 0.48, H * 0.38, r, a, "#48beff");
    drawCrackedEarth(ctx, W * 0.52, H * 0.76, W * 0.46, H * 0.26, a);
    return;
  }

  if (/pollution|contamin/.test(txt)) {
    drawWaterDrop(ctx, W * 0.5, H * 0.4, 24, a, "#6aa6b5");
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = C.danger ?? "#b94c4c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W * 0.43, H * 0.31);
    ctx.lineTo(W * 0.57, H * 0.49);
    ctx.moveTo(W * 0.57, H * 0.31);
    ctx.lineTo(W * 0.43, H * 0.49);
    ctx.stroke();
    ctx.restore();
    return;
  }

  drawWaterDrop(ctx, W * 0.42, H * 0.36, 20, a, "#49beff");
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = C.arrowDef;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W * 0.48, H * 0.38);
  ctx.lineTo(W * 0.48, H * 0.54);
  ctx.stroke();
  ctx.restore();
  drawCrackedEarth(ctx, W * 0.52, H * 0.78, W * 0.42, H * 0.24, a);
}