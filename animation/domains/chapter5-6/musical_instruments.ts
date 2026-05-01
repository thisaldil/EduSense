import {
  drawGuitar,
  drawFlute,
  drawDrum,
  drawSoundWaveArcs,
  drawLabelChip,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "musical instruments",
  "string instruments",
  "wind instruments",
  "percussion",
  "drum",
  "guitar",
  "flute",
  "instrument",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2c1836");
  g.addColorStop(1, "#4a2450");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#6a4165";
  ctx.fillRect(0, H * 0.8, W, H * 0.2);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawGuitar(ctx, W * 0.22, H * 0.62, 1.0, 1, t);
  drawFlute(ctx, W * 0.5, H * 0.42, 1.0, 1);
  drawDrum(ctx, W * 0.78, H * 0.68, 0.95, 1);

  drawLabelChip(ctx, W * 0.22, H * 0.18, "String", 1);
  drawLabelChip(ctx, W * 0.5, H * 0.18, "Wind", 1);
  drawLabelChip(ctx, W * 0.78, H * 0.18, "Percussion", 1);

  drawSoundWaveArcs(ctx, W * 0.87, H * 0.56, 38, 0.8);
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
  const a = fadeIn(elapsed, 170, 650);

  if (/string|guitar|violin/.test(txt)) {
    drawGuitar(ctx, W * 0.5, H * 0.62, 1.18, a, t);
    return;
  }
  if (/wind|flute/.test(txt)) {
    drawFlute(ctx, W * 0.5, H * 0.45, 1.2, a);
    return;
  }
  if (/percussion|drum/.test(txt)) {
    drawDrum(ctx, W * 0.5, H * 0.68, 1.15, a);
    drawSoundWaveArcs(ctx, W * 0.67, H * 0.56, 46, a);
    return;
  }

  drawGuitar(ctx, W * 0.26, H * 0.62, 0.95, a, t);
  drawFlute(ctx, W * 0.5, H * 0.45, 0.95, a);
  drawDrum(ctx, W * 0.76, H * 0.68, 0.92, a);
}
