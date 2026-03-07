import {
  drawGrassClump,
  drawDeer,
  drawLion,
  drawArrowLine,
  drawFoodBowl,
  drawCloud,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "heterotrophic",
  "animals cannot produce food",
  "depend on plants",
  "herbivore eating",
  "carnivore",
  "consume food",
  "nutrition in animals",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#c9efff";
  ctx.fillRect(0, 0, W, H * 0.62);
  ctx.fillStyle = "#d8c17a";
  ctx.fillRect(0, H * 0.62, W, H * 0.38);
  ctx.fillStyle = "#7bbf59";
  ctx.fillRect(0, H * 0.62, W, 18);
  drawCloud(ctx, W * 0.16, H * 0.1, 0.9, 0.9);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawGrassClump(ctx, W * 0.2, H * 0.77, 1.2, 1);
  drawDeer(ctx, W * 0.43, H * 0.76, 1.0, 1, t);
  drawLion(ctx, W * 0.72, H * 0.77, 1.05, 1, t);
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

  if (/herbivore|grass|plant/.test(txt)) {
    drawGrassClump(ctx, W * 0.28, H * 0.65, 1.2, a);
    drawArrowLine(ctx, W * 0.35, H * 0.63, W * 0.48, H * 0.63, a);
    drawDeer(ctx, W * 0.58, H * 0.7, 0.95, a, t);
    return;
  }

  if (/carnivore|lion|meat/.test(txt)) {
    drawDeer(ctx, W * 0.35, H * 0.72, 0.9, a, t);
    drawArrowLine(ctx, W * 0.43, H * 0.65, W * 0.56, H * 0.65, a);
    drawLion(ctx, W * 0.68, H * 0.73, 1.0, a, t);
    return;
  }

  if (/food bowl|pet|domestic/.test(txt)) {
    drawFoodBowl(ctx, W * 0.52, H * 0.68, 1.1, a);
    return;
  }

  drawGrassClump(ctx, W * 0.18, H * 0.7, 1.1, a);
  drawArrowLine(ctx, W * 0.26, H * 0.66, W * 0.42, H * 0.66, a);
  drawDeer(ctx, W * 0.5, H * 0.72, 0.9, a, t);
  drawArrowLine(ctx, W * 0.58, H * 0.66, W * 0.71, H * 0.66, a);
  drawLion(ctx, W * 0.8, H * 0.73, 0.95, a, t);
}