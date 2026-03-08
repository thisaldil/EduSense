import {
  C,
  drawCloud,
  drawSeed,
  drawSeedling,
  drawPlant,
  drawTimeArrow,
  drawRulerArrow,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "growth",
  "increase in size",
  "height",
  "germination",
  "seed",
  "sapling",
  "baby",
  "child grows",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.64);
  g.addColorStop(0, "#aee1ff");
  g.addColorStop(1, "#eaf9ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H * 0.64);

  ctx.fillStyle = "#6b4f35";
  ctx.fillRect(0, H * 0.64, W, H * 0.36);
  ctx.fillStyle = "#68b85d";
  ctx.fillRect(0, H * 0.64, W, 18);

  drawCloud(ctx, W * 0.15, H * 0.09, 0.9, 0.85);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSeed(ctx, W * 0.2, H * 0.78, 20, 1);
  drawSeedling(ctx, W * 0.48, H * 0.74, 0.95, 1, t);
  drawPlant(ctx, W * 0.78, H * 0.75, 1.2, 1, t);

  drawTimeArrow(ctx, W * 0.28, H * 0.72, W * 0.4, H * 0.72, 1);
  drawTimeArrow(ctx, W * 0.57, H * 0.72, W * 0.69, H * 0.72, 1);
}

export function keywordFallback(
  ctx: Ctx,
  _sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 220, 700);
  drawSeed(ctx, W * 0.22, H * 0.62, 18, a);
  drawSeedling(ctx, W * 0.5, H * 0.64, 0.9, a, t);
  drawPlant(ctx, W * 0.78, H * 0.66, 1.1, a, t);
  drawTimeArrow(ctx, W * 0.28, H * 0.62, W * 0.43, H * 0.62, a);
  drawTimeArrow(ctx, W * 0.57, H * 0.62, W * 0.71, H * 0.62, a);
  drawRulerArrow(ctx, W * 0.9, H * 0.76, 90, a, C.arrowDef);
}