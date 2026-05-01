import {
  drawRainCloud,
  drawHillside,
  drawSlidingSoil,
  drawHouseSmall,
  drawDownSlopeArrows,
  drawWarningTriangle,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "landslide",
  "heavy continuous rain",
  "soil sliding",
  "hilly area",
  "gravity landslide",
  "slope failure",
  "hill collapse",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0, "#b7d9ff");
  sky.addColorStop(1, "#eef7ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.6);

  drawHillside(ctx, W * 0.54, H * 0.74, 1.25, 0.95);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawRainCloud(ctx, W * 0.3, H * 0.18, 0.95, 1, t);
  drawRainCloud(ctx, W * 0.5, H * 0.16, 1.0, 1, t);
  drawSlidingSoil(ctx, W * 0.58, H * 0.58, 1.0, 1, t);
  drawDownSlopeArrows(ctx, W * 0.56, H * 0.48, 1.0, 1);
  drawHouseSmall(ctx, W * 0.82, H * 0.72, 0.8, 1);
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 180, 650);
  const txt = sceneText.toLowerCase();

  drawHillside(ctx, W * 0.58, H * 0.74, 1.1, a);
  drawRainCloud(ctx, W * 0.32, H * 0.18, 0.9, a, t);
  drawSlidingSoil(ctx, W * 0.58, H * 0.58, 0.95, a, t);
  drawDownSlopeArrows(ctx, W * 0.56, H * 0.48, 0.9, a);

  if (/warning|danger/.test(txt)) {
    drawWarningTriangle(ctx, W * 0.18, H * 0.74, 0.8, a);
  }
}
