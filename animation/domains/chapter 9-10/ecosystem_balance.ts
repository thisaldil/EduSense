import {
  drawBalanceScale,
  drawPlant,
  drawRabbit,
  drawBird,
  drawFox,
  drawWebLine,
  drawBrokenScaleMark,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "ecosystem",
  "balance",
  "ecosystem balance",
  "importance of organisms",
  "food web balance",
  "interdependence",
  "species extinction",
  "habitat",
  "environment balance",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#dff6e3";
  ctx.fillRect(0, 0, W, H * 0.62);
  ctx.fillStyle = "#8aca72";
  ctx.fillRect(0, H * 0.62, W, H * 0.38);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawBalanceScale(ctx, W * 0.5, H * 0.58, 1.2, 1);
  drawPlant(ctx, W * 0.36, H * 0.58, 0.82, 1, t);
  drawRabbit(ctx, W * 0.66, H * 0.59, 0.78, 1, t);
  drawBird(ctx, W * 0.24, H * 0.34, 0.78, 1, t);
  drawFox(ctx, W * 0.78, H * 0.68, 0.82, 1, t);

  drawWebLine(ctx, W * 0.36, H * 0.56, W * 0.66, H * 0.58, 0.6);
  drawWebLine(ctx, W * 0.24, H * 0.34, W * 0.36, H * 0.56, 0.5);
  drawWebLine(ctx, W * 0.66, H * 0.58, W * 0.78, H * 0.68, 0.5);
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
  const a = fadeIn(elapsed, 180, 700);

  if (/extinction|unbalanced|broken/.test(txt)) {
    drawBalanceScale(ctx, W * 0.5, H * 0.58, 1.15, a * 0.75);
    drawBrokenScaleMark(ctx, W * 0.5, H * 0.38, 1.0, a);
    return;
  }

  drawBalanceScale(ctx, W * 0.5, H * 0.58, 1.15, a);
  drawPlant(ctx, W * 0.36, H * 0.58, 0.82, a, t);
  drawRabbit(ctx, W * 0.66, H * 0.59, 0.78, a, t);
}