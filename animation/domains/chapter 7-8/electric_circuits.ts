/**
 * domains/electric_circuits.ts
 */

import {
  C,
  drawBatterySymbol,
  drawCircuitLoop,
  drawCurrentArrow,
  drawGlowingBulb,
  drawSwitch,
  drawWirePath,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "circuit",
  "electric circuit",
  "simple circuit",
  "series circuit",
  "parallel circuit",
  "circuit diagram",
  "wire",
  "switch",
  "bulb",
  "connection",
  "current flow",
  "circuit preparation",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0b1220");
  bg.addColorStop(1, "#152238");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(100,200,255,0.08)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, H * (0.1 + i * 0.1));
    ctx.lineTo(W, H * (0.14 + i * 0.1));
    ctx.stroke();
  }
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawCircuitLoop(ctx, W * 0.5, H * 0.5, 1.0, 0.22);
  drawBatterySymbol(ctx, W * 0.28, H * 0.52, 0.85, 1);
  drawSwitch(ctx, W * 0.5, H * 0.3, 0.82, 1, true);
  drawGlowingBulb(ctx, W * 0.72, H * 0.52, 0.84, 1);
  drawWirePath(ctx, W * 0.5, H * 0.5, 1.0, 1);
  drawCurrentArrow(ctx, W * 0.5, H * 0.7, 0.9, 1);
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
  const closed = !/open/.test(txt);

  drawBatterySymbol(ctx, W * 0.28, H * 0.52, 0.82, a);
  drawSwitch(ctx, W * 0.5, H * 0.3, 0.8, a, closed);
  drawWirePath(ctx, W * 0.5, H * 0.5, 0.95, a);
  drawGlowingBulb(ctx, W * 0.72, H * 0.52, 0.8, closed ? a : a * 0.18);

  if (/current|flow|closed loop/.test(txt)) {
    drawCurrentArrow(ctx, W * 0.5, H * 0.7, 0.85, a);
  }
}