import {
  drawHeatArrow,
  drawExpansionBlock,
  drawRailGap,
  drawOutwardArrows,
  drawBimetalStrip,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "expansion",
  "contraction",
  "thermal expansion",
  "expansion of solids",
  "expansion of liquids",
  "expansion of gases",
  "rail gap",
  "bimetallic strip",
  "expand when heated",
  "contract when cooled",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#f4f6f8");
  g.addColorStop(1, "#e8ecef");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#b78f68";
  ctx.fillRect(0, H * 0.78, W, H * 0.22);

  drawRailGap(ctx, W * 0.76, H * 0.7, 1.0, 0.9);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  drawExpansionBlock(ctx, W * 0.26, H * 0.56, 0.85, 1, "small");
  drawHeatArrow(ctx, W * 0.44, H * 0.56, 1.0, 1);
  drawExpansionBlock(ctx, W * 0.62, H * 0.56, 1.15, 1, "large");
  drawOutwardArrows(ctx, W * 0.62, H * 0.56, 56, 1);
  drawBimetalStrip(ctx, W * 0.82, H * 0.42, 1.0, 1);
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
  const a = fadeIn(elapsed, 170, 650);

  if (/rail/.test(txt)) {
    drawRailGap(ctx, W * 0.5, H * 0.66, 1.25, a);
    return;
  }
  if (/bimetal/.test(txt)) {
    drawBimetalStrip(ctx, W * 0.5, H * 0.5, 1.2, a);
    return;
  }
  if (/contract|cool/.test(txt)) {
    drawExpansionBlock(ctx, W * 0.5, H * 0.56, 1.1, a, "large");
    drawOutwardArrows(ctx, W * 0.5, H * 0.56, 46, a * 0.25);
    return;
  }

  drawExpansionBlock(ctx, W * 0.28, H * 0.56, 0.8, a, "small");
  drawHeatArrow(ctx, W * 0.46, H * 0.56, 1.0, a);
  drawExpansionBlock(ctx, W * 0.66, H * 0.56, 1.12, a, "large");
  drawOutwardArrows(ctx, W * 0.66, H * 0.56, 48, a);
}