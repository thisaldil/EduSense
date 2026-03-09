import {
  drawParallelRays,
  drawDivergingRays,
  drawConvergingRays,
  drawLaserDotTrail,
  drawLabelChip,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "light rays",
  "light beams",
  "straight line",
  "parallel rays",
  "divergent rays",
  "convergent rays",
  "laser beam",
  "ray of light",
  "beam of light",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0b1020");
  g.addColorStop(1, "#171d2d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  drawParallelRays(ctx, W * 0.18, H * 0.22, 120, 1);
  drawDivergingRays(ctx, W * 0.5, H * 0.3, 120, 1);
  drawConvergingRays(ctx, W * 0.82, H * 0.3, 120, 1);

  drawLabelChip(ctx, W * 0.18, H * 0.68, "Parallel", 1);
  drawLabelChip(ctx, W * 0.5, H * 0.68, "Diverging", 1);
  drawLabelChip(ctx, W * 0.82, H * 0.68, "Converging", 1);
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
  const a = fadeIn(elapsed, 160, 650);

  if (/parallel/.test(txt)) {
    drawParallelRays(ctx, W * 0.5, H * 0.34, 150, a);
    return;
  }
  if (/diverg/.test(txt)) {
    drawDivergingRays(ctx, W * 0.5, H * 0.38, 150, a);
    return;
  }
  if (/converg/.test(txt)) {
    drawConvergingRays(ctx, W * 0.5, H * 0.38, 150, a);
    return;
  }
  if (/laser/.test(txt)) {
    drawLaserDotTrail(ctx, W * 0.2, H * 0.5, W * 0.8, H * 0.5, a);
    return;
  }

  drawParallelRays(ctx, W * 0.2, H * 0.36, 90, a);
  drawDivergingRays(ctx, W * 0.5, H * 0.36, 90, a);
  drawConvergingRays(ctx, W * 0.8, H * 0.36, 90, a);
}
