/**
 * domains/electricity_safety.ts
 */

import {
  C,
  drawCrossedSocket,
  drawDangerWater,
  drawEnergySaverBulb,
  drawFuseSymbol,
  drawSafeTick,
  drawWarningTriangleBolt,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "electrical safety",
  "conservation of electricity",
  "accident prevention",
  "short circuit",
  "overloading",
  "fuse",
  "circuit breaker",
  "electric shock",
  "safety rules",
  "wet hands",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#fff8ef";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#f3eadf";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawWarningTriangleBolt(ctx, W * 0.22, H * 0.34, 0.95, 1);
  drawCrossedSocket(ctx, W * 0.5, H * 0.38, 0.95, 1);
  drawDangerWater(ctx, W * 0.74, H * 0.38, 0.92, 1);
  drawFuseSymbol(ctx, W * 0.34, H * 0.64, 0.82, 1);
  drawSafeTick(ctx, W * 0.56, H * 0.64, 0.85, 1);
  drawEnergySaverBulb(ctx, W * 0.78, H * 0.64, 0.82, 1);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  _t: number,
  W: number,
  H: number,
): void {
  const txt = sceneText.toLowerCase();
  const a = fadeIn(elapsed, 150, 500);

  if (/wet hands|water|shock/.test(txt)) {
    drawWarningTriangleBolt(ctx, W * 0.36, H * 0.42, 0.95, a);
    drawDangerWater(ctx, W * 0.62, H * 0.42, 0.95, a);
    return;
  }

  if (/overload|short circuit|socket/.test(txt)) {
    drawWarningTriangleBolt(ctx, W * 0.34, H * 0.42, 0.95, a);
    drawCrossedSocket(ctx, W * 0.62, H * 0.42, 0.95, a);
    return;
  }

  if (/fuse|circuit breaker/.test(txt)) {
    drawFuseSymbol(ctx, W * 0.42, H * 0.46, 0.95, a);
    drawSafeTick(ctx, W * 0.62, H * 0.46, 0.85, a);
    return;
  }

  if (/conservation|save electricity|energy saver/.test(txt)) {
    drawEnergySaverBulb(ctx, W * 0.5, H * 0.44, 1.0, a);
    drawSafeTick(ctx, W * 0.66, H * 0.44, 0.78, a);
    return;
  }

  drawWarningTriangleBolt(ctx, W * 0.36, H * 0.42, 0.95, a);
  drawCrossedSocket(ctx, W * 0.62, H * 0.42, 0.95, a);
}