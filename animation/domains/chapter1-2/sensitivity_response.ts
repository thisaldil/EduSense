import {
  drawEye,
  drawEar,
  drawHand,
  drawLightFlash,
  drawSoundWaveArcs,
  drawReactionArrow,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "sensitivity",
  "response to stimuli",
  "sense organs",
  "eye",
  "ear",
  "touch",
  "sensitive",
  "response",
  "react",
  "nervous",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#f8fdff");
  g.addColorStop(1, "#eef6ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, _t: number): void {
  drawEye(ctx, W * 0.3, H * 0.42, 1.0, 1);
  drawEar(ctx, W * 0.68, H * 0.45, 1.0, 1);
  drawLightFlash(ctx, W * 0.15, H * 0.28, 0.9, 1);
  drawSoundWaveArcs(ctx, W * 0.88, H * 0.45, 44, 1);
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
  const a = fadeIn(elapsed, 150, 650);

  if (/light|eye|see/.test(txt)) {
    drawLightFlash(ctx, W * 0.2, H * 0.4, 0.9, a);
    drawReactionArrow(ctx, W * 0.28, H * 0.4, W * 0.42, H * 0.4, a);
    drawEye(ctx, W * 0.52, H * 0.42, 1.0, a);
    return;
  }

  if (/sound|ear|hear/.test(txt)) {
    drawSoundWaveArcs(ctx, W * 0.26, H * 0.45, 44, a);
    drawReactionArrow(ctx, W * 0.34, H * 0.45, W * 0.48, H * 0.45, a);
    drawEar(ctx, W * 0.58, H * 0.45, 1.0, a);
    return;
  }

  if (/touch|hand/.test(txt)) {
    drawHand(ctx, W * 0.28, H * 0.5, 1.0, a);
    drawReactionArrow(ctx, W * 0.36, H * 0.5, W * 0.55, H * 0.5, a);
    drawHand(ctx, W * 0.64, H * 0.5, 1.0, a);
    return;
  }

  drawLightFlash(ctx, W * 0.18, H * 0.38, 0.8, a);
  drawReactionArrow(ctx, W * 0.27, H * 0.4, W * 0.42, H * 0.4, a);
  drawEye(ctx, W * 0.52, H * 0.42, 1.0, a);
}
