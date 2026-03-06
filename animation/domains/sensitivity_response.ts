/**
 * domains/sensitivity_response.ts — Background, anchors, and keyword fallback for Sensitivity & Response.
 */

import {
  C,
  drawCartoonCharacter,
  drawEye,
  drawEar,
  drawLightFlash,
  drawSoundWave,
  drawReactionArrow,
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

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
  const sk = ctx.createLinearGradient(0, 0, 0, H);
  sk.addColorStop(0, "#bae6fd");
  sk.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H);
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  drawCartoonCharacter(ctx, W * 0.5, H * 0.55, 1.2, t);
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
  const a = fadeIn(elapsed, 150, 650);
  if (/light|eye/.test(txt)) {
    drawLightFlash(ctx, W * 0.32, H * 0.32, 1.1, t, a);
    drawEye(ctx, W * 0.48, H * 0.48, 1.0, t, a);
  } else if (/sound|ear/.test(txt)) {
    drawSoundWave(ctx, W * 0.68, H * 0.35, 1.05, t, a);
    drawEar(ctx, W * 0.52, H * 0.48, 1.0, t, a);
  }
  drawReactionArrow(ctx, W * 0.5, H * 0.55, W * 0.5, H * 0.68, a);
}
