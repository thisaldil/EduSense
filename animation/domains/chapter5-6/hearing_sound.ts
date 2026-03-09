import {
  drawEar,
  drawSoundWaveArcs,
  drawInnerEarVibe,
  drawArrowLine,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "hearing",
  "ear",
  "eardrum",
  "sense organ for sound",
  "hearing of sounds",
  "ear canal",
  "ear lobe",
  "how we hear",
  "cochlea",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#f2f7ff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#dde6f2";
  ctx.fillRect(0, H * 0.8, W, H * 0.2);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSoundWaveArcs(ctx, W * 0.24, H * 0.48, 60, 1);
  drawArrowLine(ctx, W * 0.34, H * 0.48, W * 0.47, H * 0.48, 1);
  drawEar(ctx, W * 0.62, H * 0.5, 1.25, 1);
  drawInnerEarVibe(ctx, W * 0.62, H * 0.5, 0.9 + Math.sin(t * 2) * 0.05, 1);
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

  drawEar(ctx, W * 0.64, H * 0.5, 1.15, a);

  if (/eardrum|vibration|cochlea/.test(txt)) {
    drawSoundWaveArcs(ctx, W * 0.26, H * 0.48, 48, a);
    drawArrowLine(ctx, W * 0.35, H * 0.48, W * 0.48, H * 0.48, a);
    drawInnerEarVibe(ctx, W * 0.64, H * 0.5, 0.9 + Math.sin(t * 2) * 0.05, a);
    return;
  }

  drawSoundWaveArcs(ctx, W * 0.28, H * 0.48, 52, a);
  drawArrowLine(ctx, W * 0.38, H * 0.48, W * 0.5, H * 0.48, a);
}
