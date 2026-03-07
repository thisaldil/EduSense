import {
  C,
  drawLightRay,
  drawMaterialBlock,
  drawShadowPatch,
  drawLabelChip,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "transparent",
  "translucent",
  "opaque",
  "transmission of light",
  "shadow",
  "light passing through",
  "glass",
  "cardboard",
  "tissue",
  "opaque object",
  "see through",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#eef6ff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#d8e0ea";
  ctx.fillRect(0, H * 0.78, W, H * 0.22);

  ctx.fillStyle = "#cfe6ff";
  ctx.fillRect(0.04 * W, 0.08 * H, 0.92 * W, 0.22 * H);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  drawLightRay(ctx, W * 0.08, H * 0.42, W * 0.26, H * 0.42, 1, "#ffd95b");
  drawMaterialBlock(ctx, W * 0.34, H * 0.45, 1.0, 1, "transparent");
  drawMaterialBlock(ctx, W * 0.54, H * 0.45, 1.0, 1, "translucent");
  drawMaterialBlock(ctx, W * 0.74, H * 0.45, 1.0, 1, "opaque");

  drawLightRay(ctx, W * 0.39, H * 0.42, W * 0.47, H * 0.42, 0.9, "#ffd95b");
  drawLightRay(ctx, W * 0.59, H * 0.42, W * 0.66, H * 0.39, 0.4, "#ffd95b");
  drawLightRay(ctx, W * 0.59, H * 0.42, W * 0.66, H * 0.45, 0.35, "#ffd95b");
  drawShadowPatch(ctx, W * 0.83, H * 0.52, 1.0, 0.7);

  drawLabelChip(ctx, W * 0.34, H * 0.64, "Transparent", 1);
  drawLabelChip(ctx, W * 0.54, H * 0.64, "Translucent", 1);
  drawLabelChip(ctx, W * 0.74, H * 0.64, "Opaque", 1);
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
  const a = fadeIn(elapsed, 180, 700);

  if (/transparent|glass|see through/.test(txt)) {
    drawLightRay(ctx, W * 0.18, H * 0.5, W * 0.38, H * 0.5, a, "#ffd95b");
    drawMaterialBlock(ctx, W * 0.5, H * 0.52, 1.15, a, "transparent");
    drawLightRay(ctx, W * 0.57, H * 0.5, W * 0.78, H * 0.5, a, "#ffd95b");
    return;
  }
  if (/translucent|tissue/.test(txt)) {
    drawLightRay(ctx, W * 0.18, H * 0.5, W * 0.38, H * 0.5, a, "#ffd95b");
    drawMaterialBlock(ctx, W * 0.5, H * 0.52, 1.15, a, "translucent");
    drawLightRay(ctx, W * 0.57, H * 0.48, W * 0.76, H * 0.44, a * 0.45, "#ffd95b");
    drawLightRay(ctx, W * 0.57, H * 0.52, W * 0.76, H * 0.56, a * 0.45, "#ffd95b");
    return;
  }
  if (/opaque|shadow|cardboard/.test(txt)) {
    drawLightRay(ctx, W * 0.18, H * 0.5, W * 0.38, H * 0.5, a, "#ffd95b");
    drawMaterialBlock(ctx, W * 0.5, H * 0.52, 1.15, a, "opaque");
    drawShadowPatch(ctx, W * 0.72, H * 0.54, 1.2, a);
    return;
  }

  drawLightRay(ctx, W * 0.2, H * 0.5, W * 0.38, H * 0.5, a, "#ffd95b");
  drawMaterialBlock(ctx, W * 0.5, H * 0.52, 1.0, a, "transparent");
  drawLightRay(ctx, W * 0.57, H * 0.5, W * 0.77, H * 0.5, a, "#ffd95b");
}