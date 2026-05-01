import {
  drawCube,
  drawWaterDrop,
  drawBolt,
  drawLightRay,
  drawSoundWaveArcs,
  drawBalanceScale,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "matter",
  "energy",
  "mass",
  "occupies space",
  "things without mass",
  "light energy",
  "heat energy",
  "sound energy",
  "matter and energy",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fbfdff");
  g.addColorStop(1, "#eef4fb");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#d6dde6";
  ctx.fillRect(W * 0.12, H * 0.72, W * 0.76, 16);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  drawBalanceScale(ctx, W * 0.5, H * 0.64, 1.1, 1);
  drawCube(ctx, W * 0.36, H * 0.47, 42, 1);
  drawBolt(ctx, W * 0.64, H * 0.44, 40, 1);
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
  const a = fadeIn(elapsed, 200, 650);

  if (/matter|mass|space/.test(txt)) {
    drawCube(ctx, W * 0.38, H * 0.56, 40, a);
    drawWaterDrop(ctx, W * 0.58, H * 0.56, 22, a);
    return;
  }

  if (/energy|light|sound|heat/.test(txt)) {
    drawBolt(ctx, W * 0.34, H * 0.54, 34, a);
    drawLightRay(ctx, W * 0.47, H * 0.54, W * 0.62, H * 0.54, a);
    drawSoundWaveArcs(ctx, W * 0.76, H * 0.54, 34, a);
    return;
  }

  drawCube(ctx, W * 0.28, H * 0.56, 34, a);
  drawWaterDrop(ctx, W * 0.42, H * 0.56, 18, a);
  drawBolt(ctx, W * 0.62, H * 0.54, 30, a);
  drawLightRay(ctx, W * 0.68, H * 0.54, W * 0.82, H * 0.54, a);
}
