/**
 * domains/wind_energy.ts
 */

import {
  drawBolt,
  drawGenerator,
  drawWindArrow,
  drawWindTurbine,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "wind energy",
  "wind mill",
  "wind turbine",
  "wind power",
  "wind propeller",
  "generator",
  "hambanthota",
  "wind power station",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H);
  sk.addColorStop(0, "#c0ecff");
  sk.addColorStop(1, "#f6fcff");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#83ce72";
  ctx.fillRect(0, H * 0.7, W, H * 0.3);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawWindTurbine(ctx, W * 0.5, H * 0.58, 1.1, 1, t * 2.6);
  drawWindArrow(ctx, W * 0.18, H * 0.28, 120, 1);
  drawWindArrow(ctx, W * 0.14, H * 0.4, 150, 0.85);
  drawBolt(ctx, W * 0.77, H * 0.46, 24, 1, "#ffd24e");
  drawGenerator(ctx, W * 0.82, H * 0.6, 0.8, 1);
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

  drawWindArrow(ctx, W * 0.2, H * 0.38, 110, a);
  drawWindTurbine(ctx, W * 0.5, H * 0.58, 0.95, a, t * 2.8);

  if (/generator/.test(txt)) {
    drawGenerator(ctx, W * 0.78, H * 0.58, 0.75, a);
    return;
  }

  drawBolt(ctx, W * 0.78, H * 0.48, 24, a, "#ffd24e");
}
