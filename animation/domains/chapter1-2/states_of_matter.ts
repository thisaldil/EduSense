import {
  drawSolidContainer,
  drawLiquidBeaker,
  drawGasBalloon,
  drawParticleDots,
  drawCloud,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "states of matter",
  "solid",
  "liquid",
  "gas",
  "definite shape",
  "definite volume",
  "compressible",
  "particles",
  "firewood",
  "kerosene",
  "lpg",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#dff4ff";
  ctx.fillRect(0, 0, W, H * 0.58);
  ctx.fillStyle = "#83c96c";
  ctx.fillRect(0, H * 0.58, W, H * 0.42);
  drawCloud(ctx, W * 0.82, H * 0.12, 0.8, 0.8);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  drawSolidContainer(ctx, W * 0.2, H * 0.68, 1.0, 1);
  drawParticleDots(ctx, W * 0.2, H * 0.66, "solid", 1);

  drawLiquidBeaker(ctx, W * 0.5, H * 0.72, 1.0, 1);
  drawParticleDots(ctx, W * 0.5, H * 0.68, "liquid", 1);

  drawGasBalloon(ctx, W * 0.8, H * 0.54, 1.0, 1);
  drawParticleDots(ctx, W * 0.8, H * 0.5, "gas", 1);
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
  const a = fadeIn(elapsed, 180, 650);

  if (/solid/.test(txt)) {
    drawSolidContainer(ctx, W * 0.5, H * 0.68, 1.15, a);
    drawParticleDots(ctx, W * 0.5, H * 0.66, "solid", a);
    return;
  }
  if (/liquid/.test(txt)) {
    drawLiquidBeaker(ctx, W * 0.5, H * 0.72, 1.15, a);
    drawParticleDots(ctx, W * 0.5, H * 0.68, "liquid", a);
    return;
  }
  if (/gas/.test(txt)) {
    drawGasBalloon(ctx, W * 0.5, H * 0.54, 1.15, a);
    drawParticleDots(ctx, W * 0.5, H * 0.5, "gas", a);
    return;
  }

  drawSolidContainer(ctx, W * 0.2, H * 0.68, 0.9, a);
  drawParticleDots(ctx, W * 0.2, H * 0.66, "solid", a);
  drawLiquidBeaker(ctx, W * 0.5, H * 0.72, 0.9, a);
  drawParticleDots(ctx, W * 0.5, H * 0.68, "liquid", a);
  drawGasBalloon(ctx, W * 0.8, H * 0.54, 0.9, a);
  drawParticleDots(ctx, W * 0.8, H * 0.5, "gas", a);
}
