import {
  C,
  drawSol,
  drawCandle,
  drawTorch,
  drawBulb,
  drawStar,
  drawLightBurst,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "sources of light",
  "luminous",
  "non-luminous",
  "natural light",
  "artificial light",
  "candle",
  "torch",
  "sun",
  "stars",
  "fire",
  "fluorescent",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0d1320");
  g.addColorStop(1, "#1d2638");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#2b3343";
  ctx.fillRect(0, H * 0.78, W, H * 0.22);

  for (let i = 0; i < 10; i++) {
    drawStar(ctx, 40 + i * (W - 80) / 9, 40 + (i % 3) * 18, 0.18, 0.45);
  }
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSol(ctx, W * 0.18, H * 0.2, 34, t, 1);
  drawCandle(ctx, W * 0.42, H * 0.72, 1.0, 1, t);
  drawTorch(ctx, W * 0.67, H * 0.68, 1.0, 1, t);
  drawBulb(ctx, W * 0.84, H * 0.28, 1.0, 1, t);
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
  const a = fadeIn(elapsed, 160, 650);

  if (/sun|natural/.test(txt)) {
    drawSol(ctx, W * 0.5, H * 0.34, 46, t, a);
    drawLightBurst(ctx, W * 0.5, H * 0.34, 74, a);
    return;
  }
  if (/candle|fire/.test(txt)) {
    drawCandle(ctx, W * 0.5, H * 0.68, 1.2, a, t);
    return;
  }
  if (/torch/.test(txt)) {
    drawTorch(ctx, W * 0.48, H * 0.66, 1.15, a, t);
    return;
  }
  if (/bulb|fluorescent|artificial/.test(txt)) {
    drawBulb(ctx, W * 0.5, H * 0.36, 1.2, a, t);
    return;
  }

  drawSol(ctx, W * 0.2, H * 0.3, 28, t, a);
  drawCandle(ctx, W * 0.45, H * 0.68, 0.95, a, t);
  drawTorch(ctx, W * 0.7, H * 0.66, 0.95, a, t);
}
