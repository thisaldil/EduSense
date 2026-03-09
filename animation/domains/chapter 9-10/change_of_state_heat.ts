import {
  drawIceCube,
  drawWaterDrop,
  drawSteamPuff,
  drawHeatArrow,
  drawStateArrow,
  drawThermometer,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "change of state",
  "melting",
  "boiling",
  "evaporation",
  "condensation",
  "freezing",
  "heat causes change of state",
  "solid to liquid",
  "liquid to gas",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#e6f6ff");
  g.addColorStop(1, "#fff1dc");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#d7e0ea";
  ctx.fillRect(0, H * 0.8, W, H * 0.2);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawIceCube(ctx, W * 0.2, H * 0.62, 1.0, 1);
  drawStateArrow(ctx, W * 0.33, H * 0.62, W * 0.42, H * 0.62, 1);
  drawWaterDrop(ctx, W * 0.5, H * 0.62, 28, 1);
  drawStateArrow(ctx, W * 0.58, H * 0.62, W * 0.7, H * 0.62, 1);
  drawSteamPuff(ctx, W * 0.8, H * 0.48, 1.0, 1, t);
  drawThermometer(ctx, W * 0.5, H * 0.26, 0.95, 1, 0.75);
  drawHeatArrow(ctx, W * 0.5, H * 0.4, 0.95, 1);
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

  if (/melt|solid to liquid|ice/.test(txt)) {
    drawIceCube(ctx, W * 0.36, H * 0.62, 1.0, a);
    drawHeatArrow(ctx, W * 0.5, H * 0.62, 0.9, a);
    drawWaterDrop(ctx, W * 0.66, H * 0.62, 26, a);
    return;
  }
  if (/boil|evapor|liquid to gas|steam/.test(txt)) {
    drawWaterDrop(ctx, W * 0.36, H * 0.62, 26, a);
    drawHeatArrow(ctx, W * 0.5, H * 0.62, 0.9, a);
    drawSteamPuff(ctx, W * 0.66, H * 0.5, 1.0, a, t);
    return;
  }

  drawIceCube(ctx, W * 0.2, H * 0.62, 0.9, a);
  drawStateArrow(ctx, W * 0.31, H * 0.62, W * 0.4, H * 0.62, a);
  drawWaterDrop(ctx, W * 0.5, H * 0.62, 24, a);
  drawStateArrow(ctx, W * 0.59, H * 0.62, W * 0.68, H * 0.62, a);
  drawSteamPuff(ctx, W * 0.78, H * 0.5, 0.9, a, t);
}
