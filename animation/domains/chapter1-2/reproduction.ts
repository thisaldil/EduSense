import {
  drawPlant,
  drawSeedling,
  drawSeed,
  drawEgg,
  drawArrowLine,
  drawCloud,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "reproduction",
  "offspring",
  "new organism",
  "seed",
  "egg",
  "budding",
  "vegetative reproduction",
  "asexual",
  "sexual reproduction",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#d9f2ff";
  ctx.fillRect(0, 0, W, H * 0.62);
  ctx.fillStyle = "#76c45f";
  ctx.fillRect(0, H * 0.62, W, H * 0.38);
  drawCloud(ctx, W * 0.16, H * 0.1, 0.8, 0.85);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawPlant(ctx, W * 0.35, H * 0.76, 1.15, 1, t);
  drawSeedling(ctx, W * 0.62, H * 0.79, 0.8, 1, t);
  drawSeedling(ctx, W * 0.74, H * 0.81, 0.65, 1, t);
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
  const a = fadeIn(elapsed, 200, 700);

  if (/seed/.test(txt)) {
    drawSeed(ctx, W * 0.38, H * 0.6, 18, a);
    drawArrowLine(ctx, W * 0.44, H * 0.6, W * 0.56, H * 0.6, a);
    drawSeedling(ctx, W * 0.64, H * 0.68, 0.9, a, t);
    return;
  }

  if (/egg/.test(txt)) {
    drawEgg(ctx, W * 0.4, H * 0.62, 1.1, a);
    drawArrowLine(ctx, W * 0.47, H * 0.62, W * 0.58, H * 0.62, a);
    drawSeedling(ctx, W * 0.66, H * 0.68, 0.8, a, t);
    return;
  }

  drawPlant(ctx, W * 0.35, H * 0.74, 1.0, a, t);
  drawArrowLine(ctx, W * 0.45, H * 0.66, W * 0.58, H * 0.66, a);
  drawSeedling(ctx, W * 0.68, H * 0.74, 0.8, a, t);
}
