/**
 * domains/humanBody.ts — Background and keyword fallback for human body.
 */

import { drawConceptPill } from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "heart",
  "lung",
  "blood",
  "digestive",
  "nervous system",
  "organ",
  "muscle",
  "bone",
  "cell division",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#FFEBEE");
  bg.addColorStop(1, "#FCE4EC");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(
  _ctx: Ctx,
  _W: number,
  _H: number,
  _t: number,
): void {}

export function keywordFallback(
  ctx: Ctx,
  _sceneText: string,
  elapsed: number,
  _t: number,
  W: number,
  H: number,
): void {
  const cx = W * 0.62;
  const cy = H * 0.38;
  drawConceptPill(ctx, cx, cy, fadeIn(elapsed, 300, 700));
}
