import {
  drawMusicNote,
  drawNoiseBurst,
  drawRhythmBars,
  drawCrossMark,
  drawTick,
} from "../core/shapes";
import { fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "music",
  "noise",
  "rhythmic sound",
  "unrhythmic",
  "musical note",
  "pleasant sound",
  "unpleasant sound",
  "music and noise",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fffaf5");
  g.addColorStop(1, "#f3f0ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#e6e1ef";
  ctx.fillRect(W * 0.5 - 1, 0, 2, H);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawMusicNote(ctx, W * 0.26, H * 0.46, 1.2, 1, t);
  drawRhythmBars(ctx, W * 0.26, H * 0.68, 1.0, 1, t);
  drawTick(ctx, W * 0.4, H * 0.76, 24, 1);

  drawNoiseBurst(ctx, W * 0.74, H * 0.48, 1.1, 1, t);
  drawCrossMark(ctx, W * 0.87, H * 0.76, 22, 1);
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
  const a = fadeIn(elapsed, 150, 600);

  if (/music|musical|rhyth/.test(txt)) {
    drawMusicNote(ctx, W * 0.5, H * 0.46, 1.25, a, t);
    drawRhythmBars(ctx, W * 0.5, H * 0.7, 1.0, a, t);
    return;
  }
  if (/noise|unpleasant|unrhythmic/.test(txt)) {
    drawNoiseBurst(ctx, W * 0.5, H * 0.5, 1.25, a, t);
    return;
  }

  drawMusicNote(ctx, W * 0.3, H * 0.5, 1.0, a, t);
  drawNoiseBurst(ctx, W * 0.7, H * 0.5, 1.0, a, t);
}