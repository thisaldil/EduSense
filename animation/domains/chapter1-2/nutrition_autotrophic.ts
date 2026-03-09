import {
  C,
  drawBolt,
  drawCloud,
  drawCO2,
  drawGlucose,
  drawLightRay,
  drawSol,
  drawSunny,
  drawWaterDrop,
  drawO2,
} from "../../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../../core/easing";

type Ctx = any;

export const keywords = [
  "autotrophic",
  "photosynthesis",
  "carbon dioxide",
  "sunlight",
  "produce food",
  "green plants",
  "chlorophyll",
  "nutrition in plants",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sk.addColorStop(0, C.skyTop);
  sk.addColorStop(1, C.skyBot);
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H * 0.65);
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, H * 0.65, W, H * 0.35);
  ctx.fillStyle = C.grass;
  ctx.fillRect(0, H * 0.65, W, 22);
  drawCloud(ctx, W * 0.12, H * 0.09, 1.0);
  drawCloud(ctx, W * 0.72, H * 0.07, 0.75);
}

export function drawAnchorCharacters(ctx: Ctx, W: number, H: number, t: number): void {
  drawSunny(ctx, W * 0.28, H * 0.65, t, true, 1, 1);
  drawSol(ctx, W * 0.78, H * 0.14, 52, t, 1);
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
  const cx = W * 0.62;
  const cy = H * 0.38;

  if (/chemical|energy|store/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    drawBolt(ctx, cx - 40, cy, 32, a);
    const a2 = fadeIn(elapsed, 800, 600);
    if (a2 > 0) {
      ctx.save();
      ctx.globalAlpha = a2;
      ctx.strokeStyle = C.arrowDef;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy);
      ctx.lineTo(cx + 50, cy);
      ctx.stroke();
      ctx.restore();
      drawGlucose(ctx, cx + 95, cy, 32, a2, t, C.hexFill);
    }
    return;
  }

  if (/dioxide|co2/.test(txt)) {
    [0, 320, 640].forEach((delay, i) => {
      const travel = easeOut(clamp01((elapsed - delay) / 2400));
      drawCO2(
        ctx,
        lerp(W * 0.88, W * 0.48 + i * 10, travel),
        H * 0.26 + i * 38,
        26,
        fadeIn(elapsed, delay, 400),
      );
    });
    return;
  }

  if (/water|h2o/.test(txt)) {
    [0, 480, 960].forEach((delay, i) => {
      const rise = easeOut(clamp01((elapsed - delay) / 2200));
      drawWaterDrop(
        ctx,
        W * 0.32 + i * 12,
        lerp(H * 0.82, H * 0.4, rise),
        15,
        fadeIn(elapsed, delay, 400),
      );
    });
    return;
  }

  if (/oxygen|o2/.test(txt)) {
    [0, 240, 480].forEach((delay, i) => {
      drawO2(ctx, W * 0.45 + i * 26, H * 0.33 - i * 18, 18, fadeIn(elapsed, delay, 400));
    });
    return;
  }

  drawLightRay(ctx, W * 0.78, H * 0.21, W * 0.32, H * 0.52, fadeIn(elapsed, 280, 700));
}
