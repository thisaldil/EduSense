import {
  drawTree,
  drawShrub,
  drawCreeper,
  drawGrassClump,
  drawFlower,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "diversity of plants",
  "trees",
  "shrubs",
  "creepers",
  "flowering",
  "non-flowering",
  "habitat",
  "terrestrial",
  "aquatic",
  "mangrove",
  "plant diversity",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#d9f2ff";
  ctx.fillRect(0, 0, W, H * 0.6);
  ctx.fillStyle = "#7bc663";
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawTree(ctx, W * 0.16, H * 0.76, 1.0, 1, t);
  drawShrub(ctx, W * 0.38, H * 0.8, 1.0, 1, t);
  drawCreeper(ctx, W * 0.58, H * 0.78, 1.0, 1, t);
  drawGrassClump(ctx, W * 0.8, H * 0.83, 1.1, 1);
  drawFlower(ctx, W * 0.81, H * 0.72, 0.8, 1);
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
  drawTree(ctx, W * 0.18, H * 0.76, 0.95, a, t);
  drawShrub(ctx, W * 0.4, H * 0.8, 0.95, a, t);
  drawCreeper(ctx, W * 0.62, H * 0.78, 0.95, a, t);
  drawGrassClump(ctx, W * 0.83, H * 0.82, 1.0, a);
}
