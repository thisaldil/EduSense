/**
 * domains/energy_forms_transfer.ts
 */

import {
  drawBolt,
  drawCycleArrow,
  drawFlame,
  drawRaisedWeight,
  drawSol,
  drawSoundWave,
  drawWheel,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "kinetic energy",
  "potential energy",
  "heat energy",
  "light energy",
  "sound energy",
  "electrical energy",
  "chemical energy",
  "energy transfer",
  "energy conversion",
  "energy transformation",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#f8fbff";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#d8e7f5";
  ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo((W / 5) * i, H * 0.14);
    ctx.lineTo((W / 5) * i, H * 0.86);
    ctx.stroke();
  }
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawBolt(ctx, W * 0.5, H * 0.5, 28, 1, "#ffd54c");
  drawCycleArrow(ctx, W * 0.5, H * 0.5, 124, 0.9, t * 0.8);

  drawSol(ctx, W * 0.24, H * 0.28, 28, t, 1);
  drawFlame(ctx, W * 0.76, H * 0.28, 0.9, 1);
  drawSoundWave(ctx, W * 0.24, H * 0.7, 1, 1);
  drawWheel(ctx, W * 0.76, H * 0.7, 0.88, 1, t * 2.2);
  drawRaisedWeight(ctx, W * 0.5, H * 0.18, 0.82, 1);
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
  const a = fadeIn(elapsed, 150, 500);

  if (/light/.test(txt)) {
    drawSol(ctx, W * 0.5, H * 0.36, 36, t, a);
    return;
  }

  if (/heat/.test(txt)) {
    drawFlame(ctx, W * 0.5, H * 0.42, 1.0, a);
    return;
  }

  if (/sound/.test(txt)) {
    drawSoundWave(ctx, W * 0.5, H * 0.44, 1.2, a);
    return;
  }

  if (/kinetic/.test(txt)) {
    drawWheel(ctx, W * 0.5, H * 0.48, 1.0, a, t * 2.4);
    return;
  }

  if (/potential/.test(txt)) {
    drawRaisedWeight(ctx, W * 0.5, H * 0.4, 1.0, a);
    return;
  }

  if (/electrical|bolt/.test(txt)) {
    drawBolt(ctx, W * 0.5, H * 0.42, 32, a, "#ffd54c");
    return;
  }

  drawBolt(ctx, W * 0.5, H * 0.42, 28, a, "#ffd54c");
  drawCycleArrow(ctx, W * 0.5, H * 0.42, 104, a, t * 0.8);
}
