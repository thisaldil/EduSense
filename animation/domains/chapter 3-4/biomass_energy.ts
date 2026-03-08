/**
 * domains/biomass_energy.ts
 */

import {
  drawBiomassLog,
  drawBolt,
  drawCoalLump,
  drawFlame,
  drawSmoke,
  drawSugarcane,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "biomass",
  "firewood",
  "coal",
  "sugarcane",
  "organic matter",
  "waste matter",
  "biomass energy",
  "burning wood",
  "charcoal",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#fff6ea";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#f0d6b5";
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  ctx.fillStyle = "#c59058";
  ctx.fillRect(W * 0.18, H * 0.5, W * 0.28, H * 0.18);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawBiomassLog(ctx, W * 0.34, H * 0.56, 1.0, 1);
  drawFlame(ctx, W * 0.36, H * 0.46, 1.0 + Math.sin(t * 4) * 0.04, 1);
  drawSmoke(ctx, W * 0.38, H * 0.28, 1, 0.75);
  drawBolt(ctx, W * 0.62, H * 0.45, 24, 1, "#ffc548");
  drawSugarcane(ctx, W * 0.78, H * 0.56, 0.9, 1);
  drawCoalLump(ctx, W * 0.64, H * 0.64, 0.75, 1);
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

  if (/sugarcane/.test(txt)) {
    drawSugarcane(ctx, W * 0.5, H * 0.56, 1.0, a);
    return;
  }

  if (/coal|charcoal/.test(txt)) {
    drawCoalLump(ctx, W * 0.46, H * 0.56, 1.0, a);
    drawFlame(ctx, W * 0.58, H * 0.44, 1.0 + Math.sin(t * 4) * 0.04, a);
    return;
  }

  drawBiomassLog(ctx, W * 0.38, H * 0.58, 0.95, a);
  drawFlame(ctx, W * 0.43, H * 0.46, 1.0 + Math.sin(t * 4) * 0.04, a);
  drawBolt(ctx, W * 0.68, H * 0.46, 24, a, "#ffc548");
}