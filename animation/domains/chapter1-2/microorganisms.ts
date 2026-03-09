import {
  drawMicroscope,
  drawMicrobeBlob,
  drawWaterDrop,
  drawMagnifierCircle,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "micro-organisms",
  "microorganism",
  "bacteria",
  "fungi",
  "algae",
  "microscope",
  "pond water",
  "tiny organisms",
  "yeast",
  "virus",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#10141d";
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  const r = Math.min(W, H) * 0.34;
  const gx = ctx.createRadialGradient(W * 0.5, H * 0.5, r * 0.1, W * 0.5, H * 0.5, r);
  gx.addColorStop(0, "rgba(80,150,220,0.20)");
  gx.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gx;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.5, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawMicroscope(ctx, W * 0.2, H * 0.72, 1.0, 1);
  drawMagnifierCircle(ctx, W * 0.62, H * 0.44, 130, 1);
  drawMicrobeBlob(ctx, W * 0.57, H * 0.4, 0.9, 1, t);
  drawMicrobeBlob(ctx, W * 0.66, H * 0.47, 0.7, 1, t + 0.5);
  drawMicrobeBlob(ctx, W * 0.61, H * 0.54, 0.6, 1, t + 1);
}

export function keywordFallback(
  ctx: Ctx,
  _sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const a = fadeIn(elapsed, 180, 650);
  drawWaterDrop(ctx, W * 0.5, H * 0.52, 64, a);
  drawMicrobeBlob(ctx, W * 0.46, H * 0.48, 0.75, a, t);
  drawMicrobeBlob(ctx, W * 0.54, H * 0.56, 0.6, a, t + 0.4);
  drawMicrobeBlob(ctx, W * 0.56, H * 0.43, 0.5, a, t + 0.8);
}
