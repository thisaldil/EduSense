/**
 * domains/magnetic_field.ts
 */

import {
  drawBarMagnet,
  drawFieldBoundary,
  drawFieldLines,
  drawIronFilingsPattern,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "magnetic field",
  "magnetic force",
  "iron filings",
  "field lines",
  "spread of magnetic force",
  "area of magnetism",
  "field pattern",
  "magnetic field lines",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  drawIronFilingsPattern(ctx, W * 0.5, H * 0.5, 1.05, 0.45);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawBarMagnet(ctx, W * 0.5, H * 0.5, 1.0, 1);
  drawFieldLines(ctx, W * 0.5, H * 0.5, 1.0, 1);
  drawFieldBoundary(ctx, W * 0.5, H * 0.5, 1.0, 0.5);
}

export function keywordFallback(
  ctx: Ctx,
  _sceneText: string,
  elapsed: number,
  _t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 150, 500);
  drawIronFilingsPattern(ctx, W * 0.5, H * 0.5, 0.98, a * 0.45);
  drawBarMagnet(ctx, W * 0.5, H * 0.5, 0.95, a);
  drawFieldLines(ctx, W * 0.5, H * 0.5, 0.95, a);
}