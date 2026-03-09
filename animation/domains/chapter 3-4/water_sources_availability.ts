/**
 * domains/water_sources_availability.ts
 */

import {
  C,
  drawCloud,
  drawTap,
  drawWaterDrop,
  drawWave,
  drawWell,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "types of water",
  "surface water",
  "ground water",
  "precipitation",
  "rain",
  "river",
  "stream",
  "pond",
  "lake",
  "ocean",
  "well",
  "spring",
  "surface water types",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  sky.addColorStop(0, "#bfe9ff");
  sky.addColorStop(1, "#eefbff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#7fce68";
  ctx.fillRect(0, H * 0.68, W, H * 0.32);

  ctx.fillStyle = "#4fb2ff";
  ctx.fillRect(0, H * 0.58, W * 0.26, H * 0.1);

  ctx.fillStyle = "#2f95da";
  ctx.fillRect(W * 0.64, H * 0.55, W * 0.36, H * 0.13);

  ctx.fillStyle = "#9a7b5f";
  ctx.fillRect(W * 0.42, H * 0.68, W * 0.22, H * 0.32);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawCloud(ctx, W * 0.15, H * 0.15, 0.95, 1);
  drawWaterDrop(ctx, W * 0.18, H * 0.38, 22, 1, "#4abfff");
  drawWave(ctx, W * 0.1, H * 0.6, 88, 1, "#2d9de8");
  drawWell(ctx, W * 0.54, H * 0.56, 70, 1);
  drawWave(ctx, W * 0.82, H * 0.58, 120, 1, "#1a88d1");
  drawTap(ctx, W * 0.72, H * 0.34, 0.85, 1);
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

  if (/well|ground water|underground|spring/.test(txt)) {
    drawWell(ctx, W * 0.5, H * 0.5, 90, a);
    return;
  }

  if (/ocean|sea|marine/.test(txt)) {
    drawWave(ctx, W * 0.5, H * 0.58, 180, a, "#1f8fda");
    return;
  }

  if (/rain|precipitation|cloud/.test(txt)) {
    drawCloud(ctx, W * 0.5, H * 0.24, 1.1, a);
    for (let i = 0; i < 5; i++) {
      drawWaterDrop(ctx, W * 0.43 + i * 22, H * 0.39 + (i % 2) * 8, 10, a, "#49bfff");
    }
    return;
  }

  if (/river|stream|lake|pond|surface water/.test(txt)) {
    drawWave(ctx, W * 0.5, H * 0.58, 160, a, "#33a8ee");
    return;
  }

  drawCloud(ctx, W * 0.2, H * 0.22, 0.8, a);
  drawWave(ctx, W * 0.36, H * 0.62, 70, a, "#3caeef");
  drawWell(ctx, W * 0.58, H * 0.55, 60, a);
  drawWave(ctx, W * 0.8, H * 0.61, 92, a, "#238ed9");
}
