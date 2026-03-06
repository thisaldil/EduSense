/**
 * domains/microorganisms.ts — Background, anchors, and keyword fallback for Micro-organisms.
 */

import {
  C,
  drawMicroscopeSilhouette,
  drawBlobOrganism,
  drawWaterDrop,
  drawMagnifyingCircle,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "micro-organisms",
  "microorganism",
  "bacteria",
  "fungi",
  "algae",
  "microscope",
  "pond water",
  "tiny organisms",
  "yeast",
  "virus",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, W, H); // dark vignette
  ctx.fillStyle = "#1e2937";
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawWaterDrop(ctx, W * 0.5, H * 0.52, 92, 1, Math.sin(t * 0.05) * 3);
  const bob = Math.sin(t * 0.18) * 5;
  drawBlobOrganism(ctx, W * 0.38, H * 0.48 + bob, 0.75, t);
  drawBlobOrganism(ctx, W * 0.62, H * 0.55 - bob * 0.7, 0.65, t);
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
  drawWaterDrop(ctx, W * 0.5, H * 0.52, 110, a);
  drawMagnifyingCircle(ctx, W * 0.5, H * 0.52, 1.15, t, a);
  const bob = Math.sin(t * 0.2) * 4;
  drawBlobOrganism(ctx, W * 0.42, H * 0.47 + bob, 0.9, t, a);
  drawBlobOrganism(ctx, W * 0.58, H * 0.56 - bob * 0.6, 0.85, t, a);
}
