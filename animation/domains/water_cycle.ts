// animation/domains/water_cycle.ts
import * as Shapes from "../core/shapes";

export const keywords = [
  "water cycle",
  "evaporation",
  "condensation",
  "precipitation",
  "transpiration",
  "runoff",
];

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
) {
  // Full landscape: ocean + mountains + clouds + river
  ctx.fillStyle = "#0ea5e9";
  ctx.fillRect(0, H * 0.65, W, H * 0.35); // ocean
  // mountains, river, etc. (full detailed drawing using Shapes)
}

export function drawAnchorCharacters(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  Shapes.drawSol(ctx, W * 0.2, H * 0.25, 60);
  Shapes.drawCloud(ctx, W * 0.55, H * 0.22, 1.1, Math.sin(t * 0.03));
}

export function keywordFallback(
  ctx: CanvasRenderingContext2D,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
) {
  const txt = sceneText.toLowerCase();
  if (txt.includes("evapor"))
    Shapes.drawWaterDropsRising(ctx, W * 0.3, H * 0.55);
  else if (txt.includes("cloud")) Shapes.drawCloud(ctx, W * 0.5, H * 0.3, 1.3);
  else if (txt.includes("rain")) Shapes.drawFallingRain(ctx, W * 0.7, H * 0.4);
  // etc. — full logic from your document
}
