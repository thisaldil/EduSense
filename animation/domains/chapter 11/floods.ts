import {
  drawRainCloud,
  drawRiverBank,
  drawFloodHouse,
  drawWaterWave,
  drawOverflowArrow,
  drawWarningTriangle,
} from "../core/shapes";
import { fadeIn, clamp01, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "flood",
  "heavy rain",
  "overflow",
  "river overflow",
  "flood disaster",
  "flood cause",
  "land covered with water",
  "flooding",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.58);
  sky.addColorStop(0, "#8f9db2");
  sky.addColorStop(1, "#dfe8f2");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.58);

  ctx.fillStyle = "#7b9b68";
  ctx.fillRect(0, H * 0.58, W, H * 0.42);

  drawRiverBank(ctx, W * 0.5, H * 0.76, 1.2, 0.9);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawRainCloud(ctx, W * 0.34, H * 0.18, 1.0, 1, t);
  drawRainCloud(ctx, W * 0.56, H * 0.16, 1.1, 1, t);
  drawFloodHouse(ctx, W * 0.76, H * 0.64, 1.0, 1);
  drawWaterWave(ctx, W * 0.54, H * 0.8, 1.2, 1, t);
  drawOverflowArrow(ctx, W * 0.54, H * 0.62, 1.0, 1);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 170, 700);
  const p = clamp01((elapsed - 300) / 1500);
  const txt = sceneText.toLowerCase();

  drawRainCloud(ctx, W * 0.32, H * 0.2, 1.0, a, t);
  drawFloodHouse(ctx, W * 0.72, H * 0.62, 1.0, a);
  drawWaterWave(ctx, W * 0.54, lerp(H * 0.86, H * 0.72, p), 1.1, a, t);

  if (/overflow|river/.test(txt)) {
    drawOverflowArrow(ctx, W * 0.52, H * 0.62, 1.0, a);
  }
  if (/disaster|warning/.test(txt)) {
    drawWarningTriangle(ctx, W * 0.18, H * 0.72, 0.8, a);
  }
}