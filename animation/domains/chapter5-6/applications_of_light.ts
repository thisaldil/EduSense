import {
  drawFiberCable,
  drawLaserDotTrail,
  drawTrafficLight,
  drawLighthouse,
  drawEndoscope,
  drawLightRay,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "applications of light",
  "optical fiber",
  "laser",
  "endoscope",
  "traffic light",
  "lighthouse",
  "signal",
  "communication",
  "medical use of light",
  "entertainment",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0f1524");
  g.addColorStop(1, "#202839");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#32405b";
  ctx.fillRect(0, H * 0.8, W, H * 0.2);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawFiberCable(ctx, W * 0.18, H * 0.56, W * 0.46, H * 0.42, 1, t);
  drawTrafficLight(ctx, W * 0.62, H * 0.58, 1.0, 1);
  drawLighthouse(ctx, W * 0.84, H * 0.64, 1.0, 1, t);
  drawEndoscope(ctx, W * 0.4, H * 0.73, 0.95, 1);
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
  const a = fadeIn(elapsed, 180, 650);

  if (/fiber|optical/.test(txt)) {
    drawFiberCable(ctx, W * 0.22, H * 0.58, W * 0.76, H * 0.42, a, t);
    return;
  }
  if (/laser/.test(txt)) {
    drawLaserDotTrail(ctx, W * 0.18, H * 0.5, W * 0.82, H * 0.5, a);
    return;
  }
  if (/traffic/.test(txt)) {
    drawTrafficLight(ctx, W * 0.5, H * 0.58, 1.25, a);
    return;
  }
  if (/lighthouse/.test(txt)) {
    drawLighthouse(ctx, W * 0.52, H * 0.7, 1.2, a, t);
    return;
  }
  if (/endoscope|medical/.test(txt)) {
    drawEndoscope(ctx, W * 0.5, H * 0.6, 1.15, a);
    drawLightRay(ctx, W * 0.5, H * 0.5, W * 0.72, H * 0.42, a, "#8be7ff");
    return;
  }

  drawFiberCable(ctx, W * 0.22, H * 0.58, W * 0.76, H * 0.42, a, t);
}
