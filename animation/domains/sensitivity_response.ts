/**
 * domains/sensitivity_response.ts — Sensitivity and Response to stimuli.
 * Uses inline canvas drawing — no missing shape imports.
 */

import { C, drawArrow, drawBolt, drawSoundWaveArcs } from "../core/shapes";
import { fadeIn, clamp01, easeOut } from "../core/easing";

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
  "stimuli",
  "reflex",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const sk = ctx.createLinearGradient(0, 0, 0, H);
  sk.addColorStop(0, "#bae6fd");
  sk.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = sk;
  ctx.fillRect(0, 0, W, H);
}

// ── Inline body/senses shapes ─────────────────────────────────────────────────

function _drawSimpleBody(ctx: Ctx, cx: number, cy: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.35;
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  // head
  ctx.beginPath();
  ctx.arc(cx, cy - 90, 22, 0, Math.PI * 2);
  ctx.stroke();
  // body
  ctx.beginPath();
  ctx.moveTo(cx, cy - 68);
  ctx.lineTo(cx, cy + 20);
  // arms
  ctx.moveTo(cx - 24, cy - 40);
  ctx.lineTo(cx + 24, cy - 40);
  // legs
  ctx.moveTo(cx, cy + 20);
  ctx.lineTo(cx - 16, cy + 70);
  ctx.moveTo(cx, cy + 20);
  ctx.lineTo(cx + 16, cy + 70);
  ctx.stroke();
  ctx.restore();
}

function _drawEye(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const blink = Math.abs(Math.sin(t * 0.4)) > 0.95 ? 0.1 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 28 * scale, 18 * scale * blink, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#0c4a6e";
  ctx.beginPath();
  ctx.arc(cx, cy, 10 * scale * blink, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx + 2, cy - 2, 5 * scale * blink, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 5, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawEar(ctx: Ctx, cx: number, cy: number, scale: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#F9A825";
  ctx.strokeStyle = "#E65100";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 24 * scale);
  ctx.bezierCurveTo(cx + 18 * scale, cy - 20 * scale, cx + 22 * scale, cy, cx + 14 * scale, cy + 18 * scale);
  ctx.bezierCurveTo(cx + 6 * scale, cy + 28 * scale, cx - 4 * scale, cy + 22 * scale, cx, cy + 24 * scale);
  ctx.bezierCurveTo(cx - 12 * scale, cy + 14 * scale, cx - 8 * scale, cy - 12 * scale, cx, cy - 24 * scale);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const cx = W * 0.5, cy = H * 0.5;
  _drawSimpleBody(ctx, cx, cy, 1);
  // sense organs
  _drawEye(ctx, W * 0.3, H * 0.34, 1.1, t, 0.9);
  _drawEar(ctx, W * 0.7, H * 0.38, 1.0, 0.9);
  // sound waves near ear
  drawSoundWaveArcs(ctx, W * 0.82, H * 0.38, t, 0.6);
  // light flash near eye
  drawBolt(ctx, W * 0.18, H * 0.34, 18, 0.7, "#FDD835");
  // reaction arrow
  drawArrow(ctx, W * 0.3, H * 0.52, 0, W * 0.4, C.arrowDef, 2.5, 0.5);
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
  _drawSimpleBody(ctx, W * 0.5, H * 0.5, a);

  if (/light|eye|sight|see|visible/.test(txt)) {
    _drawEye(ctx, W * 0.3, H * 0.34, 1.3, t, a);
    const lightA = fadeIn(elapsed, 400, 600);
    drawBolt(ctx, W * 0.14, H * 0.28, 22, lightA, "#FDD835");
    drawArrow(ctx, W * 0.22, H * 0.34, 0, W * 0.06, "#FDD835", 3, lightA);
    return;
  }

  if (/sound|ear|hear|noise/.test(txt)) {
    _drawEar(ctx, W * 0.7, H * 0.38, 1.3, a);
    drawSoundWaveArcs(ctx, W * 0.82, H * 0.36, t, a);
    return;
  }

  if (/touch|pain|hot|cold|skin/.test(txt)) {
    // nerve signals depicted as arrows
    const stimA = fadeIn(elapsed, 300, 500);
    drawArrow(ctx, W * 0.35, H * 0.62, -Math.PI / 2, easeOut(clamp01(elapsed / 1200)) * 90, "#CE93D8", 3, stimA);
    drawArrow(ctx, W * 0.5, H * 0.62, -Math.PI / 2, easeOut(clamp01((elapsed - 200) / 1200)) * 80, "#CE93D8", 3, stimA * 0.8);
    return;
  }

  // default: eye + sound
  _drawEye(ctx, W * 0.3, H * 0.34, 1.1, t, a);
  _drawEar(ctx, W * 0.7, H * 0.38, 1.0, a);
  drawArrow(ctx, W * 0.35, H * 0.5, 0, W * 0.3, C.arrowDef, 2.5, a * 0.7);
}
