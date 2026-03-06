/**
 * domains/biodiversity_plants.ts — Background, anchors, and keyword fallback for Diversity of Plants.
 */

import {
  C,
  drawTallTree,
  drawSmallShrub,
  drawVineCreeper,
  drawWaterLily,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

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
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.6);
  ctx.fillStyle = C.groundGrass;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const bob = Math.sin(t * 0.07) * 4;
  drawTallTree(ctx, W * 0.18, H * 0.68, 1.1, t);
  drawSmallShrub(ctx, W * 0.38, H * 0.72 + bob, 1.0, t);
  drawVineCreeper(ctx, W * 0.58, H * 0.65, 0.95, t);
  drawWaterLily(ctx, W * 0.78, H * 0.78, 0.9, t);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 200, 700);
  const positions = [0.18, 0.38, 0.58, 0.78];
  positions.forEach((cx, i) => {
    const scale = 1.05 - i * 0.08;
    const yoff = i % 2 === 0 ? -4 : 4;
    if (i === 0) drawTallTree(ctx, W * cx, H * 0.68 + yoff, scale, t, a);
    else if (i === 1) drawSmallShrub(ctx, W * cx, H * 0.72 + yoff, scale, t, a);
    else if (i === 2)
      drawVineCreeper(ctx, W * cx, H * 0.66 + yoff, scale, t, a);
    else drawWaterLily(ctx, W * cx, H * 0.78, scale, t, a);
  });
}
