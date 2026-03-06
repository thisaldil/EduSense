/**
 * domains/biodiversity_animals.ts — Background, anchors, and keyword fallback for Diversity of Animals.
 */

import {
  C,
  drawFish,
  drawBird,
  drawInsect,
  drawFrog,
  drawDeer,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

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
  "animal diversity",
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
  const bob = Math.sin(t * 0.08) * 5;
  drawFish(ctx, W * 0.18, H * 0.72 + bob * 0.6, 0.95, t);
  drawBird(ctx, W * 0.35, H * 0.32 + bob * 0.8, 1.0, t);
  drawInsect(ctx, W * 0.52, H * 0.68 + bob, 1.05, t);
  drawFrog(ctx, W * 0.68, H * 0.71, 0.9, t);
  drawDeer(ctx, W * 0.85, H * 0.67, 0.85, t);
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
  const positions = [0.18, 0.35, 0.52, 0.68, 0.85];
  positions.forEach((cx, i) => {
    const scale = 0.95 - i * 0.02;
    if (i === 0) drawFish(ctx, W * cx, H * 0.72, scale, t, a);
    else if (i === 1) drawBird(ctx, W * cx, H * 0.32, scale, t, a);
    else if (i === 2) drawInsect(ctx, W * cx, H * 0.68, scale, t, a);
    else if (i === 3) drawFrog(ctx, W * cx, H * 0.71, scale, t, a);
    else drawDeer(ctx, W * cx, H * 0.67, scale, t, a);
  });
}
