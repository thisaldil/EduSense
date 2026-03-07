/**
 * domains/importance_of_water.ts
 */

import {
  C,
  drawFactory,
  drawPlant,
  drawTap,
  drawWaterDrop,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "importance of water",
  "water for agriculture",
  "water for industries",
  "water for drinking",
  "water for transport",
  "sanitation",
  "household",
  "water for leisure",
  "hydro electricity",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#eaf8ff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#8cd56a";
  ctx.fillRect(0, H * 0.64, W * 0.34, H * 0.36);

  ctx.fillStyle = "#d9dde3";
  ctx.fillRect(W * 0.34, H * 0.5, W * 0.34, H * 0.5);

  ctx.fillStyle = "#55b6ec";
  ctx.fillRect(W * 0.68, H * 0.62, W * 0.32, H * 0.38);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawWaterDrop(ctx, W * 0.5, H * 0.34, 28, 1, "#4ebfff");
  drawPlant(ctx, W * 0.18, H * 0.58, 0.95 + Math.sin(t * 1.2) * 0.04, 1);
  drawTap(ctx, W * 0.5, H * 0.3, 0.9, 1);
  drawFactory(ctx, W * 0.82, H * 0.5, 0.9, 1);
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

  drawWaterDrop(ctx, W * 0.34, H * 0.42, 24, a, "#4ebfff");

  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = C.arrowDef;
  ctx.lineWidth = 3;

  const arrows = [];
  if (/agric|plant|farm/.test(txt)) arrows.push([W * 0.28, H * 0.6]);
  if (/drink|house|sanitation|tap/.test(txt)) arrows.push([W * 0.52, H * 0.58]);
  if (/industr|factory/.test(txt)) arrows.push([W * 0.76, H * 0.56]);

  if (arrows.length === 0) {
    arrows.push([W * 0.24, H * 0.6], [W * 0.5, H * 0.58], [W * 0.76, H * 0.56]);
  }

  arrows.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(W * 0.38, H * 0.45);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  ctx.restore();

  if (/agric|plant|farm/.test(txt) || !/drink|house|industr|factory/.test(txt)) {
    drawPlant(ctx, W * 0.24, H * 0.67, 0.9, a);
  }
  if (/drink|house|sanitation|tap/.test(txt) || !/agric|plant|farm|industr|factory/.test(txt)) {
    drawTap(ctx, W * 0.52, H * 0.58, 0.72, a);
  }
  if (/industr|factory/.test(txt) || !/agric|plant|farm|drink|house|sanitation|tap/.test(txt)) {
    drawFactory(ctx, W * 0.76, H * 0.63, 0.72, a);
  }
}