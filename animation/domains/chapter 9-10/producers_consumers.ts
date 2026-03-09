import {
  drawPyramidTier,
  drawGrassClump,
  drawDeer,
  drawLion,
  drawSol,
  drawArrowUp,
  drawPyramidOutline,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "producer",
  "consumer",
  "green plant producer",
  "first consumer",
  "second consumer",
  "third consumer",
  "primary consumer",
  "secondary consumer",
  "decomposer",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#e4f6ff");
  g.addColorStop(1, "#f2f7d3");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawPyramidOutline(ctx, W * 0.5, H * 0.7, 1.15, 1);
  drawPyramidTier(ctx, W * 0.5, H * 0.74, 1.0, 1, "base");
  drawPyramidTier(ctx, W * 0.5, H * 0.58, 0.72, 1, "middle");
  drawPyramidTier(ctx, W * 0.5, H * 0.42, 0.42, 1, "top");

  drawGrassClump(ctx, W * 0.5, H * 0.79, 1.0, 1);
  drawDeer(ctx, W * 0.5, H * 0.61, 0.82, 1, t);
  drawLion(ctx, W * 0.5, H * 0.45, 0.75, 1, t);
  drawSol(ctx, W * 0.18, H * 0.18, 28, t, 0.9);

  drawArrowUp(ctx, W * 0.72, H * 0.74, 0.9, 1);
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
  const a = fadeIn(elapsed, 170, 650);

  if (/producer|plant/.test(txt)) {
    drawSol(ctx, W * 0.22, H * 0.18, 26, t, a);
    drawGrassClump(ctx, W * 0.5, H * 0.78, 1.15, a);
    return;
  }
  if (/consumer|primary|secondary|third/.test(txt)) {
    drawPyramidOutline(ctx, W * 0.5, H * 0.7, 1.15, a);
    drawGrassClump(ctx, W * 0.5, H * 0.79, 1.0, a);
    drawDeer(ctx, W * 0.5, H * 0.61, 0.82, a, t);
    drawLion(ctx, W * 0.5, H * 0.45, 0.75, a, t);
    return;
  }

  drawPyramidOutline(ctx, W * 0.5, H * 0.7, 1.15, a);
  drawGrassClump(ctx, W * 0.5, H * 0.79, 1.0, a);
  drawDeer(ctx, W * 0.5, H * 0.61, 0.82, a, t);
  drawLion(ctx, W * 0.5, H * 0.45, 0.75, a, t);
}
