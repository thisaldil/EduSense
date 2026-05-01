import {
  drawClimateMap,
  drawGlobe,
  drawCalendarBar,
  drawRainBars,
  drawThermometer,
  drawMonsoonCloud,
  drawStableArrow,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "climate",
  "long term weather",
  "30 years",
  "prevailing weather",
  "climate pattern",
  "wet zone",
  "dry zone",
  "arid zone",
  "intermediate zone",
  "annual rainfall",
  "monsoon",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#daf1ff");
  g.addColorStop(1, "#f4fbff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawClimateMap(ctx, W * 0.72, H * 0.46, 1.1, 0.9);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawGlobe(ctx, W * 0.24, H * 0.44, 1.0, 1, t);
  drawCalendarBar(ctx, W * 0.24, H * 0.76, 1.0, 1, "30Y");
  drawMonsoonCloud(ctx, W * 0.68, H * 0.2, 0.95, 1, t);
  drawStableArrow(ctx, W * 0.43, H * 0.45, W * 0.58, H * 0.45, 1);
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

  if (/30 years|long term|climate/.test(txt)) {
    drawCalendarBar(ctx, W * 0.34, H * 0.58, 1.1, a, "30Y");
    drawStableArrow(ctx, W * 0.46, H * 0.58, W * 0.58, H * 0.58, a);
    drawRainBars(ctx, W * 0.72, H * 0.56, 0.9, a);
    drawThermometer(ctx, W * 0.82, H * 0.56, 0.75, a, 0.55);
    return;
  }
  if (/monsoon|wet zone|dry zone|arid/.test(txt)) {
    drawClimateMap(ctx, W * 0.54, H * 0.5, 1.2, a);
    drawMonsoonCloud(ctx, W * 0.28, H * 0.24, 0.9, a);
    return;
  }

  drawCalendarBar(ctx, W * 0.34, H * 0.58, 1.0, a, "30Y");
  drawRainBars(ctx, W * 0.64, H * 0.56, 0.85, a);
  drawThermometer(ctx, W * 0.78, H * 0.56, 0.72, a, 0.58);
}
