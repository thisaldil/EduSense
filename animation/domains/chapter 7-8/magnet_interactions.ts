/**
 * domains/magnet_interactions.ts
 */

import {
  C,
  drawAttractArrows,
  drawBarMagnet,
  drawForceArc,
  drawRepelArrows,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "attract",
  "repel",
  "like poles repel",
  "unlike poles attract",
  "north north repel",
  "south south repel",
  "north south attract",
  "magnetic interaction",
  "pole interaction",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const attractMode = Math.sin(t * 0.7) > 0;
  drawBarMagnet(ctx, W * 0.34, H * 0.48, 0.95, 1, 0, attractMode ? "N" : "N");
  drawBarMagnet(ctx, W * 0.66, H * 0.48, 0.95, 1, 0, attractMode ? "S" : "N");

  if (attractMode) {
    drawAttractArrows(ctx, W * 0.5, H * 0.48, 1);
  } else {
    drawRepelArrows(ctx, W * 0.5, H * 0.48, 1);
  }
  drawForceArc(ctx, W * 0.5, H * 0.34, 0.95, 0.7);
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
  const repel = /repel|north north|south south|like poles/.test(txt);

  drawBarMagnet(ctx, W * 0.34, H * 0.48, 0.92, a, 0, "N");
  drawBarMagnet(ctx, W * 0.66, H * 0.48, 0.92, a, 0, repel ? "N" : "S");

  if (repel) {
    drawRepelArrows(ctx, W * 0.5, H * 0.48, a);
  } else {
    drawAttractArrows(ctx, W * 0.5, H * 0.48, a);
  }
}