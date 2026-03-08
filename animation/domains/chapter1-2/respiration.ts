import {
  drawLungs,
  drawO2,
  drawCO2,
  drawInhaleArrow,
  drawExhaleArrow,
  drawChestArc,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "respiration",
  "breathing",
  "inhaling",
  "exhaling",
  "oxygen",
  "carbon dioxide",
  "chest",
  "lungs",
  "respiratory movement",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#f2fbff");
  g.addColorStop(1, "#e7eef7");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawLungs(ctx, W * 0.5, H * 0.52, 1.2, 1, 0.92 + Math.sin(t * 2) * 0.08);
  drawInhaleArrow(ctx, W * 0.24, H * 0.48, W * 0.38, H * 0.48, 1);
  drawExhaleArrow(ctx, W * 0.62, H * 0.48, W * 0.76, H * 0.48, 1);
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

  drawLungs(ctx, W * 0.5, H * 0.55, 1.1, a, 0.92 + Math.sin(t * 2) * 0.08);
  drawChestArc(ctx, W * 0.5, H * 0.58, 94, a);

  if (/inhal|oxygen|o2/.test(txt)) {
    drawO2(ctx, W * 0.26, H * 0.48, 18, a);
    drawInhaleArrow(ctx, W * 0.3, H * 0.48, W * 0.4, H * 0.48, a);
    return;
  }
  if (/exhal|carbon dioxide|co2/.test(txt)) {
    drawCO2(ctx, W * 0.74, H * 0.48, 22, a);
    drawExhaleArrow(ctx, W * 0.6, H * 0.48, W * 0.7, H * 0.48, a);
    return;
  }

  drawO2(ctx, W * 0.25, H * 0.48, 18, a);
  drawInhaleArrow(ctx, W * 0.3, H * 0.48, W * 0.4, H * 0.48, a);
  drawCO2(ctx, W * 0.75, H * 0.48, 22, a);
  drawExhaleArrow(ctx, W * 0.6, H * 0.48, W * 0.7, H * 0.48, a);
}