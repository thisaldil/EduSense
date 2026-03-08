import {
  drawFish,
  drawBird,
  drawButterfly,
  drawFrog,
  drawDeer,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "diversity of animals",
  "vertebrate",
  "invertebrate",
  "mammal",
  "bird",
  "fish",
  "reptile",
  "amphibian",
  "insect",
  "classification",
  "dichotomous key",
  "animal diversity",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#d8efff";
  ctx.fillRect(0, 0, W, H * 0.55);
  ctx.fillStyle = "#78c46b";
  ctx.fillRect(0, H * 0.55, W, H * 0.45);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawFish(ctx, W * 0.14, H * 0.72, 0.9, 1, t);
  drawBird(ctx, W * 0.32, H * 0.27, 0.9, 1, t);
  drawButterfly(ctx, W * 0.5, H * 0.38, 0.9, 1, t);
  drawFrog(ctx, W * 0.68, H * 0.78, 0.9, 1, t);
  drawDeer(ctx, W * 0.86, H * 0.78, 0.85, 1, t);
}

export function keywordFallback(
  ctx: Ctx,
  _sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 180, 650);
  drawFish(ctx, W * 0.16, H * 0.62, 0.82, a, t);
  drawBird(ctx, W * 0.34, H * 0.54, 0.82, a, t);
  drawButterfly(ctx, W * 0.5, H * 0.56, 0.82, a, t);
  drawFrog(ctx, W * 0.66, H * 0.64, 0.82, a, t);
  drawDeer(ctx, W * 0.84, H * 0.64, 0.8, a, t);
}