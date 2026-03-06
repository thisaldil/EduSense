/**
 * domains/solarSystem.ts — Background and anchors for solar system.
 */

import { C, drawConceptPill, drawSol } from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "solar system",
  "planet",
  "asteroid",
  "comet",
  "galaxy",
  "star",
  "moon",
  "orbit",
  "milky way",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = C.space;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#FFF176";
  [
    [55, 38],
    [130, 85],
    [210, 28],
    [360, 65],
    [510, 42],
    [660, 78],
    [728, 22],
    [782, 108],
    [82, 195],
    [305, 175],
    [555, 158],
    [705, 198],
  ].forEach(([sx, sy]) => {
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawSol(ctx, W * 0.14, H * 0.5, 55, t, 1);
}

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
