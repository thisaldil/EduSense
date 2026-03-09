import {
  drawSunny,
  drawDeer,
  drawFoodBowl,
  drawDividerLine,
  drawArrowLine,
} from "../../core/shapes";
import { fadeIn } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "differences between plants and animals",
  "cell wall",
  "chlorophyll",
  "autotrophic vs heterotrophic",
  "plant characteristics",
  "animal characteristics",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = "#d6f1ff";
  ctx.fillRect(0, 0, W, H * 0.62);
  ctx.fillStyle = "#8ccc69";
  ctx.fillRect(0, H * 0.62, W * 0.5, H * 0.38);
  ctx.fillStyle = "#d7bf7a";
  ctx.fillRect(W * 0.5, H * 0.62, W * 0.5, H * 0.38);
  drawDividerLine(ctx, W * 0.5, 0, W * 0.5, H, 1);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSunny(ctx, W * 0.28, H * 0.72, t, true, 1, 1);
  drawDeer(ctx, W * 0.72, H * 0.77, 1.0, 1, t);
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

  drawSunny(ctx, W * 0.28, H * 0.72, t, true, 1, a);
  drawArrowLine(ctx, W * 0.38, H * 0.56, W * 0.28, H * 0.49, a);
  drawDeer(ctx, W * 0.72, H * 0.77, 1.0, a, t);
  drawFoodBowl(ctx, W * 0.72, H * 0.56, 0.82, a);

  if (/chlorophyll|sun|food/.test(txt)) return;
}
