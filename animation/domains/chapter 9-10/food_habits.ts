import {
  drawGrassClump,
  drawDeer,
  drawLion,
  drawCrow,
  drawArrowLine,
  drawFoodBowl,
  drawCloud,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "food habits",
  "herbivore",
  "carnivore",
  "omnivore",
  "animals eating",
  "feeding",
  "what animals eat",
  "food of animals",
  "cow",
  "lion",
  "crow",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#dff4ff";
  ctx.fillRect(0, 0, W, H * 0.6);
  ctx.fillStyle = "#7bc768";
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
  drawCloud(ctx, W * 0.18, H * 0.1, 0.9, 0.85);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawDeer(ctx, W * 0.22, H * 0.76, 0.95, 1, t);
  drawLion(ctx, W * 0.5, H * 0.76, 0.98, 1, t);
  drawCrow(ctx, W * 0.78, H * 0.46, 0.95, 1, t);

  drawGrassClump(ctx, W * 0.12, H * 0.8, 1.0, 1);
  drawFoodBowl(ctx, W * 0.8, H * 0.76, 0.8, 1);
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
  const a = fadeIn(elapsed, 170, 650);

  if (/herbivore|cow|deer|grass/.test(txt)) {
    drawGrassClump(ctx, W * 0.3, H * 0.78, 1.1, a);
    drawArrowLine(ctx, W * 0.38, H * 0.74, W * 0.52, H * 0.74, a);
    drawDeer(ctx, W * 0.64, H * 0.76, 1.0, a, t);
    return;
  }
  if (/carnivore|lion|meat/.test(txt)) {
    drawDeer(ctx, W * 0.34, H * 0.76, 0.85, a, t);
    drawArrowLine(ctx, W * 0.44, H * 0.72, W * 0.56, H * 0.72, a);
    drawLion(ctx, W * 0.68, H * 0.76, 1.0, a, t);
    return;
  }
  if (/omnivore|crow|pig/.test(txt)) {
    drawGrassClump(ctx, W * 0.28, H * 0.78, 0.9, a);
    drawFoodBowl(ctx, W * 0.5, H * 0.76, 0.75, a);
    drawCrow(ctx, W * 0.72, H * 0.5, 1.0, a, t);
    return;
  }

  drawGrassClump(ctx, W * 0.16, H * 0.8, 0.9, a);
  drawDeer(ctx, W * 0.34, H * 0.76, 0.85, a, t);
  drawLion(ctx, W * 0.58, H * 0.76, 0.9, a, t);
  drawCrow(ctx, W * 0.82, H * 0.48, 0.82, a, t);
}
