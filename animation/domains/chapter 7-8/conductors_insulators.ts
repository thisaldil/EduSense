/**
 * domains/conductors_insulators.ts
 */

import {
  drawBulbDark,
  drawBulbGlow,
  drawCopperCore,
  drawMaterialObject,
  drawPlasticCoating,
  drawTestCircuit,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "conductor",
  "insulator",
  "conducting materials",
  "insulating materials",
  "electric conductor",
  "copper wire",
  "plastic coating",
  "rubber",
  "wood",
  "metal conductor",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#eef4f8";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#dfe6eb";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawCopperCore(ctx, W * 0.5, H * 0.34, 1.0, 1);
  drawPlasticCoating(ctx, W * 0.5, H * 0.34, 1.0, 1);
  drawTestCircuit(ctx, W * 0.3, H * 0.62, 0.86, 1, true);
  drawBulbGlow(ctx, W * 0.42, H * 0.55, 0.76, 1);
  drawMaterialObject(ctx, W * 0.72, H * 0.58, "rubber", 0.82, 1);
  drawBulbDark(ctx, W * 0.84, H * 0.55, 0.76, 1);
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
  const conductor = /conductor|metal|copper/.test(txt);

  drawTestCircuit(ctx, W * 0.5, H * 0.58, 0.98, a, conductor);

  if (conductor) {
    drawMaterialObject(ctx, W * 0.5, H * 0.58, "metal", 0.8, a);
    drawBulbGlow(ctx, W * 0.74, H * 0.52, 0.78, a);
  } else {
    drawMaterialObject(ctx, W * 0.5, H * 0.58, "rubber", 0.8, a);
    drawBulbDark(ctx, W * 0.74, H * 0.52, 0.78, a);
  }
}
