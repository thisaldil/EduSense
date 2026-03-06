/**
 * domains/electricity.ts — Background and keyword fallback for electricity.
 */

import { C, drawConceptPill } from "../core/shapes";
import { fadeIn } from "../core/easing";
import { rgba } from "../core/easing";

type Ctx = any;

export const keywords = [
  "electricity",
  "circuit",
  "current",
  "voltage",
  "resistor",
  "conductor",
  "electron flow",
  "battery",
  "charge",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#1B2631";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = rgba("#FFC107", 0.07);
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
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
