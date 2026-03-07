/**
 * domains/fossil_fuels.ts
 */

import {
  drawCoalLump,
  drawFlame,
  drawOilDrop,
  drawPumpJack,
  drawRockLayer,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "fossil fuel",
  "petroleum",
  "coal",
  "natural gas",
  "oil well",
  "petrol",
  "diesel",
  "fossil",
  "buried plants animals",
  "millions of years",
  "non-renewable",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#d7f0ff";
  ctx.fillRect(0, 0, W, H * 0.32);

  ctx.fillStyle = "#7cc96d";
  ctx.fillRect(0, H * 0.32, W, H * 0.12);

  drawRockLayer(ctx, W * 0.5, H * 0.58, W, H * 0.56, 1);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawPumpJack(ctx, W * 0.24, H * 0.28, 0.9, 1);
  drawOilDrop(ctx, W * 0.56, H * 0.66, 22, 1, "#222");
  drawCoalLump(ctx, W * 0.74, H * 0.72, 0.85, 1);
  drawFlame(ctx, W * 0.84, H * 0.28, 0.85, 1);
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

  drawRockLayer(ctx, W * 0.5, H * 0.6, W * 0.88, H * 0.5, a);

  if (/petroleum|oil well|diesel|petrol/.test(txt)) {
    drawOilDrop(ctx, W * 0.52, H * 0.64, 24, a, "#222");
    drawPumpJack(ctx, W * 0.28, H * 0.3, 0.85, a);
    return;
  }

  if (/coal/.test(txt)) {
    drawCoalLump(ctx, W * 0.54, H * 0.7, 1.0, a);
    return;
  }

  if (/gas|fuel/.test(txt)) {
    drawFlame(ctx, W * 0.52, H * 0.46, 1.0, a);
    return;
  }

  drawOilDrop(ctx, W * 0.52, H * 0.64, 22, a, "#222");
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W * 0.52, H * 0.54);
  ctx.lineTo(W * 0.52, H * 0.36);
  ctx.stroke();
  ctx.restore();
}