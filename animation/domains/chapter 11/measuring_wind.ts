import {
  drawAnemometer,
  drawWindVane,
  drawWindLines,
  drawCompassMarks,
  drawRotationArc,
  drawArrowLine,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "wind speed",
  "wind direction",
  "anemometer",
  "wind vane",
  "wind measurement",
  "direction of wind",
  "speed of wind",
  "weather wind",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  sky.addColorStop(0, "#bce6ff");
  sky.addColorStop(1, "#eefbff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.72);

  ctx.fillStyle = "#8dc774";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawWindLines(ctx, W * 0.18, H * 0.26, 1.0, 1, t);
  drawAnemometer(ctx, W * 0.42, H * 0.58, 1.0, 1, t);
  drawRotationArc(ctx, W * 0.42, H * 0.43, 0.9, 1);
  drawWindVane(ctx, W * 0.72, H * 0.56, 1.0, 1, t);
  drawCompassMarks(ctx, W * 0.72, H * 0.76, 0.9, 1);
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

  drawWindLines(ctx, W * 0.2, H * 0.34, 0.95, a, t);

  if (/anemometer|speed/.test(txt)) {
    drawArrowLine(ctx, W * 0.3, H * 0.38, W * 0.42, H * 0.46, a);
    drawAnemometer(ctx, W * 0.54, H * 0.58, 1.1, a, t);
    drawRotationArc(ctx, W * 0.54, H * 0.43, 1.0, a);
    return;
  }
  if (/vane|direction/.test(txt)) {
    drawArrowLine(ctx, W * 0.3, H * 0.38, W * 0.42, H * 0.46, a);
    drawWindVane(ctx, W * 0.58, H * 0.56, 1.1, a, t);
    drawCompassMarks(ctx, W * 0.58, H * 0.76, 0.95, a);
    return;
  }

  drawAnemometer(ctx, W * 0.48, H * 0.58, 0.95, a, t);
  drawWindVane(ctx, W * 0.74, H * 0.56, 0.95, a, t);
}
