/**
 * domains/generating_electricity.ts
 */

import {
  drawBatteryCell,
  drawBolt,
  drawCoalFireIcon,
  drawDamTurbineIcon,
  drawGenerator,
  drawSolarPanel,
  drawSourceArrow,
  drawWindTurbine,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "generating electricity",
  "hydropower station",
  "wind power station",
  "coal power plant",
  "fuel power plant",
  "chemical cell",
  "solar cell",
  "dry cell",
  "battery",
  "generator",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  sky.addColorStop(0, "#d9f1ff");
  sky.addColorStop(1, "#f8fcff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#85cf70";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawDamTurbineIcon(ctx, W * 0.16, H * 0.56, 0.78, 1);
  drawWindTurbine(ctx, W * 0.34, H * 0.54, 0.72, 1, t * 2.5);
  drawSolarPanel(ctx, W * 0.5, H * 0.58, 0.72, 1);
  drawCoalFireIcon(ctx, W * 0.68, H * 0.58, 0.8, 1);
  drawBatteryCell(ctx, W * 0.84, H * 0.54, 0.8, 1);

  drawGenerator(ctx, W * 0.5, H * 0.28, 0.9, 1);
  drawBolt(ctx, W * 0.5, H * 0.14, 28, 1, "#ffd34c");
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

  if (/hydro|dam|turbine/.test(txt)) {
    drawDamTurbineIcon(ctx, W * 0.32, H * 0.52, 0.92, a);
    drawSourceArrow(ctx, W * 0.42, H * 0.46, W * 0.58, H * 0.32, a);
    drawBolt(ctx, W * 0.68, H * 0.28, 26, a, "#ffd34c");
    return;
  }

  if (/wind/.test(txt)) {
    drawWindTurbine(ctx, W * 0.34, H * 0.56, 0.9, a, t * 2.6);
    drawSourceArrow(ctx, W * 0.42, H * 0.46, W * 0.58, H * 0.32, a);
    drawBolt(ctx, W * 0.68, H * 0.28, 26, a, "#ffd34c");
    return;
  }

  if (/solar/.test(txt)) {
    drawSolarPanel(ctx, W * 0.34, H * 0.58, 0.88, a);
    drawSourceArrow(ctx, W * 0.42, H * 0.46, W * 0.58, H * 0.32, a);
    drawBolt(ctx, W * 0.68, H * 0.28, 26, a, "#ffd34c");
    return;
  }

  if (/battery|cell|dry cell/.test(txt)) {
    drawBatteryCell(ctx, W * 0.34, H * 0.54, 0.9, a);
    drawSourceArrow(ctx, W * 0.42, H * 0.46, W * 0.58, H * 0.32, a);
    drawBolt(ctx, W * 0.68, H * 0.28, 26, a, "#ffd34c");
    return;
  }

  drawDamTurbineIcon(ctx, W * 0.14, H * 0.56, 0.62, a);
  drawWindTurbine(ctx, W * 0.28, H * 0.56, 0.58, a, t * 2.5);
  drawSolarPanel(ctx, W * 0.42, H * 0.58, 0.58, a);
  drawCoalFireIcon(ctx, W * 0.56, H * 0.58, 0.62, a);
  drawBatteryCell(ctx, W * 0.7, H * 0.54, 0.62, a);
  drawSourceArrow(ctx, W * 0.76, H * 0.48, W * 0.84, H * 0.34, a);
  drawBolt(ctx, W * 0.88, H * 0.3, 24, a, "#ffd34c");
}
