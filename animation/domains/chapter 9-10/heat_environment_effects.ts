import {
  drawEarthGlobe,
  drawSunRays,
  drawHeatLayerArc,
  drawTempArrowUp,
  drawOceanWave,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "heat effects on environment",
  "ocean temperature",
  "sea currents",
  "tsunami",
  "global warming",
  "greenhouse effect",
  "temperature of sea water",
  "climate and heat",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#dff2ff");
  g.addColorStop(1, "#9fc6ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawEarthGlobe(ctx, W * 0.5, H * 0.54, 1.05, 1, t);
  drawHeatLayerArc(ctx, W * 0.5, H * 0.37, 120, 1);
  drawTempArrowUp(ctx, W * 0.74, H * 0.62, 1.0, 1);
  drawSunRays(ctx, W * 0.18, H * 0.18, W * 0.42, H * 0.38, 1);
  drawOceanWave(ctx, W * 0.5, H * 0.8, 1.2, 0.7, t);
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
  const a = fadeIn(elapsed, 180, 700);

  if (/global warming|greenhouse/.test(txt)) {
    drawSunRays(ctx, W * 0.22, H * 0.18, W * 0.44, H * 0.38, a);
    drawEarthGlobe(ctx, W * 0.58, H * 0.56, 1.0, a, t);
    drawHeatLayerArc(ctx, W * 0.58, H * 0.38, 110, a);
    drawTempArrowUp(ctx, W * 0.76, H * 0.64, 1.0, a);
    return;
  }
  if (/ocean|sea currents|tsunami/.test(txt)) {
    drawEarthGlobe(ctx, W * 0.42, H * 0.52, 0.9, a, t);
    drawOceanWave(ctx, W * 0.72, H * 0.74, 1.2, a, t);
    return;
  }

  drawSunRays(ctx, W * 0.22, H * 0.18, W * 0.44, H * 0.38, a);
  drawEarthGlobe(ctx, W * 0.58, H * 0.56, 1.0, a, t);
  drawTempArrowUp(ctx, W * 0.76, H * 0.64, 1.0, a);
}
