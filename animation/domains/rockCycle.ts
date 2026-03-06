/**
 * domains/rockCycle.ts — Background and anchors for rock cycle.
 */

import { C, drawConceptPill } from "../core/shapes";
import { fadeIn } from "../core/easing";
import { rgba } from "../core/easing";

type Ctx = any;

export const keywords = [
  "rock cycle",
  "igneous",
  "sedimentary",
  "metamorphic",
  "magma",
  "erosion",
  "sediment",
  "mineral",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.44);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.44);
  ctx.fillStyle = "#A1887F";
  ctx.fillRect(0, H * 0.44, W, H * 0.18);
  ctx.fillStyle = "#795548";
  ctx.fillRect(0, H * 0.62, W, H * 0.18);
  ctx.fillStyle = "#4E342E";
  ctx.fillRect(0, H * 0.8, W, H * 0.11);
  ctx.fillStyle = C.lava;
  ctx.fillRect(0, H * 0.91, W, H * 0.09);
  [H * 0.44, H * 0.62, H * 0.8, H * 0.91].forEach((ly) => {
    ctx.strokeStyle = rgba("#000000", 0.08);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.lineTo(W, ly);
    ctx.stroke();
  });
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
