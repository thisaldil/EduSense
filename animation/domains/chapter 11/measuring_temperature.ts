import {
  drawThermometer,
  drawSunShadeIcons,
  drawWeatherChart,
  drawArrowLine,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "measuring temperature",
  "thermometer weather",
  "celsius",
  "temperature data",
  "weather temperature",
  "recording temperature",
  "maximum minimum thermometer",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.74);
  sky.addColorStop(0, "#d9f1ff");
  sky.addColorStop(1, "#f8fcff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.74);

  ctx.fillStyle = "#8ac974";
  ctx.fillRect(0, H * 0.74, W, H * 0.26);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  drawThermometer(ctx, W * 0.42, H * 0.56, 1.25, 1, 0.62);
  drawSunShadeIcons(ctx, W * 0.68, H * 0.28, 1.0, 1);
  drawWeatherChart(ctx, W * 0.78, H * 0.7, 0.9, 1);
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

  if (/maximum|minimum|day|night/.test(txt)) {
    drawThermometer(ctx, W * 0.38, H * 0.56, 1.05, a, 0.72);
    drawThermometer(ctx, W * 0.62, H * 0.56, 1.05, a, 0.38);
    return;
  }

  drawThermometer(ctx, W * 0.4, H * 0.56, 1.15, a, 0.66);
  drawArrowLine(ctx, W * 0.5, H * 0.56, W * 0.62, H * 0.56, a);
  if (/celsius|data|record/.test(txt)) {
    drawWeatherChart(ctx, W * 0.76, H * 0.68, 0.9, a);
  } else {
    drawSunShadeIcons(ctx, W * 0.76, H * 0.32, 0.9, a);
  }
}
