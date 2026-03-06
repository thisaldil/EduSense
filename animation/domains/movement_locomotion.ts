/**
 * domains/movement_locomotion.ts — Background, anchors, and keyword fallback for Movement & Locomotion.
 */

import {
  C,
  drawBirdFlying,
  drawFishSwimming,
  drawWalkingCat,
  drawPlantBending,
  drawReactionArrow,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

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
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.65);
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, H * 0.65, W, H * 0.35);
  ctx.fillStyle = C.water;
  ctx.fillRect(W * 0.42, H * 0.72, W * 0.58, H * 0.28);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const bob = Math.sin(t * 0.09) * 4;
  drawBirdFlying(ctx, W * 0.22, H * 0.28 + bob * 0.8, 1.1, t);
  drawFishSwimming(ctx, W * 0.55, H * 0.78 + bob * 0.4, 1.05, t);
  drawWalkingCat(ctx, W * 0.82, H * 0.68 + bob, 1.0, t);
  drawPlantBending(ctx, W * 0.35, H * 0.68, 0.9, t);
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
  const a = fadeIn(elapsed, 150, 650);
  if (/flying|bird/.test(txt))
    drawBirdFlying(ctx, W * 0.3, H * 0.32, 1.4, t, a);
  else if (/swimming|fish/.test(txt))
    drawFishSwimming(ctx, W * 0.6, H * 0.78, 1.35, t, a);
  else if (/walking|cat/.test(txt))
    drawWalkingCat(ctx, W * 0.8, H * 0.68, 1.3, t, a);
  else drawPlantBending(ctx, W * 0.4, H * 0.68, 1.2, t, a);
  drawReactionArrow(ctx, W * 0.25, H * 0.45, W * 0.45, H * 0.45, a); // movement direction
}
