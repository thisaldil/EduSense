/**
 * domains/humanBody.ts — Human body anatomy background and fallback visuals.
 */

import { C, drawArrow, drawBolt, drawWaterDrop } from "../core/shapes";
import { clamp01, easeOut, fadeIn, lerp } from "../core/easing";

type Ctx = any;

export const keywords = [
  "heart",
  "lung",
  "blood",
  "digestive",
  "nervous system",
  "organ",
  "muscle",
  "bone",
  "cell division",
  "skeleton",
  "immune",
  "circulatory",
  "human body",
  "body system",
  "pulse",
  "brain",
  "stomach",
  "kidney",
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#FFEBEE");
  bg.addColorStop(1, "#FCE4EC");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

// ── Inline body silhouette ────────────────────────────────────────────────────

function _drawBodyOutline(ctx: Ctx, cx: number, cy: number, scale: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.25;
  ctx.strokeStyle = "#EF9A9A";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  // head
  ctx.beginPath();
  ctx.arc(cx, cy - 110 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.stroke();

  // torso
  ctx.beginPath();
  ctx.moveTo(cx - 36 * scale, cy - 80 * scale);
  ctx.lineTo(cx - 36 * scale, cy + 30 * scale);
  ctx.lineTo(cx - 20 * scale, cy + 90 * scale); // left leg
  ctx.moveTo(cx + 36 * scale, cy - 80 * scale);
  ctx.lineTo(cx + 36 * scale, cy + 30 * scale);
  ctx.lineTo(cx + 20 * scale, cy + 90 * scale); // right leg
  ctx.moveTo(cx - 36 * scale, cy - 80 * scale);
  ctx.lineTo(cx + 36 * scale, cy - 80 * scale); // shoulders
  ctx.stroke();

  // arms
  ctx.beginPath();
  ctx.moveTo(cx - 36 * scale, cy - 60 * scale);
  ctx.lineTo(cx - 65 * scale, cy + 20 * scale);
  ctx.moveTo(cx + 36 * scale, cy - 60 * scale);
  ctx.lineTo(cx + 65 * scale, cy + 20 * scale);
  ctx.stroke();

  ctx.restore();
}

function _drawHeart(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const pulse = 1 + Math.sin(t * 4.2) * 0.08;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#E53935";
  ctx.translate(cx, cy);
  ctx.scale(scale * pulse, scale * pulse);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-28, -10, -28, -30, -14, -30);
  ctx.bezierCurveTo(-6, -30, 0, -22, 0, -18);
  ctx.bezierCurveTo(0, -22, 6, -30, 14, -30);
  ctx.bezierCurveTo(28, -30, 28, -10, 0, 6);
  ctx.fill();
  ctx.restore();
}

function _drawLungsSimple(ctx: Ctx, cx: number, cy: number, scale: number, t: number, alpha: number): void {
  const breathe = 1 + Math.sin(t * 0.9) * 0.06;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#F48FB1";
  ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(244,143,177,0.2)";
  [-1, 1].forEach((side) => {
    const lx = cx + side * 28 * scale * breathe;
    ctx.beginPath();
    ctx.ellipse(lx, cy, 22 * scale * breathe, 36 * scale * breathe, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const cx = W * 0.5, cy = H * 0.46;
  _drawBodyOutline(ctx, cx, cy, 1.0, 1);
  _drawHeart(ctx, cx - 15, cy - 28, 0.9, t, 0.85);
  _drawLungsSimple(ctx, cx, cy - 18, 0.85, t, 0.7);
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
  const cx = W * 0.5, cy = H * 0.46;
  _drawBodyOutline(ctx, cx, cy, 1.0, fadeIn(elapsed, 0, 500));

  if (/heart|cardiac|circulatory|blood pump/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    _drawHeart(ctx, cx - 15, cy - 28, 1.1, t, a);
    // blood flow arrows
    const arrowA = fadeIn(elapsed, 700, 600);
    drawArrow(ctx, cx + 22, cy - 45, 0.4, 70, "#EF9A9A", 3, arrowA);
    drawArrow(ctx, cx - 22, cy - 10, Math.PI + 0.4, 70, "#E53935", 3, arrowA);
    return;
  }

  if (/lung|breath|oxygen|respiratory/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    _drawLungsSimple(ctx, cx, cy - 18, 1.1, t, a);
    // O2 label
    const o2a = fadeIn(elapsed, 600, 500);
    ctx.save();
    ctx.globalAlpha = o2a;
    ctx.fillStyle = "#66BB6A";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("O₂ in", cx - 80, cy - 50);
    ctx.fillStyle = "#EF9A9A";
    ctx.fillText("CO₂ out", cx + 80, cy - 50);
    ctx.restore();
    return;
  }

  if (/digest|stomach|intestine|food/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = "#FF8A65";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 40);
    ctx.bezierCurveTo(cx + 40, cy - 10, cx - 30, cy + 30, cx + 20, cy + 70);
    ctx.stroke();
    const dropA = fadeIn(elapsed, 800, 600);
    drawWaterDrop(ctx, cx - 40, cy + 20, 10, dropA, "#FF8A65");
    ctx.restore();
    return;
  }

  if (/nervous|brain|nerve|signal/.test(txt)) {
    const a = fadeIn(elapsed, 200, 700);
    // brain ellipse
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(206,147,216,0.35)";
    ctx.strokeStyle = "#9C27B0";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 80, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // nerve lines
    const nerveA = fadeIn(elapsed, 600, 500);
    ctx.strokeStyle = "#CE93D8"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    [[cx, cy - 58], [cx - 15, cy - 55], [cx + 15, cy - 55]].forEach(([nx, ny]) => {
      ctx.beginPath(); ctx.moveTo(cx, cy - 58); ctx.lineTo(nx as number, (ny as number) + 60); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.restore();
    return;
  }

  // Default: heart + body
  const a = fadeIn(elapsed, 300, 700);
  _drawHeart(ctx, cx - 15, cy - 28, 1.0, t, a);
  _drawLungsSimple(ctx, cx + 18, cy - 18, 0.75, t, a * 0.6);
}
