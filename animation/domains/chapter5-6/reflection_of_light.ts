import {
  C,
  drawLightRay,
  drawMirrorLine,
  drawNormalLine,
  drawAngleArc,
  drawSpark,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "reflection",
  "mirror",
  "angle of incidence",
  "angle of reflection",
  "reflected ray",
  "plane mirror",
  "image",
  "reflect",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#f7fbff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#d6dce6";
  ctx.fillRect(0, H * 0.8, W, H * 0.2);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  const mx = W * 0.56;
  const my = H * 0.52;

  drawMirrorLine(ctx, mx, H * 0.2, mx, H * 0.74, 1);
  drawNormalLine(ctx, mx, my, mx - 90, my, 1);

  drawLightRay(ctx, mx - 150, my - 110, mx, my, 1, "#ffd459");
  drawLightRay(ctx, mx, my, mx - 140, my + 110, 1, "#ffd459");

  drawAngleArc(ctx, mx, my, 42, -2.3, Math.PI, 1);
  drawAngleArc(ctx, mx, my, 42, Math.PI, 2.3, 1);
  drawSpark(ctx, mx, my, 10, 1);
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
  const mx = W * 0.58;
  const my = H * 0.5;

  drawMirrorLine(ctx, mx, H * 0.24, mx, H * 0.74, a);

  if (/angle|incidence|reflection/.test(txt)) {
    drawNormalLine(ctx, mx, my, mx - 90, my, a * 0.8);
    drawLightRay(ctx, mx - 130, my - 96, mx, my, a, "#ffd459");
    drawLightRay(ctx, mx, my, mx - 128, my + 96, a, "#ffd459");
    drawAngleArc(ctx, mx, my, 36, -2.3, Math.PI, a);
    drawAngleArc(ctx, mx, my, 36, Math.PI, 2.3, a);
    return;
  }

  drawLightRay(ctx, mx - 130, my - 96, mx, my, a, "#ffd459");
  drawLightRay(ctx, mx, my, mx - 128, my + 96, a, "#ffd459");
}
