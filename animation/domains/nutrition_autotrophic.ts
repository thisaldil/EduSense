/**
 * domains/nutrition_autotrophic.ts — Background, anchors, and keyword fallback for Nutrition — Autotrophic (Plants).
 */

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
} from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

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

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
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
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy);
      ctx.lineTo(cx + 50, cy);
      ctx.stroke();
      ctx.fillStyle = C.arrowDef;
      ctx.beginPath();
      ctx.moveTo(cx + 41, cy - 7);
      ctx.lineTo(cx + 52, cy);
      ctx.lineTo(cx + 41, cy + 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawGlucose(ctx, cx + 95, cy, 38 * 0.85, a2, t, C.hexFill);
    }
    return;
  }
  if (/inside|chloroplast|cell|leaf/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    const pulse = 0.9 + Math.sin(t * 1.5) * 0.08;
    ctx.save();
    ctx.globalAlpha = a * 0.32;
    ctx.fillStyle = C.leafHL;
    ctx.save();
    ctx.translate(W * 0.3, H * 0.35);
    ctx.scale(1.55, 1);
    ctx.beginPath();
    ctx.arc(0, 0, 44 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = C.leafDk;
    ctx.lineWidth = 2.5;
    ctx.save();
    ctx.translate(W * 0.3, H * 0.35);
    ctx.scale(1.55, 1);
    ctx.beginPath();
    ctx.arc(0, 0, 44 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    drawBolt(ctx, W * 0.3, H * 0.35, 20, fadeIn(elapsed, 900, 500));
    return;
  }
  if (/dioxide|co2/.test(txt)) {
    [0, 320, 640].forEach((delay, i) => {
      const travel = easeOut(clamp01((elapsed - delay) / 2400));
      const bx = lerp(W * 0.88, W * 0.45 + i * 12, travel);
      const by = H * 0.28 + i * 40;
      drawCO2(ctx, bx, by, 28, fadeIn(elapsed, delay, 400));
    });
    return;
  }
  if (/water|h2o/.test(txt)) {
    [0, 480, 960].forEach((delay, i) => {
      const rise = easeOut(clamp01((elapsed - delay) / 2100));
      drawWaterDrop(
        ctx,
        W * 0.32 + i * 14,
        lerp(H * 0.82, H * 0.38, rise),
        16,
        fadeIn(elapsed, delay, 400),
      );
    });
    return;
  }
  const a = fadeIn(elapsed, 300, 800);
  drawLightRay(ctx, W * 0.76, H * 0.15 + 54, W * 0.32, H * 0.52, a);
}
