import {
  drawCloud,
  drawRainDrops,
  drawRainGauge,
  drawMMScale,
  drawClipboard,
  drawArrowLine,
} from "../core/shapes";
import { fadeIn, lerp, clamp01 } from "../core/easing";

type Ctx = any;

export const keywords = [
  "rain gauge",
  "measuring rainfall",
  "rainfall measurement",
  "mm rainfall",
  "meteorological department",
  "recording rainfall",
  "precipitation measurement",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  sky.addColorStop(0, "#a7dcff");
  sky.addColorStop(1, "#eef8ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.72);

  ctx.fillStyle = "#7bc56e";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawCloud(ctx, W * 0.42, H * 0.18, 1.0, 1, t);
  drawRainDrops(ctx, W * 0.42, H * 0.34, 6, 1);
  drawRainGauge(ctx, W * 0.56, H * 0.72, 1.05, 1, 0.55);
  drawMMScale(ctx, W * 0.63, H * 0.58, 1.0, 1);
  drawClipboard(ctx, W * 0.82, H * 0.62, 0.85, 1);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  _t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 160, 650);
  const txt = sceneText.toLowerCase();

  drawCloud(ctx, W * 0.28, H * 0.22, 0.95, a);
  drawArrowLine(ctx, W * 0.38, H * 0.42, W * 0.48, H * 0.52, a);

  const p = clamp01((elapsed - 400) / 1400);
  drawRainDrops(ctx, W * 0.28, H * 0.36, 5, a);
  drawRainGauge(ctx, W * 0.58, H * 0.72, 1.0, a, lerp(0.18, 0.7, p));

  if (/mm|scale|measurement/.test(txt)) {
    drawMMScale(ctx, W * 0.66, H * 0.58, 1.0, a);
  }
}