/**
 * domains/water_energy_hydro.ts
 */

import {
  drawBolt,
  drawDam,
  drawTurbine,
  drawWaterArrow,
  drawWave,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "water energy",
  "hydropower",
  "turbine",
  "potential energy",
  "running water",
  "dam",
  "power station",
  "flowing water",
  "water stored in water",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#d7f2ff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#81cf6b";
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  ctx.fillStyle = "#279ce0";
  ctx.fillRect(0, H * 0.34, W * 0.36, H * 0.36);

  drawDam(ctx, W * 0.42, H * 0.52, 1.15, 1);
  drawWave(ctx, W * 0.17, H * 0.42, 120, 0.95, "#2d9de1");
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawWaterArrow(ctx, W * 0.38, H * 0.44, 120, 1);
  drawTurbine(ctx, W * 0.56, H * 0.62, 0.95, 1, t * 2.5);
  drawBolt(ctx, W * 0.76, H * 0.54, 24, 1, "#ffd34c");
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
  const a = fadeIn(elapsed, 150, 500);

  drawDam(ctx, W * 0.34, H * 0.52, 0.95, a);
  drawWaterArrow(ctx, W * 0.44, H * 0.46, 90, a);

  if (/turbine/.test(txt)) {
    drawTurbine(ctx, W * 0.62, H * 0.58, 0.8, a, t * 2.6);
    return;
  }

  drawTurbine(ctx, W * 0.62, H * 0.58, 0.8, a, t * 2.6);
  drawBolt(ctx, W * 0.8, H * 0.5, 22, a, "#ffd34c");
}
