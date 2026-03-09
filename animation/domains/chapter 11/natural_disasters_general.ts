import {
  drawStormCloud,
  drawLightningBolt,
  drawCycloneSpiral,
  drawRainDrops,
  drawWarningTriangle,
  drawDisasterPanelDivider,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "natural disaster",
  "storm",
  "cyclone",
  "lightning",
  "thunder",
  "severe weather",
  "weather disaster",
  "extreme weather",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#6f7b90");
  g.addColorStop(1, "#cdd6e2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawDisasterPanelDivider(ctx, W * 0.5, H * 0.1, W * 0.5, H * 0.9, 0.45);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawStormCloud(ctx, W * 0.26, H * 0.24, 1.0, 1, t);
  drawLightningBolt(ctx, W * 0.26, H * 0.44, 0.9, 1);
  drawCycloneSpiral(ctx, W * 0.72, H * 0.48, 1.0, 1, t);
  drawRainDrops(ctx, W * 0.26, H * 0.52, 5, 0.9);
  drawWarningTriangle(ctx, W * 0.5, H * 0.78, 0.9, 1);
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

  if (/lightning|thunder/.test(txt)) {
    drawStormCloud(ctx, W * 0.5, H * 0.24, 1.1, a, t);
    drawLightningBolt(ctx, W * 0.5, H * 0.46, 1.0, a);
    return;
  }
  if (/cyclone|storm/.test(txt)) {
    drawCycloneSpiral(ctx, W * 0.5, H * 0.48, 1.15, a, t);
    drawWarningTriangle(ctx, W * 0.5, H * 0.76, 0.85, a);
    return;
  }

  drawStormCloud(ctx, W * 0.32, H * 0.24, 0.95, a, t);
  drawLightningBolt(ctx, W * 0.32, H * 0.46, 0.85, a);
  drawCycloneSpiral(ctx, W * 0.7, H * 0.48, 0.95, a, t);
}
