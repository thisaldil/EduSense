import {
  drawSol,
  drawFlame,
  drawHandsRub,
  drawElectricCoil,
  drawHeatWaves,
  drawPanelDivider,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "sources of heat",
  "sun as heat source",
  "friction",
  "chemical reaction",
  "electrical heat",
  "burning",
  "combustion",
  "heat generation",
  "fire",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fff7ec");
  g.addColorStop(1, "#ffe0ba");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawPanelDivider(ctx, W * 0.5, H * 0.08, W * 0.5, H * 0.92, 0.4);
  drawPanelDivider(ctx, W * 0.08, H * 0.5, W * 0.92, H * 0.5, 0.4);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSol(ctx, W * 0.28, H * 0.28, 34, t, 1);
  drawFlame(ctx, W * 0.72, H * 0.3, 1.0, 1, t);
  drawHandsRub(ctx, W * 0.28, H * 0.74, 1.0, 1, t);
  drawElectricCoil(ctx, W * 0.72, H * 0.72, 1.0, 1, t);

  drawHeatWaves(ctx, W * 0.28, H * 0.16, 36, 0.8, t);
  drawHeatWaves(ctx, W * 0.72, H * 0.18, 36, 0.8, t);
  drawHeatWaves(ctx, W * 0.28, H * 0.61, 36, 0.8, t);
  drawHeatWaves(ctx, W * 0.72, H * 0.59, 36, 0.8, t);
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
  const a = fadeIn(elapsed, 150, 650);

  if (/sun/.test(txt)) {
    drawSol(ctx, W * 0.5, H * 0.34, 48, t, a);
    drawHeatWaves(ctx, W * 0.5, H * 0.5, 56, a, t);
    return;
  }
  if (/fire|burn|combust/.test(txt)) {
    drawFlame(ctx, W * 0.5, H * 0.66, 1.25, a, t);
    drawHeatWaves(ctx, W * 0.5, H * 0.46, 52, a, t);
    return;
  }
  if (/friction|rub/.test(txt)) {
    drawHandsRub(ctx, W * 0.5, H * 0.62, 1.15, a, t);
    drawHeatWaves(ctx, W * 0.5, H * 0.46, 46, a, t);
    return;
  }
  if (/electric|coil/.test(txt)) {
    drawElectricCoil(ctx, W * 0.5, H * 0.62, 1.2, a, t);
    drawHeatWaves(ctx, W * 0.5, H * 0.46, 48, a, t);
    return;
  }

  drawSol(ctx, W * 0.2, H * 0.34, 28, t, a);
  drawFlame(ctx, W * 0.42, H * 0.7, 0.85, a, t);
  drawHandsRub(ctx, W * 0.62, H * 0.68, 0.9, a, t);
  drawElectricCoil(ctx, W * 0.82, H * 0.68, 0.82, a, t);
}
