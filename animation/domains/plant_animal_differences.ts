/**
 * domains/plant_animal_differences.ts — Background, anchors, and keyword fallback for Plant vs Animal Differences.
 */

import {
  C,
  drawSunny,
  drawDeer,
  drawLeafRoot,
  drawFoodBowl,
  drawArrow,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "differences between plants and animals",
  "cell wall",
  "chlorophyll",
  "autotrophic vs heterotrophic",
  "plant characteristics",
  "animal characteristics",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.6);
  ctx.fillStyle = C.groundGrass;
  ctx.fillRect(0, H * 0.6, W * 0.5, H * 0.4);
  ctx.fillStyle = C.savannaGround;
  ctx.fillRect(W * 0.5, H * 0.6, W * 0.5, H * 0.4);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(W * 0.5, H * 0.2);
  ctx.lineTo(W * 0.5, H * 0.95);
  ctx.stroke();
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawSunny(ctx, W * 0.25, H * 0.68, t, true, 1, 1);
  drawDeer(ctx, W * 0.75, H * 0.68, 1.05, t);
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
  if (/plant|chlorophyll|autotrophic/.test(txt)) {
    drawSunny(ctx, W * 0.28, H * 0.68, t, true, 1.3, a);
    drawArrow(ctx, W * 0.28, H * 0.48, W * 0.28, H * 0.65, a);
  } else {
    drawDeer(ctx, W * 0.72, H * 0.68, 1.3, t, a);
    drawFoodBowl(ctx, W * 0.78, H * 0.78, 1.1, a);
  }
}
