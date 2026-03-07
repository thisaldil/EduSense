/**
 * domains/water_cycle.ts
 */

import {
  C,
  drawCloud,
  drawCycleArrow,
  drawMountain,
  drawRiverArrow,
  drawSol,
  drawWaterDrop,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "water cycle",
  "evaporation",
  "condensation",
  "precipitation",
  "transpiration",
  "runoff",
  "cloud formation",
  "rainfall",
  "water cycle diagram",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  sk.addColorStop(0, "#a9e1ff");
  sk.addColorStop(1, "#f1fbff");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H);

  drawMountain(ctx, W * 0.34, H * 0.56, 170, 1);
  drawMountain(ctx, W * 0.52, H * 0.58, 140, 0.9);

  ctx.fillStyle = "#2f9edf";
  ctx.fillRect(0, H * 0.66, W * 0.3, H * 0.34);

  ctx.fillStyle = "#5fc66a";
  ctx.fillRect(W * 0.3, H * 0.66, W * 0.7, H * 0.34);

  drawCloud(ctx, W * 0.62, H * 0.16, 1.05, 1);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawSol(ctx, W * 0.16, H * 0.14, 46, t, 1);
  drawCloud(ctx, W * 0.66, H * 0.18, 1, 1);

  for (let i = 0; i < 4; i++) {
    drawWaterDrop(ctx, W * 0.63 + i * 18, H * 0.34 + (i % 2) * 10, 10, 0.95, "#46bbff");
  }

  drawCycleArrow(ctx, W * 0.5, H * 0.4, 110, 1, t * 0.6);
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

  if (/evapor/.test(txt)) {
    [0, 220, 440].forEach((d, i) => {
      const p = easeOut(clamp01((elapsed - d) / 1600));
      drawWaterDrop(
        ctx,
        W * 0.36 + i * 18,
        lerp(H * 0.72, H * 0.42, p),
        12,
        fadeIn(elapsed, d, 300),
        "#4abfff",
      );
    });
    return;
  }

  if (/condens|cloud/.test(txt)) {
    drawCloud(ctx, W * 0.5, H * 0.3, 1.2, fadeIn(elapsed, 150, 500));
    return;
  }

  if (/rain|precipit/.test(txt)) {
    const a = fadeIn(elapsed, 150, 500);
    drawCloud(ctx, W * 0.5, H * 0.24, 1.1, a);
    for (let i = 0; i < 6; i++) {
      drawWaterDrop(ctx, W * 0.42 + i * 18, H * 0.38 + (i % 2) * 8, 10, a, "#44b9ff");
    }
    return;
  }

  if (/runoff|river/.test(txt)) {
    drawRiverArrow(ctx, W * 0.5, H * 0.66, 140, fadeIn(elapsed, 150, 500));
    return;
  }

  const a = fadeIn(elapsed, 150, 500);
  drawWaterDrop(ctx, W * 0.26, H * 0.62, 14, a, "#4abfff");
  drawCloud(ctx, W * 0.48, H * 0.24, 1.0, a);
  drawWaterDrop(ctx, W * 0.66, H * 0.42, 10, a, "#4abfff");
  drawRiverArrow(ctx, W * 0.74, H * 0.7, 90, a);
}