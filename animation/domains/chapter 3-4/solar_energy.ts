/**
 * domains/solar_energy.ts
 */

import {
  C,
  drawBolt,
  drawLightRay,
  drawSolarPanel,
  drawSol,
  drawThermometer,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "solar energy",
  "sunlight",
  "sun power",
  "solar panel",
  "solar cooker",
  "solar cell",
  "solar thermal",
  "energy from sun",
  "photovoltaic",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H);
  sk.addColorStop(0, "#b7e7ff");
  sk.addColorStop(1, "#fff5cb");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#77cd6c";
  ctx.fillRect(0, H * 0.68, W, H * 0.32);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawSol(ctx, W * 0.2, H * 0.16, 54, t, 1);
  drawSolarPanel(ctx, W * 0.66, H * 0.58, 1.05, 1);
  drawLightRay(ctx, W * 0.25, H * 0.23, W * 0.6, H * 0.47, 1, "#ffd24a");
  drawLightRay(ctx, W * 0.27, H * 0.28, W * 0.66, H * 0.48, 0.85, "#ffd24a");
  drawBolt(ctx, W * 0.82, H * 0.46, 26, 1, "#ffd546");
  drawThermometer(ctx, W * 0.9, H * 0.3, 56, 0.95, 0.72);
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

  drawSol(ctx, W * 0.24, H * 0.22, 42, 0, a);
  drawSolarPanel(ctx, W * 0.58, H * 0.58, 0.95, a);

  if (/heat|thermal|temperature|cooker/.test(txt)) {
    drawThermometer(ctx, W * 0.78, H * 0.36, 54, a, 0.8);
    return;
  }

  drawLightRay(ctx, W * 0.3, H * 0.27, W * 0.53, H * 0.48, a, "#ffd44a");
  drawBolt(ctx, W * 0.78, H * 0.48, 26, a, "#ffd546");
}
