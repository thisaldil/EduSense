import {
  C,
  drawEye,
  drawLightRay,
  drawSpark,
  drawObjectCard,
  drawSol,
  drawArrowLine,
} from "../../core/shapes";
import { fadeIn, lerp, clamp01, easeOut } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "how we see",
  "vision",
  "eye",
  "seeing",
  "light enters eye",
  "sense organ",
  "sight",
  "optic",
  "seeing objects",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#161b26");
  g.addColorStop(1, "#2a3042");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#6c7488";
  ctx.fillRect(0, H * 0.76, W, H * 0.24);

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#fff7b3";
  ctx.beginPath();
  ctx.arc(W * 0.22, H * 0.22, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSol(ctx, W * 0.18, H * 0.18, 34, t, 0.9);
  drawObjectCard(ctx, W * 0.34, H * 0.58, 0.95, 1, "apple");
  drawEye(ctx, W * 0.74, H * 0.52, 1.15, 1);

  drawLightRay(ctx, W * 0.41, H * 0.52, W * 0.64, H * 0.5, 0.9, "#ffe680");
  drawLightRay(ctx, W * 0.43, H * 0.57, W * 0.64, H * 0.54, 0.8, "#ffe680");
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

  if (/object|see|vision|eye/.test(txt)) {
    drawObjectCard(ctx, W * 0.28, H * 0.56, 0.9, a, "cube");
    drawLightRay(ctx, W * 0.36, H * 0.52, W * 0.61, H * 0.5, a, "#ffe680");
    drawLightRay(ctx, W * 0.38, H * 0.58, W * 0.61, H * 0.55, a * 0.8, "#ffe680");
    drawEye(ctx, W * 0.72, H * 0.53, 1.05, a);
    drawSpark(ctx, W * 0.81, H * 0.47, 16, a);
    return;
  }

  drawObjectCard(ctx, W * 0.3, H * 0.56, 0.85, a, "star");
  drawArrowLine(ctx, W * 0.39, H * 0.54, W * 0.55, H * 0.54, a);
  drawEye(ctx, W * 0.68, H * 0.53, 1.0, a);
}
