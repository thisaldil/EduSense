import {
  drawDrum,
  drawDrumstick,
  drawSoundWaveArcs,
  drawVibrationSquiggle,
  drawArrowLine,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "sound production",
  "vibration",
  "producing sound",
  "source of sound",
  "vibrating object",
  "drum",
  "string",
  "vibrate",
  "sound source",
  "how sound is made",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a1730");
  g.addColorStop(1, "#472452");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#5d3965";
  ctx.fillRect(0, H * 0.78, W, H * 0.22);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawDrum(ctx, W * 0.46, H * 0.65, 1.15, 1);
  drawDrumstick(ctx, W * 0.32, H * 0.42, 1.0, 1, t);
  drawVibrationSquiggle(ctx, W * 0.46, H * 0.55, 44, 1, t);
  drawSoundWaveArcs(ctx, W * 0.62, H * 0.56, 58, 1);
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

  if (/drum|vibration|vibrate/.test(txt)) {
    drawDrumstick(ctx, W * 0.34, H * 0.42, 0.95, a, t);
    drawDrum(ctx, W * 0.5, H * 0.66, 1.12, a);
    drawVibrationSquiggle(ctx, W * 0.5, H * 0.55, 42, a, t);
    drawSoundWaveArcs(ctx, W * 0.67, H * 0.56, 52, a);
    return;
  }

  drawDrumstick(ctx, W * 0.34, H * 0.42, 0.95, a, t);
  drawArrowLine(ctx, W * 0.4, H * 0.48, W * 0.46, H * 0.52, a);
  drawDrum(ctx, W * 0.52, H * 0.66, 1.06, a);
  drawSoundWaveArcs(ctx, W * 0.68, H * 0.56, 48, a);
}
