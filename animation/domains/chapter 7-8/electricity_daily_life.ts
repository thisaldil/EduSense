/**
 * domains/electricity_daily_life.ts
 */

import {
  drawBolt,
  drawFanSilhouette,
  drawGlowingBulb,
  drawHouseOutline,
  drawPowerLine,
  drawTVSilhouette,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "electricity daily life",
  "electrical appliances",
  "uses of electricity",
  "electricity for comfort",
  "household electricity",
  "power",
  "electric devices",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, "#eef5ff");
  wall.addColorStop(1, "#f8fbff");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#d9c4a5";
  ctx.fillRect(0, H * 0.74, W, H * 0.26);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawHouseOutline(ctx, W * 0.5, H * 0.46, 1.05, 1);
  drawGlowingBulb(ctx, W * 0.42, H * 0.36, 0.8, 1);
  drawTVSilhouette(ctx, W * 0.57, H * 0.47, 0.78, 1);
  drawFanSilhouette(ctx, W * 0.68, H * 0.33, 0.8, 1, t * 3.2);
  drawBolt(ctx, W * 0.24, H * 0.34, 28, 1, "#ffd34f");
  drawPowerLine(ctx, W * 0.12, H * 0.3, W * 0.34, H * 0.32, 1);
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

  drawHouseOutline(ctx, W * 0.5, H * 0.48, 1.0, a);
  drawBolt(ctx, W * 0.26, H * 0.4, 26, a, "#ffd34f");
  drawPowerLine(ctx, W * 0.3, H * 0.4, W * 0.42, H * 0.42, a);

  if (/fan/.test(txt)) {
    drawFanSilhouette(ctx, W * 0.62, H * 0.34, 0.84, a, t * 3.2);
    return;
  }
  if (/tv/.test(txt)) {
    drawTVSilhouette(ctx, W * 0.62, H * 0.48, 0.82, a);
    return;
  }

  drawGlowingBulb(ctx, W * 0.62, H * 0.38, 0.82, a);
}
