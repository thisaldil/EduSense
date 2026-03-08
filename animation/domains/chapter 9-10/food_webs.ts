import {
  drawPlant,
  drawRabbit,
  drawRat,
  drawOwl,
  drawFox,
  drawLeopard,
  drawWebArrow,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "food web",
  "food web diagram",
  "interrelated food chains",
  "web of feeding",
  "network of organisms",
  "ecosystem feeding",
  "food web in forest",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#d7f0ff";
  ctx.fillRect(0, 0, W, H * 0.56);
  ctx.fillStyle = "#6ebc5d";
  ctx.fillRect(0, H * 0.56, W, H * 0.44);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawPlant(ctx, W * 0.5, H * 0.8, 1.0, 1, t);
  drawRabbit(ctx, W * 0.28, H * 0.62, 0.85, 1, t);
  drawRat(ctx, W * 0.44, H * 0.56, 0.82, 1, t);
  drawOwl(ctx, W * 0.58, H * 0.28, 0.85, 1, t);
  drawFox(ctx, W * 0.72, H * 0.64, 0.9, 1, t);
  drawLeopard(ctx, W * 0.84, H * 0.42, 0.9, 1, t);

  drawWebArrow(ctx, W * 0.5, H * 0.74, W * 0.32, H * 0.64, 1);
  drawWebArrow(ctx, W * 0.5, H * 0.74, W * 0.46, H * 0.6, 1);
  drawWebArrow(ctx, W * 0.32, H * 0.58, W * 0.58, H * 0.34, 1);
  drawWebArrow(ctx, W * 0.46, H * 0.54, W * 0.72, H * 0.66, 1);
  drawWebArrow(ctx, W * 0.72, H * 0.58, W * 0.82, H * 0.46, 1);
}

export function keywordFallback(
  ctx: Ctx,
  _sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 180, 700);

  drawPlant(ctx, W * 0.5, H * 0.78, 1.0, a, t);
  drawRabbit(ctx, W * 0.28, H * 0.62, 0.82, a, t);
  drawRat(ctx, W * 0.46, H * 0.58, 0.78, a, t);
  drawFox(ctx, W * 0.72, H * 0.64, 0.84, a, t);
  drawOwl(ctx, W * 0.6, H * 0.32, 0.78, a, t);

  drawWebArrow(ctx, W * 0.5, H * 0.72, W * 0.32, H * 0.64, a);
  drawWebArrow(ctx, W * 0.5, H * 0.72, W * 0.46, H * 0.6, a);
  drawWebArrow(ctx, W * 0.32, H * 0.58, W * 0.6, H * 0.36, a);
  drawWebArrow(ctx, W * 0.46, H * 0.56, W * 0.72, H * 0.64, a);
}