import {
  C,
  drawThermometer,
  drawFlame,
  drawHeatWaves,
  drawSol,
  drawCloud,
  drawLabelChip,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "heat",
  "temperature",
  "thermometer",
  "celsius",
  "fahrenheit",
  "warmth",
  "body temperature",
  "heat and temperature",
  "measuring temperature",
  "37 degrees",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fff4da");
  g.addColorStop(1, "#ffd29c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#8e5c3a";
  ctx.fillRect(0, H * 0.78, W, H * 0.22);

  drawCloud(ctx, W * 0.15, H * 0.1, 0.8, 0.45);
  drawSol(ctx, W * 0.84, H * 0.16, 34, 0, 0.85);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  const temp = 0.55 + Math.sin(t * 1.2) * 0.08;
  drawThermometer(ctx, W * 0.52, H * 0.56, 1.25, 1, temp);
  drawFlame(ctx, W * 0.26, H * 0.7, 1.0, 1, t);
  drawHeatWaves(ctx, W * 0.26, H * 0.54, 48, 1, t);
  drawLabelChip(ctx, W * 0.7, H * 0.26, "°C", 1);
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

  if (/thermometer|celsius|fahrenheit|37/.test(txt)) {
    drawThermometer(ctx, W * 0.5, H * 0.54, 1.3, a, 0.68);
    return;
  }

  if (/heat|warm|temperature/.test(txt)) {
    drawFlame(ctx, W * 0.34, H * 0.7, 1.0, a, t);
    drawHeatWaves(ctx, W * 0.34, H * 0.56, 42, a, t);
    drawThermometer(ctx, W * 0.62, H * 0.56, 1.1, a, 0.72);
    return;
  }

  drawFlame(ctx, W * 0.32, H * 0.7, 0.9, a, t);
  drawThermometer(ctx, W * 0.62, H * 0.56, 1.05, a, 0.6);
}