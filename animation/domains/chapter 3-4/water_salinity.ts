/**
 * domains/water_salinity.ts
 */

import {
  drawSaltCrystal,
  drawSalinityGauge,
  drawWaterDrop,
  drawWave,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "salinity",
  "fresh water",
  "marine water",
  "brackish water",
  "salt water",
  "sea water",
  "sodium chloride",
  "lagoon",
  "dissolved salt",
  "saltern",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#eef9ff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#dff4ff";
  ctx.fillRect(0, 0, W / 3, H);

  ctx.fillStyle = "#caedff";
  ctx.fillRect(W / 3, 0, W / 3, H);

  ctx.fillStyle = "#b8e7f7";
  ctx.fillRect((W * 2) / 3, 0, W / 3, H);

  drawWave(ctx, W * 0.16, H * 0.72, 84, 0.9, "#57beff");
  drawWave(ctx, W * 0.5, H * 0.72, 84, 0.9, "#257bcf");
  drawWave(ctx, W * 0.84, H * 0.72, 84, 0.9, "#2daea8");
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawWaterDrop(ctx, W * 0.16, H * 0.38, 26, 1, "#5dc8ff");
  drawWaterDrop(ctx, W * 0.5, H * 0.38, 26, 1, "#2664c9");
  drawWaterDrop(ctx, W * 0.84, H * 0.38, 26, 1, "#2da6a0");

  drawSaltCrystal(ctx, W * 0.5, H * 0.3, 10, 1);
  drawSaltCrystal(ctx, W * 0.82, H * 0.28, 8, 1);
  drawSaltCrystal(ctx, W * 0.86, H * 0.31, 9, 1);

  drawSalinityGauge(ctx, W * 0.5, H * 0.16, 90, 1, 0.65);
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

  if (/fresh/.test(txt)) {
    drawWaterDrop(ctx, W * 0.5, H * 0.42, 30, a, "#5dc8ff");
    return;
  }

  if (/marine|sea|salt water|saltern/.test(txt)) {
    drawWaterDrop(ctx, W * 0.5, H * 0.42, 30, a, "#235fc2");
    for (let i = 0; i < 4; i++) {
      drawSaltCrystal(ctx, W * 0.44 + i * 16, H * 0.28 + (i % 2) * 6, 7, a);
    }
    return;
  }

  if (/brackish|lagoon/.test(txt)) {
    drawWaterDrop(ctx, W * 0.5, H * 0.42, 30, a, "#2da6a0");
    drawSaltCrystal(ctx, W * 0.47, H * 0.3, 7, a);
    drawSaltCrystal(ctx, W * 0.53, H * 0.32, 7, a);
    return;
  }

  drawWaterDrop(ctx, W * 0.28, H * 0.42, 24, a, "#5dc8ff");
  drawWaterDrop(ctx, W * 0.5, H * 0.42, 24, a, "#2da6a0");
  drawWaterDrop(ctx, W * 0.72, H * 0.42, 24, a, "#235fc2");

  drawSaltCrystal(ctx, W * 0.5, H * 0.29, 7, a);
  drawSaltCrystal(ctx, W * 0.69, H * 0.27, 7, a);
  drawSaltCrystal(ctx, W * 0.73, H * 0.31, 7, a);
  drawSaltCrystal(ctx, W * 0.77, H * 0.27, 7, a);
}
