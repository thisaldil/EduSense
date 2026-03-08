import {
  drawHammer,
  drawDiamond,
  drawWireStretch,
  drawMetalSheet,
  drawSpring,
  drawBrokenPiece,
  drawSurfacePatch,
  drawArrowLine,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "hardness",
  "ductility",
  "malleability",
  "elasticity",
  "brittleness",
  "texture",
  "rough",
  "smooth",
  "properties of solids",
  "solid properties",
  "conductor of heat",
  "insulator of heat",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#f7fafc");
  g.addColorStop(1, "#eceff3");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#c89b6d";
  ctx.fillRect(0.08 * W, H * 0.7, W * 0.84, H * 0.18);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawHammer(ctx, W * 0.18, H * 0.56, 1.0, 1, t);
  drawDiamond(ctx, W * 0.36, H * 0.54, 1.0, 1);
  drawWireStretch(ctx, W * 0.56, H * 0.54, 1.0, 1, t);
  drawSpring(ctx, W * 0.76, H * 0.55, 1.0, 1, t);
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
  const a = fadeIn(elapsed, 180, 650);

  if (/hard/.test(txt)) {
    drawHammer(ctx, W * 0.36, H * 0.56, 1.0, a, t);
    drawArrowLine(ctx, W * 0.42, H * 0.56, W * 0.52, H * 0.56, a);
    drawDiamond(ctx, W * 0.62, H * 0.56, 1.0, a);
    return;
  }
  if (/ductil/.test(txt)) {
    drawWireStretch(ctx, W * 0.5, H * 0.56, 1.15, a, t);
    return;
  }
  if (/malleab/.test(txt)) {
    drawMetalSheet(ctx, W * 0.5, H * 0.58, 1.2, a);
    return;
  }
  if (/elastic/.test(txt)) {
    drawSpring(ctx, W * 0.5, H * 0.58, 1.15, a, t);
    return;
  }
  if (/brittle|break/.test(txt)) {
    drawBrokenPiece(ctx, W * 0.5, H * 0.58, 1.15, a);
    return;
  }
  if (/rough|smooth|texture/.test(txt)) {
    drawSurfacePatch(ctx, W * 0.38, H * 0.58, "rough", a);
    drawSurfacePatch(ctx, W * 0.64, H * 0.58, "smooth", a);
    return;
  }

  drawWireStretch(ctx, W * 0.34, H * 0.56, 0.95, a, t);
  drawArrowLine(ctx, W * 0.44, H * 0.56, W * 0.54, H * 0.56, a);
  drawSpring(ctx, W * 0.68, H * 0.56, 0.95, a, t);
}