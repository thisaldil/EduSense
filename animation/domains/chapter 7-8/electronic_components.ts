/**
 * domains/electronic_components.ts
 */

import {
  drawAmmeterDial,
  drawBatterySymbol,
  drawCurrentArrow,
  drawDiodeSymbol,
  drawLEDSymbol,
  drawResistorSymbol,
  drawSwitch,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "resistor",
  "diode",
  "led",
  "light emitting diode",
  "light dependent resistor",
  "ammeter",
  "voltmeter",
  "milliammeter",
  "galvanometer",
  "electronic circuit",
  "ohm",
  "ampere",
  "volt",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#111827");
  bg.addColorStop(1, "#1f2937");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  _t: number,
): void {
  drawBatterySymbol(ctx, W * 0.14, H * 0.5, 0.72, 1);
  drawResistorSymbol(ctx, W * 0.32, H * 0.5, 0.9, 1);
  drawDiodeSymbol(ctx, W * 0.5, H * 0.5, 0.9, 1);
  drawLEDSymbol(ctx, W * 0.68, H * 0.5, 0.95, 1);
  drawAmmeterDial(ctx, W * 0.86, H * 0.5, 0.85, 1);
  drawSwitch(ctx, W * 0.5, H * 0.24, 0.72, 0.85, true);
  drawCurrentArrow(ctx, W * 0.5, H * 0.72, 0.9, 1);
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
  const a = fadeIn(elapsed, 150, 500);

  if (/resistor|ohm/.test(txt)) {
    drawResistorSymbol(ctx, W * 0.5, H * 0.5, 1.0, a);
    return;
  }

  if (/diode/.test(txt) && !/led/.test(txt)) {
    drawDiodeSymbol(ctx, W * 0.5, H * 0.5, 1.0, a);
    return;
  }

  if (/led|light emitting diode/.test(txt)) {
    drawLEDSymbol(ctx, W * 0.5, H * 0.5, 1.0, a);
    return;
  }

  if (/ammeter|voltmeter|galvanometer|ampere|volt/.test(txt)) {
    drawAmmeterDial(ctx, W * 0.5, H * 0.5, 1.0, a);
    return;
  }

  drawBatterySymbol(ctx, W * 0.18, H * 0.5, 0.68, a);
  drawResistorSymbol(ctx, W * 0.38, H * 0.5, 0.76, a);
  drawDiodeSymbol(ctx, W * 0.56, H * 0.5, 0.76, a);
  drawLEDSymbol(ctx, W * 0.74, H * 0.5, 0.8, a);
  drawCurrentArrow(ctx, W * 0.5, H * 0.72, 0.8, a);
}