import {
  drawHighPitchWave,
  drawLowPitchWave,
  drawLoudWave,
  drawSoftWave,
  drawLabelChip,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "pitch",
  "loudness",
  "frequency",
  "high pitched",
  "low pitched",
  "loud sound",
  "soft sound",
  "diversity of sounds",
  "volume",
  "tone",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#fbfcff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#edf2fa";
  ctx.fillRect(0, H * 0.5, W, 2);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawHighPitchWave(ctx, W * 0.28, H * 0.28, 1.0, 1, t);
  drawLowPitchWave(ctx, W * 0.72, H * 0.28, 1.0, 1, t);
  drawLoudWave(ctx, W * 0.28, H * 0.72, 1.0, 1, t);
  drawSoftWave(ctx, W * 0.72, H * 0.72, 1.0, 1, t);

  drawLabelChip(ctx, W * 0.28, H * 0.12, "High Pitch", 1);
  drawLabelChip(ctx, W * 0.72, H * 0.12, "Low Pitch", 1);
  drawLabelChip(ctx, W * 0.28, H * 0.56, "Loud", 1);
  drawLabelChip(ctx, W * 0.72, H * 0.56, "Soft", 1);
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

  if (/high|pitch|frequency/.test(txt)) {
    drawHighPitchWave(ctx, W * 0.5, H * 0.5, 1.2, a, t);
    return;
  }
  if (/low/.test(txt)) {
    drawLowPitchWave(ctx, W * 0.5, H * 0.5, 1.2, a, t);
    return;
  }
  if (/loud/.test(txt)) {
    drawLoudWave(ctx, W * 0.5, H * 0.5, 1.2, a, t);
    return;
  }
  if (/soft|quiet/.test(txt)) {
    drawSoftWave(ctx, W * 0.5, H * 0.5, 1.2, a, t);
    return;
  }

  drawHighPitchWave(ctx, W * 0.3, H * 0.5, 0.95, a, t);
  drawLowPitchWave(ctx, W * 0.7, H * 0.5, 0.95, a, t);
}
