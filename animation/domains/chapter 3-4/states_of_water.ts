/**
 * domains/states_of_water.ts
 */

import {
  C,
  drawIceCrystal,
  drawSteamPuff,
  drawThermometer,
  drawWaterDrop,
} from "../../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "states of water",
  "ice",
  "liquid water",
  "water vapour",
  "steam",
  "glaciers",
  "solid water",
  "freezing",
  "melting",
  "boiling",
  "evaporation",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  sky.addColorStop(0, "#cfeeff");
  sky.addColorStop(1, "#eefaff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#dff6ff";
  ctx.fillRect(0, H * 0.62, W * 0.33, H * 0.38);

  ctx.fillStyle = "#6dc7f2";
  ctx.fillRect(W * 0.33, H * 0.62, W * 0.34, H * 0.38);

  ctx.fillStyle = "#ececec";
  ctx.fillRect(W * 0.67, H * 0.62, W * 0.33, H * 0.38);

  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const x = W * 0.05 + i * (W * 0.04);
    ctx.beginPath();
    ctx.moveTo(x, H * 0.7);
    ctx.lineTo(x + 18, H * 0.84);
    ctx.stroke();
  }
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawIceCrystal(ctx, W * 0.18, H * 0.42, 42, 1);
  drawWaterDrop(ctx, W * 0.5, H * 0.42, 28, 1, "#42b8ff");
  drawSteamPuff(ctx, W * 0.82, H * 0.38, 1.1 + Math.sin(t * 1.3) * 0.04, 1);
  drawThermometer(ctx, W * 0.5, H * 0.18, 68, 1, 0.55 + Math.sin(t) * 0.1);
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
  const y = H * 0.42;

  if (/freez|ice|solid water|glacier/.test(txt)) {
    drawIceCrystal(ctx, W * 0.5, y, 52, fadeIn(elapsed, 150, 500));
    return;
  }

  if (/boil|steam|vapou?r|evapor/.test(txt)) {
    const a = fadeIn(elapsed, 150, 500);
    drawWaterDrop(ctx, W * 0.42, H * 0.56, 18, a, "#4abfff");
    const rise = easeOut(clamp01((elapsed - 400) / 1400));
    drawSteamPuff(ctx, W * 0.58, lerp(H * 0.58, H * 0.34, rise), 1, a);
    return;
  }

  if (/melt|liquid water/.test(txt)) {
    const a = fadeIn(elapsed, 150, 500);
    drawIceCrystal(ctx, W * 0.36, y, 34, a);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = C.arrowDef;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.43, y);
    ctx.lineTo(W * 0.57, y);
    ctx.stroke();
    ctx.restore();
    drawWaterDrop(ctx, W * 0.66, y, 22, a, "#42b8ff");
    return;
  }

  const a = fadeIn(elapsed, 150, 500);
  drawIceCrystal(ctx, W * 0.26, y, 34, a);
  drawWaterDrop(ctx, W * 0.5, y, 22, a, "#42b8ff");
  drawSteamPuff(ctx, W * 0.74, y - 12, 1, a);

  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = C.arrowDef;
  ctx.lineWidth = 3;
  [W * 0.35, W * 0.59].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10, y);
    ctx.stroke();
  });
  ctx.restore();
}
