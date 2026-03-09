/**
 * domains/electricity.ts — Complete electrical circuit visuals for Grade 6.
 */

import {
  C,
  drawArrow,
  drawBolt,
  drawBatterySymbol,
  drawGlowingBulb,
  drawCircuitLoop,
  drawSwitch,
  drawBulbDark,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, rgba } from "../core/easing";

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
  "bulb",
  "switch",
  "wire",
  "electric",
  "insulator",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#1B2631";
  ctx.fillRect(0, 0, W, H);
  // subtle grid
  ctx.strokeStyle = rgba("#4FC3F7", 0.05);
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const cx = W * 0.5, cy = H * 0.5;
  // Draw a complete simple circuit: battery → wire → bulb → wire → back
  drawCircuitLoop(ctx, cx, cy, 0.8, 0.85);
  drawBatterySymbol(ctx, cx - 96, cy, 1, 0.9);
  drawGlowingBulb(ctx, cx + 96, cy - 12, 1.1, 0.9);
  drawSwitch(ctx, cx, cy - 56, 1, 0.9, true);
  // animated current arrows
  const flow = (t * 0.35) % 1;
  [0, 0.25, 0.5, 0.75].forEach((offset) => {
    const f = (flow + offset) % 1;
    // Top wire: left to right
    const tx = cx - 95 + f * 190;
    const a = 0.5 + Math.sin(f * Math.PI * 2) * 0.3;
    ctx.save();
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = "#FFC107";
    ctx.beginPath();
    ctx.arc(tx, cy - 56, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const txt = sceneText.toLowerCase();
  const cx = W * 0.5, cy = H * 0.5;

  if (/circuit|complete|closed/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    drawCircuitLoop(ctx, cx, cy, 0.65, a);
    drawBatterySymbol(ctx, cx - 78, cy, 1, a);
    const bulbA = fadeIn(elapsed, 700, 600);
    drawGlowingBulb(ctx, cx + 78, cy - 12, 1, bulbA);
    const flow = (elapsed * 0.001 * 0.35) % 1;
    [0, 0.33, 0.66].forEach(offset => {
      const f = (flow + offset) % 1;
      const tx = cx - 80 + f * 160;
      ctx.save();
      ctx.globalAlpha = a * (0.4 + Math.sin(f * Math.PI * 2) * 0.4);
      ctx.fillStyle = "#FFC107";
      ctx.beginPath();
      ctx.arc(tx, cy - 44, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    return;
  }

  if (/open|broken|switch off|incomplete/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    drawCircuitLoop(ctx, cx, cy, 0.65, a * 0.5);
    drawBatterySymbol(ctx, cx - 78, cy, 1, a);
    drawBulbDark(ctx, cx + 78, cy - 12, 1, a);
    drawSwitch(ctx, cx, cy - 44, 1, a, false);
    return;
  }

  if (/battery|cell|energy source/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    drawBatterySymbol(ctx, cx - 20, cy, 1.3, a);
    const pullA = fadeIn(elapsed, 700, 600);
    drawArrow(ctx, cx + 30, cy, 0, 100, "#FFC107", 4, pullA);
    drawBolt(ctx, cx + 150, cy, 28, pullA, "#FFC107");
    return;
  }

  if (/conductor|insulator|material/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    // Two objects: conductor (glowing) and insulator (dark)
    const glowA = fadeIn(elapsed, 400, 600);
    drawGlowingBulb(ctx, cx - 80, cy, 1, glowA);
    drawBulbDark(ctx, cx + 80, cy, 1, a);
    const arrowA = fadeIn(elapsed, 800, 600);
    drawArrow(ctx, cx - 120, cy, 0, 40, "#FFC107", 3, arrowA);
    ctx.save();
    ctx.globalAlpha = arrowA;
    ctx.strokeStyle = "#EF5350"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx + 60, cy - 20); ctx.lineTo(cx + 100, cy + 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 100, cy - 20); ctx.lineTo(cx + 60, cy + 20); ctx.stroke();
    ctx.restore();
    return;
  }

  // Default: animated bolt
  const a = fadeIn(elapsed, 300, 700);
  drawBolt(ctx, cx, cy - 20, 40, a, "#FFC107");
  const flow = (elapsed * 0.001 * 0.5) % 1;
  drawArrow(ctx, cx - 120, cy + 30, 0, easeOut(clamp01(elapsed / 1200)) * 240, "#4FC3F7", 3, a);
}
