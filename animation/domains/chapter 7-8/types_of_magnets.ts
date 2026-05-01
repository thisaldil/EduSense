/**
 * domains/types_of_magnets.ts
 */

import {
  drawBarMagnet,
  drawElectromagnetCoil,
  drawHorseshoeMagnet,
  drawMagnetLabel,
  drawRingMagnet,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "types of magnets",
  "bar magnet",
  "horseshoe magnet",
  "ring magnet",
  "permanent magnet",
  "temporary magnet",
  "electromagnet",
  "different magnets",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#fbfbfb";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ececec";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 2;
  [W * 0.25, W * 0.5, W * 0.75].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, H * 0.22);
    ctx.lineTo(x, H * 0.72);
    ctx.stroke();
  });
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawBarMagnet(ctx, W * 0.18, H * 0.46, 0.9, 1);
  drawHorseshoeMagnet(ctx, W * 0.5, H * 0.46, 0.95, 1);
  drawRingMagnet(ctx, W * 0.82, H * 0.46, 0.9, 1);
  drawElectromagnetCoil(ctx, W * 0.5, H * 0.22, 0.8, 0.9);
  drawMagnetLabel(ctx, W * 0.18, H * 0.66, "BAR", 1);
  drawMagnetLabel(ctx, W * 0.5, H * 0.66, "U", 1);
  drawMagnetLabel(ctx, W * 0.82, H * 0.66, "RING", 1);
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

  if (/horseshoe/.test(txt)) {
    drawHorseshoeMagnet(ctx, W * 0.5, H * 0.45, 1.05, a);
    return;
  }

  if (/ring|disc/.test(txt)) {
    drawRingMagnet(ctx, W * 0.5, H * 0.45, 1.0, a);
    return;
  }

  if (/electromagnet|coil/.test(txt)) {
    drawElectromagnetCoil(ctx, W * 0.5, H * 0.45, 1.0, a);
    return;
  }

  drawBarMagnet(ctx, W * 0.22, H * 0.45, 0.82, a);
  drawHorseshoeMagnet(ctx, W * 0.5, H * 0.45, 0.88, a);
  drawRingMagnet(ctx, W * 0.78, H * 0.45, 0.82, a);
}
