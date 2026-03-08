import {
  drawSol,
  drawCrackedGround,
  drawDryPlant,
  drawShrinkingDrop,
  drawDownArrow,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "drought",
  "lack of rain",
  "dry weather",
  "dry period",
  "water shortage",
  "very little rainfall",
  "long dry season",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0, "#ffe59a");
  sky.addColorStop(1, "#fff5d6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.6);

  ctx.fillStyle = "#c89b61";
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
  drawCrackedGround(ctx, W * 0.5, H * 0.82, 1.2, 0.9);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSol(ctx, W * 0.2, H * 0.18, 40, t, 1);
  drawDryPlant(ctx, W * 0.42, H * 0.72, 1.0, 1);
  drawShrinkingDrop(ctx, W * 0.7, H * 0.58, 1.0, 1, t);
  drawDownArrow(ctx, W * 0.7, H * 0.38, 0.9, 1);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 180, 650);
  const txt = sceneText.toLowerCase();

  drawSol(ctx, W * 0.24, H * 0.2, 34, t, a);
  drawCrackedGround(ctx, W * 0.5, H * 0.82, 1.0, a);
  drawDryPlant(ctx, W * 0.42, H * 0.72, 0.95, a);

  if (/water shortage|lack of rain|dry/.test(txt)) {
    drawShrinkingDrop(ctx, W * 0.72, H * 0.58, 1.0, a, t);
    drawDownArrow(ctx, W * 0.72, H * 0.38, 0.85, a);
  }
}