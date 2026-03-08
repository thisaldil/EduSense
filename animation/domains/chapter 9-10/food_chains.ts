import {
  drawSol,
  drawGrassClump,
  drawGrasshopper,
  drawFrog,
  drawSnake,
  drawEagle,
  drawArrowLine,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "food chain",
  "producer",
  "consumer",
  "energy transfer food",
  "plant to herbivore",
  "herbivore to carnivore",
  "chain of feeding",
  "linear food chain",
  "trophic level",
  "link in food chain",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#dff4ff";
  ctx.fillRect(0, 0, W, H * 0.58);
  ctx.fillStyle = "#84c96b";
  ctx.fillRect(0, H * 0.58, W, H * 0.42);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSol(ctx, W * 0.12, H * 0.16, 28, t, 0.95);
  drawGrassClump(ctx, W * 0.14, H * 0.78, 1.0, 1);
  drawGrasshopper(ctx, W * 0.3, H * 0.72, 0.9, 1, t);
  drawFrog(ctx, W * 0.48, H * 0.76, 0.9, 1, t);
  drawSnake(ctx, W * 0.68, H * 0.78, 1.0, 1, t);
  drawEagle(ctx, W * 0.86, H * 0.34, 0.95, 1, t);

  drawArrowLine(ctx, W * 0.18, H * 0.74, W * 0.25, H * 0.74, 1);
  drawArrowLine(ctx, W * 0.35, H * 0.74, W * 0.42, H * 0.74, 1);
  drawArrowLine(ctx, W * 0.53, H * 0.74, W * 0.62, H * 0.74, 1);
  drawArrowLine(ctx, W * 0.73, H * 0.66, W * 0.82, H * 0.44, 1);
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
    drawSol(ctx, W * 0.18, H * 0.18, 26, t, a);
    drawGrassClump(ctx, W * 0.5, H * 0.78, 1.2, a);
    return;
  }

  drawGrassClump(ctx, W * 0.16, H * 0.78, 0.95, a);
  drawArrowLine(ctx, W * 0.22, H * 0.74, W * 0.3, H * 0.74, a);
  drawGrasshopper(ctx, W * 0.38, H * 0.72, 0.85, a, t);
  drawArrowLine(ctx, W * 0.44, H * 0.74, W * 0.52, H * 0.74, a);
  drawFrog(ctx, W * 0.6, H * 0.76, 0.82, a, t);
  drawArrowLine(ctx, W * 0.66, H * 0.74, W * 0.74, H * 0.74, a);
  drawSnake(ctx, W * 0.82, H * 0.78, 0.85, a, t);
}