import {
  drawBird,
  drawFish,
  drawCat,
  drawSeedling,
  drawMovementArrow,
  drawCloud,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "movement",
  "locomotion",
  "walking",
  "swimming",
  "flying",
  "creeping",
  "movement in animals",
  "movement in plants",
  "bending towards light",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#cfeeff";
  ctx.fillRect(0, 0, W, H * 0.55);
  ctx.fillStyle = "#69bce8";
  ctx.fillRect(0, H * 0.55, W, H * 0.12);
  ctx.fillStyle = "#83c765";
  ctx.fillRect(0, H * 0.67, W, H * 0.33);
  drawCloud(ctx, W * 0.2, H * 0.1, 0.9, 0.85);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawBird(ctx, W * 0.22, H * 0.24, 1.0, 1, t);
  drawFish(ctx, W * 0.5, H * 0.58, 1.0, 1, t);
  drawCat(ctx, W * 0.8, H * 0.78, 1.0, 1, t);
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
  const a = fadeIn(elapsed, 200, 600);

  if (/fly|bird|wing/.test(txt)) {
    drawBird(ctx, W * 0.48, H * 0.34, 1.1, a, t);
    drawMovementArrow(ctx, W * 0.35, H * 0.34, W * 0.62, H * 0.34, a);
    return;
  }
  if (/swim|fish|water/.test(txt)) {
    drawFish(ctx, W * 0.5, H * 0.62, 1.1, a, t);
    drawMovementArrow(ctx, W * 0.34, H * 0.62, W * 0.66, H * 0.62, a);
    return;
  }
  if (/plant|bend|light/.test(txt)) {
    drawSeedling(ctx, W * 0.42, H * 0.72, 1.0, a, t);
    drawMovementArrow(ctx, W * 0.49, H * 0.5, W * 0.64, H * 0.42, a);
    return;
  }

  drawCat(ctx, W * 0.5, H * 0.74, 1.0, a, t);
  drawMovementArrow(ctx, W * 0.35, H * 0.72, W * 0.65, H * 0.72, a);
}
