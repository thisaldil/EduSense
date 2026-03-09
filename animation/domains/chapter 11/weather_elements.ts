/**
 * domains/chapter 11/weather_elements.ts
 * Core visual for "Elements of Weather" (sunshine, temperature, wind, rainfall).
 */

import {
  drawSol,
  drawCloud,
  drawRainCloud,
  drawRainDrops,
  drawWindLines,
  drawAnemometer,
  drawThermometer,
  drawSunShadeIcons,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "weather elements",
  "elements of weather",
  "sunshine",
  "sunny",
  "temperature",
  "hot",
  "cold",
  "wind",
  "breeze",
  "rain",
  "rainfall",
  "precipitation",
  "daily weather",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  // Soft sky + horizon band to keep consistency with other Chapter 11 scenes.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  sky.addColorStop(0, "#bde6ff");
  sky.addColorStop(1, "#f5fbff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.7);

  ctx.fillStyle = "#8acb7a";
  ctx.fillRect(0, H * 0.7, W, H * 0.3);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  // Topâ€‘left: sunshine (Sol + cloud)
  drawSol(ctx, W * 0.22, H * 0.18, 42, t, 1);
  drawCloud(ctx, W * 0.32, H * 0.2, 0.9, 0.9, t);

  // Topâ€‘right: rainfall icon
  drawRainCloud(ctx, W * 0.72, H * 0.2, 1.0, 1, t);
  drawRainDrops(ctx, W * 0.72, H * 0.36, 5, 0.95);

  // Bottomâ€‘left: wind speed element
  drawWindLines(ctx, W * 0.28, H * 0.54, 1.0, 0.9, t);
  drawAnemometer(ctx, W * 0.42, H * 0.68, 0.95, 1, t);

  // Bottomâ€‘right: temperature with sun/shade hints
  drawThermometer(ctx, W * 0.72, H * 0.64, 1.05, 1, 0.6);
  drawSunShadeIcons(ctx, W * 0.86, H * 0.32, 0.9, 1);
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

  // Temperature-focused sentences.
  if (/temperature|celsius|hot|cold/.test(txt)) {
    drawThermometer(ctx, W * 0.5, H * 0.62, 1.15, a, 0.62);
    drawSunShadeIcons(ctx, W * 0.76, H * 0.3, 0.95, a);
    return;
  }

  // Rain / rainfall / precipitation.
  if (/rain|rainfall|precipitation/.test(txt)) {
    drawRainCloud(ctx, W * 0.5, H * 0.22, 1.05, a, t);
    drawRainDrops(ctx, W * 0.5, H * 0.38, 6, a);
    return;
  }

  // Wind and breeze.
  if (/wind|breeze/.test(txt)) {
    drawWindLines(ctx, W * 0.3, H * 0.38, 1.0, a, t);
    drawAnemometer(ctx, W * 0.6, H * 0.6, 1.0, a, t);
    return;
  }

  // Sunshine / clear weather.
  if (/sunshine|sunny|clear sky|bright/.test(txt)) {
    drawSol(ctx, W * 0.5, H * 0.26, 48, t, a);
    drawCloud(ctx, W * 0.65, H * 0.24, 0.9, a, t);
    return;
  }

  // Default: show a compact summary of all four elements.
  drawSol(ctx, W * 0.22, H * 0.2, 34, t, a);
  drawRainCloud(ctx, W * 0.42, H * 0.2, 0.9, a, t);
  drawRainDrops(ctx, W * 0.42, H * 0.34, 4, a);
  drawWindLines(ctx, W * 0.64, H * 0.42, 0.9, a, t);
  drawThermometer(ctx, W * 0.8, H * 0.64, 0.9, a, 0.6);
}


