import {
  drawMetalBar,
  drawTempArrowRight,
  drawForgeGlow,
  drawHeatWaves,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "colour change due to heat",
  "heated iron turns red",
  "white hot",
  "heat affects colour",
  "iron heated colour",
  "red hot metal",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2d2d34");
  g.addColorStop(1, "#151519");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#4c342b";
  ctx.fillRect(0, H * 0.8, W, H * 0.2);

  drawForgeGlow(ctx, W * 0.18, H * 0.68, 0.9, 0.85);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawMetalBar(ctx, W * 0.22, H * 0.52, 1.0, 1, "grey");
  drawTempArrowRight(ctx, W * 0.38, H * 0.52, 1.0, 1);
  drawMetalBar(ctx, W * 0.54, H * 0.52, 1.0, 1, "orange");
  drawTempArrowRight(ctx, W * 0.7, H * 0.52, 1.0, 1);
  drawMetalBar(ctx, W * 0.84, H * 0.52, 1.0, 1, "white");
  drawHeatWaves(ctx, W * 0.84, H * 0.34, 32, 0.8, t);
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
  const a = fadeIn(elapsed, 170, 650);

  if (/red/.test(txt)) {
    drawMetalBar(ctx, W * 0.5, H * 0.56, 1.2, a, "red");
    return;
  }
  if (/orange/.test(txt)) {
    drawMetalBar(ctx, W * 0.5, H * 0.56, 1.2, a, "orange");
    return;
  }
  if (/white hot|white/.test(txt)) {
    drawMetalBar(ctx, W * 0.5, H * 0.56, 1.2, a, "white");
    drawHeatWaves(ctx, W * 0.5, H * 0.38, 36, a, t);
    return;
  }

  drawMetalBar(ctx, W * 0.22, H * 0.56, 0.95, a, "grey");
  drawTempArrowRight(ctx, W * 0.38, H * 0.56, 0.9, a);
  drawMetalBar(ctx, W * 0.54, H * 0.56, 0.95, a, "red");
  drawTempArrowRight(ctx, W * 0.7, H * 0.56, 0.9, a);
  drawMetalBar(ctx, W * 0.84, H * 0.56, 0.95, a, "white");
}