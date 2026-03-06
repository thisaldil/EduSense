/**
 * domains/waterCycle.ts — Background, anchors, and keyword fallback for water cycle.
 */

import { C, drawCloud, drawSol, drawWaterDrop } from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "water cycle",
  "evaporation",
  "condensation",
  "precipitation",
  "transpiration",
  "runoff",
  "water vapor",
  "cloud formation",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sk.addColorStop(0, "#90CAF9");
  sk.addColorStop(1, "#BBDEFB");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.55);
  const oc = ctx.createLinearGradient(0, H * 0.55, 0, H);
  oc.addColorStop(0, "#1565C0");
  oc.addColorStop(1, "#0D47A1");
  ctx.fillStyle = oc;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, H * 0.53, W, H * 0.035);
  ctx.fillStyle = "#F9A825";
  ctx.fillRect(0, H * 0.53, W, 10);
  drawCloud(ctx, W * 0.2, H * 0.12, 1.2);
  drawCloud(ctx, W * 0.62, H * 0.08, 1.0);
  drawCloud(ctx, W * 0.86, H * 0.16, 0.8);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawSol(ctx, W * 0.84, H * 0.11, 44, t, 0.88);
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
  const cx = W * 0.62;
  const cy = H * 0.38;

  if (/evapor|heat|sun/.test(txt)) {
    [0, 280, 560].forEach((d, i) => {
      const rise = easeOut(clamp01((elapsed - d) / 2000));
      drawWaterDrop(
        ctx,
        W * 0.35 + i * 30,
        lerp(H * 0.5, H * 0.18, rise),
        14,
        fadeIn(elapsed, d, 400),
      );
    });
    return;
  }
  if (/cloud|condense|vapor/.test(txt)) {
    const a = fadeIn(elapsed, 200, 800);
    drawCloud(ctx, W * 0.42, H * 0.14, 1.2, a * 0.9);
    drawCloud(ctx, W * 0.58, H * 0.1, 0.9, a * 0.8);
    return;
  }
  if (/rain|precipit|fall/.test(txt)) {
    [280, 320, 360, 410, 450].forEach((rx, i) => {
      const fall = easeOut(clamp01((elapsed - i * 180) / 1800));
      const ry = lerp(H * 0.22, H * 0.54, fall);
      const a = fadeIn(elapsed, i * 180, 400);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = "#42A5F5";
      ctx.beginPath();
      ctx.moveTo(rx, ry - 10);
      ctx.lineTo(rx + 4, ry + 5);
      ctx.lineTo(rx - 4, ry + 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    return;
  }
  const a = fadeIn(elapsed, 400, 700);
  drawWaterDrop(ctx, cx, cy, 22, a);
}
