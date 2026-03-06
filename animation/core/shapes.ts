/**
 * core/shapes.ts — Primitive shape library ("LEGO bricks").
 * Pure draw functions only; no domain or actor logic.
 * EXPO-2D-CONTEXT SAFE (no createRadialGradient, setLineDash, fillText).
 */

import { lerp, rgba } from "./easing";

export type Ctx = any;

// Convenience math + paint helpers used by many shapes.
const PI2 = Math.PI * 2;

function setFill(ctx: Ctx, color: string, alpha = 1) {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
}

function setStroke(ctx: Ctx, color: string, width = 3, alpha = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
export const C = {
  skyTop: "#64B5F6",
  skyBot: "#B3E5FC",
  ground: "#8D6E63",
  grass: "#4CAF50",
  // Mixed grass + soil band for many biology scenes
  groundGrass: "#4CAF50",
  stemBrown: "#6D4C41",
  stemHL: "#A1887F",
  leafMid: "#66BB6A",
  leafDk: "#2E7D32",
  leafHL: "#A5D6A7",
  faceGreen: "#A5D6A7",
  eyeDk: "#1B5E20",
  sunY: "#FFE000",
  sunO: "#FFA000",
  sunDeep: "#E65100",
  rayY: "#FFD700",
  bolt: "#AB47BC",
  boltHL: "#CE93D8",
  water: "#29B6F6",
  waterDk: "#0288D1",
  co2Fill: "#CFD8DC",
  co2Edge: "#90A4AE",
  co2Dk: "#546E7A",
  hexFill: "#FF8F00",
  hexHL: "#FFD54F",
  arrowDef: "#1565C0",
  rockMid: "#795548",
  rockDk: "#5D4037",
  lava: "#F4511E",
  space: "#0D0D2B",
  // Environments for new Grade 6 topics
  savannaGround: "#D1A760",
  indoorWall: "#CFD8DC",
  groundRock: "#546E7A",
  white: "#FFFFFF",
};

// ─── Cloud ────────────────────────────────────────────────────────────────────
export function drawCloud(
  ctx: Ctx,
  cx: number,
  cy: number,
  scale: number,
  alpha = 0.85,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.white;
  const r = 20 * scale;
  [
    [0, 0, r],
    [r * 0.9, -r * 0.28, r * 0.78],
    [r * 1.75, r * 0.08, r * 0.88],
    [-r * 0.85, -r * 0.18, r * 0.72],
  ].forEach(([dx, dy, rad]) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, rad, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// ─── Sunny the Plant ──────────────────────────────────────────────────────────
export function drawSunny(
  ctx: Ctx,
  cx: number,
  gndY: number,
  t: number,
  glowing: boolean,
  scale: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, gndY);
  ctx.scale(scale, scale);
  const sw = Math.sin(t) * 4;

  ctx.strokeStyle = C.stemBrown;
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(sw, -40, sw * 0.5, -80, sw * 1.2, -130);
  ctx.stroke();
  ctx.strokeStyle = C.stemHL;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.bezierCurveTo(sw - 2, -40, sw * 0.5 - 2, -80, sw * 1.2 - 2, -130);
  ctx.stroke();

  const leaf = (
    tx: number,
    ty: number,
    rot: number,
    flip: boolean,
    len: number,
    hw: number,
  ) => {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(rot);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = C.leafMid;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.bezierCurveTo(-len * 0.5, -hw, 0, -hw * 0.5, 0, 0);
    ctx.bezierCurveTo(0, hw * 0.5, -len * 0.5, hw, -len, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.leafDk;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.bezierCurveTo(-len * 0.5, 0, 0, hw * 0.3, 0, 0);
    ctx.bezierCurveTo(-len * 0.5, hw, -len * 0.5, hw * 0.5, -len, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.leafDk;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(-len * 0.05, 0);
    ctx.stroke();
    ctx.restore();
  };
  leaf(sw * 0.6 - 10, -82, -0.55 + Math.sin(t * 0.7) * 0.05, false, 48, 22);
  leaf(sw * 0.8 + 10, -102, 0.6 + Math.sin(t * 0.7 + 1) * 0.05, true, 44, 20);
  leaf(sw * 1.2, -138, Math.sin(t * 0.5) * 0.06, false, 55, 25);

  if (glowing) {
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(t * 3) * 0.06;
    ctx.fillStyle = C.leafHL;
    ctx.beginPath();
    ctx.arc(sw * 0.7, -100, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const fx = sw * 0.7,
    fy = -55;
  ctx.fillStyle = C.faceGreen;
  ctx.beginPath();
  ctx.arc(fx, fy, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.leafDk;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fx, fy, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = C.eyeDk;
  ctx.beginPath();
  ctx.arc(fx - 6, fy - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(fx + 6, fy - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(fx - 5, fy - 5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(fx + 7, fy - 5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.eyeDk;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(fx, fy + 2, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
}

// ─── Sol the Sun ──────────────────────────────────────────────────────────────
export function drawSol(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  t: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.rayY;
  ctx.save();
  ctx.globalAlpha = alpha * 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 + t * 0.018;
    const rLen = r * 0.42 + Math.sin(t + i * 0.8) * r * 0.09;
    const w = 0.12;
    ctx.fillStyle = C.rayY;
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(ang - w) * (r + 2),
      cy + Math.sin(ang - w) * (r + 2),
    );
    ctx.lineTo(
      cx + Math.cos(ang) * (r + 2 + rLen),
      cy + Math.sin(ang) * (r + 2 + rLen),
    );
    ctx.lineTo(
      cx + Math.cos(ang + w) * (r + 2),
      cy + Math.sin(ang + w) * (r + 2),
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  const bg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  bg.addColorStop(0, "#FFF9C4");
  bg.addColorStop(1, C.sunO);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.sunDeep;
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.17, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.32, cy - r * 0.17, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.sunDeep;
  ctx.lineWidth = r * 0.08;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.1, r * 0.22, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();
}

// ─── Light ray (dot-chain) ────────────────────────────────────────────────────
export function drawLightRay(
  ctx: Ctx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  alpha: number,
  color = C.rayY,
) {
  if (alpha <= 0) return;
  const dx = x2 - x1,
    dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const n = Math.max(1, Math.floor(dist / 16));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const f = i / n;
    ctx.beginPath();
    ctx.arc(lerp(x1, x2, f), lerp(y1, y2, f), 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  const ang = Math.atan2(dy, dx),
    hs = 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x2 - Math.cos(ang - 0.4) * hs, y2 - Math.sin(ang - 0.4) * hs);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(ang + 0.4) * hs, y2 - Math.sin(ang + 0.4) * hs);
  ctx.stroke();
  ctx.restore();
}

// ─── Arrow (pure; actor data resolved in actorRenderers) ────────────────────────
export function drawArrow(
  ctx: Ctx,
  ax: number,
  ay: number,
  angle: number,
  length: number,
  color: string,
  thick: number,
  alpha: number,
) {
  if (alpha <= 0) return;
  const ex = ax + Math.cos(angle) * length;
  const ey = ay + Math.sin(angle) * length;
  const hs = 11;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = thick;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ex - Math.cos(angle - 0.4) * hs, ey - Math.sin(angle - 0.4) * hs);
  ctx.lineTo(ex, ey);
  ctx.lineTo(ex - Math.cos(angle + 0.4) * hs, ey - Math.sin(angle + 0.4) * hs);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Glucose hexagon ─────────────────────────────────────────────────────────
export function drawGlucose(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
  t: number,
  color = C.hexFill,
) {
  if (alpha <= 0) return;
  const pulse = 1 + Math.sin(t * 1.8) * 0.05;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = color;
  ctx.strokeStyle = C.sunDeep;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.hexHL;
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  const ri = r * 0.52;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    if (i === 0) ctx.moveTo(Math.cos(a) * ri, Math.sin(a) * ri);
    else ctx.lineTo(Math.cos(a) * ri, Math.sin(a) * ri);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.sunDeep;
  ctx.save();
  ctx.globalAlpha = alpha * 0.3;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      Math.cos(a) * r * 0.72,
      Math.sin(a) * r * 0.72,
      r * 0.07,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

// ─── Water drop ────────────────────────────────────────────────────────────────
export function drawWaterDrop(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
  color = C.water,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = C.waterDk;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.5);
  ctx.bezierCurveTo(cx + r, cy - r * 0.3, cx + r, cy + r * 0.7, cx, cy + r);
  ctx.bezierCurveTo(
    cx - r,
    cy + r * 0.7,
    cx - r,
    cy - r * 0.3,
    cx,
    cy - r * 1.5,
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.save();
  ctx.globalAlpha = alpha * 0.42;
  ctx.save();
  ctx.translate(cx - r * 0.3, cy - r * 0.55);
  ctx.scale(0.65, 1);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.fillStyle = C.waterDk;
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy + r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy + r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.waterDk;
  ctx.lineWidth = r * 0.1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.4, r * 0.22, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();
}

// ─── CO₂ bubble ───────────────────────────────────────────────────────────────
export function drawCO2(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.co2Fill;
  ctx.strokeStyle = C.co2Edge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const d = r * 0.14;
  ctx.fillStyle = C.co2Dk;
  ctx.beginPath();
  ctx.arc(cx - r * 0.38, cy, d * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.co2Edge;
  ctx.beginPath();
  ctx.arc(cx + r * 0.18, cy - r * 0.22, d, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.18, cy + r * 0.22, d, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.co2Dk;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.24, cy - r * 0.12);
  ctx.lineTo(cx + r * 0.08, cy - r * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.24, cy + r * 0.12);
  ctx.lineTo(cx + r * 0.08, cy + r * 0.2);
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.save();
  ctx.globalAlpha = alpha * 0.28;
  ctx.save();
  ctx.translate(cx - r * 0.3, cy - r * 0.35);
  ctx.scale(1.5, 1);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

// ─── Energy bolt ──────────────────────────────────────────────────────────────
export function drawBolt(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  color = C.bolt,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.25, cy - size);
  ctx.lineTo(cx - size * 0.3, cy + size * 0.1);
  ctx.lineTo(cx + size * 0.08, cy + size * 0.1);
  ctx.lineTo(cx - size * 0.25, cy + size);
  ctx.lineTo(cx + size * 0.38, cy - size * 0.05);
  ctx.lineTo(cx - size * 0.05, cy - size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = C.boltHL;
  ctx.save();
  ctx.globalAlpha = alpha * 0.42;
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.1, cy - size * 0.8);
  ctx.lineTo(cx - size * 0.1, cy + size * 0.05);
  ctx.lineTo(cx + size * 0.05, cy + size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

// ─── Rock ─────────────────────────────────────────────────────────────────────
export function drawRock(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
  color = C.rockMid,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = C.rockDk;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy + r * 0.3);
  ctx.bezierCurveTo(
    cx - r * 0.9,
    cy - r,
    cx - r * 0.2,
    cy - r * 1.1,
    cx + r * 0.3,
    cy - r * 0.9,
  );
  ctx.bezierCurveTo(
    cx + r,
    cy - r * 0.7,
    cx + r * 1.1,
    cy - r * 0.1,
    cx + r,
    cy + r * 0.4,
  );
  ctx.bezierCurveTo(
    cx + r * 0.8,
    cy + r,
    cx - r * 0.4,
    cy + r,
    cx - r,
    cy + r * 0.3,
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.save();
  ctx.globalAlpha = alpha * 0.18;
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

// ─── Planet / sphere ─────────────────────────────────────────────────────────
export function drawPlanet(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
  color = "#42A5F5",
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = rgba("#000000", 0.22);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.save();
  ctx.globalAlpha = alpha * 0.28;
  ctx.save();
  ctx.translate(cx - r * 0.28, cy - r * 0.28);
  ctx.scale(1.2, 1);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

// ─── Concept pill (generic label fallback) ────────────────────────────────────
export function drawConceptPill(
  ctx: Ctx,
  cx: number,
  cy: number,
  alpha: number,
  color = C.arrowDef,
) {
  if (alpha <= 0) return;
  const pw = 78,
    ph = 26,
    pr = ph / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rgba(color, 0.16);
  ctx.strokeStyle = rgba(color, 0.55);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - pw / 2 + pr, cy - ph / 2);
  ctx.lineTo(cx + pw / 2 - pr, cy - ph / 2);
  ctx.arc(cx + pw / 2 - pr, cy, pr, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(cx - pw / 2 + pr, cy + ph / 2);
  ctx.arc(cx - pw / 2 + pr, cy, pr, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = rgba(color, 0.65);
  [-pw * 0.2, 0, pw * 0.2].forEach((dx) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// ─── Additional Grade 6 shapes (sample from full library) ─────────────────────

export function drawSproutingSeedling(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  bob = 0,
  alpha = 1,
) {
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // stem
  setStroke(ctx, "#22c55e", 9);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(4, -38, -6, -72);
  ctx.stroke();
  // leaves
  setFill(ctx, "#4ade80");
  ctx.beginPath();
  ctx.ellipse(-14, -52, 19, 9, -0.7, 0, PI2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(13, -56, 17, 8, 0.5, 0, PI2);
  ctx.fill();
  // seed
  setFill(ctx, "#854d0e");
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 10, 0, 0, PI2);
  ctx.fill();
  // happy face
  setFill(ctx, "#fff");
  ctx.beginPath();
  ctx.arc(0, -78, 9, 0, PI2);
  ctx.fill();
  setFill(ctx, "#000");
  ctx.beginPath();
  ctx.arc(-3.5, -80, 2, 0, PI2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3.5, -80, 2, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawGreyRock(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  alpha = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#64748b");
  ctx.beginPath();
  ctx.moveTo(-42, 5);
  ctx.lineTo(-35, -22);
  ctx.lineTo(-12, -28);
  ctx.lineTo(18, -19);
  ctx.lineTo(38, 8);
  ctx.lineTo(31, 27);
  ctx.lineTo(-38, 25);
  ctx.closePath();
  ctx.fill();
  setStroke(ctx, "#475569", 5);
  ctx.stroke();
  ctx.restore();
}

// ─── Animal diversity shapes ───────────────────────────────────────────────────

export function drawFish(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // body
  setFill(ctx, "#3b82f6");
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.quadraticCurveTo(-8, -18, 18, -6);
  ctx.quadraticCurveTo(22, 0, 18, 6);
  ctx.quadraticCurveTo(-8, 18, -26, 0);
  ctx.closePath();
  ctx.fill();
  // tail
  setFill(ctx, "#1d4ed8");
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-40, -10);
  ctx.lineTo(-40, 10);
  ctx.closePath();
  ctx.fill();
  // eye
  setFill(ctx, "#fff");
  ctx.beginPath();
  ctx.arc(10, -4, 3, 0, PI2);
  ctx.fill();
  setFill(ctx, "#0f172a");
  ctx.beginPath();
  ctx.arc(10, -4, 1.5, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawBird(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // body
  setFill(ctx, "#f97316");
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, PI2);
  ctx.fill();
  // belly
  setFill(ctx, "#fed7aa", 0.85);
  ctx.beginPath();
  ctx.arc(0, 4, 10, 0, PI2);
  ctx.fill();
  // wing
  setFill(ctx, "#ea580c");
  ctx.beginPath();
  ctx.moveTo(-2, -4);
  ctx.quadraticCurveTo(-14, -10, -18, 2);
  ctx.quadraticCurveTo(-4, 2, -2, -4);
  ctx.fill();
  // beak
  setFill(ctx, "#fbbf24");
  ctx.beginPath();
  ctx.moveTo(14, -2);
  ctx.lineTo(22, 0);
  ctx.lineTo(14, 2);
  ctx.closePath();
  ctx.fill();
  // eye
  setFill(ctx, "#111827");
  ctx.beginPath();
  ctx.arc(5, -5, 2, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawInsect(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#22c55e");
  // abdomen
  ctx.beginPath();
  ctx.arc(-6, 0, 6, 0, PI2);
  ctx.fill();
  // thorax
  setFill(ctx, "#16a34a");
  ctx.beginPath();
  ctx.arc(4, 0, 5, 0, PI2);
  ctx.fill();
  // head
  setFill(ctx, "#15803d");
  ctx.beginPath();
  ctx.arc(11, 0, 4, 0, PI2);
  ctx.fill();
  // legs
  setStroke(ctx, "#166534", 2, alpha);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 3);
    ctx.lineTo(-10, i * 4 + (i === 0 ? 2 : 0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * 3);
    ctx.lineTo(10, i * 4 + (i === 0 ? -2 : 0));
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFrog(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // body
  setFill(ctx, "#22c55e");
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, PI2);
  ctx.fill();
  // legs
  setStroke(ctx, "#166534", 3, alpha);
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.lineTo(-14, 14);
  ctx.lineTo(-6, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, 8);
  ctx.lineTo(14, 14);
  ctx.lineTo(6, 14);
  ctx.stroke();
  // eyes
  setFill(ctx, "#bbf7d0");
  ctx.beginPath();
  ctx.arc(-6, -10, 4, 0, PI2);
  ctx.arc(6, -10, 4, 0, PI2);
  ctx.fill();
  setFill(ctx, "#166534");
  ctx.beginPath();
  ctx.arc(-6, -10, 2, 0, PI2);
  ctx.arc(6, -10, 2, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawDeer(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // body
  setFill(ctx, "#b45309");
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.quadraticCurveTo(0, -14, 22, -2);
  ctx.quadraticCurveTo(16, 10, -12, 10);
  ctx.closePath();
  ctx.fill();
  // legs
  setStroke(ctx, "#78350f", 3, alpha);
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.lineTo(-8, 22);
  ctx.moveTo(4, 10);
  ctx.lineTo(4, 22);
  ctx.stroke();
  // neck + head
  ctx.beginPath();
  ctx.moveTo(12, -4);
  ctx.lineTo(16, -18);
  ctx.stroke();
  setFill(ctx, "#b45309");
  ctx.beginPath();
  ctx.arc(18, -20, 6, 0, PI2);
  ctx.fill();
  // antlers
  setStroke(ctx, "#78350f", 2, alpha);
  ctx.beginPath();
  ctx.moveTo(18, -25);
  ctx.lineTo(14, -32);
  ctx.moveTo(18, -25);
  ctx.lineTo(22, -32);
  ctx.stroke();
  ctx.restore();
}

// ─── Plant diversity shapes ────────────────────────────────────────────────────

export function drawTallTree(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // trunk
  setFill(ctx, "#78350f");
  ctx.fillRect(-6, -30, 12, 30);
  // canopy
  setFill(ctx, "#16a34a");
  ctx.beginPath();
  ctx.arc(0, -40, 18, 0, PI2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-12, -32, 14, 0, PI2);
  ctx.arc(12, -32, 14, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawSmallShrub(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#22c55e");
  ctx.beginPath();
  ctx.arc(-10, 0, 10, 0, PI2);
  ctx.arc(0, -4, 11, 0, PI2);
  ctx.arc(10, 0, 10, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawVineCreeper(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setStroke(ctx, "#15803d", 3, alpha);
  ctx.beginPath();
  ctx.moveTo(-20, 10);
  ctx.quadraticCurveTo(-10, 0, 0, -8);
  ctx.quadraticCurveTo(10, -16, 18, -22);
  ctx.stroke();
  // leaves
  setFill(ctx, "#16a34a");
  for (let i = 0; i < 4; i++) {
    const lx = -14 + i * 10;
    const ly = 6 - i * 6;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + 4, ly - 4, lx + 8, ly);
    ctx.quadraticCurveTo(lx + 4, ly + 4, lx, ly);
    ctx.fill();
  }
  ctx.restore();
}

export function drawWaterLily(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // pad
  setFill(ctx, "#22c55e", 0.9);
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, PI2);
  ctx.fill();
  // flower
  setFill(ctx, "#f97316");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI2;
    const px = Math.cos(a) * 8;
    const py = Math.sin(a) * 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(px, py);
    ctx.lineTo(px * 0.6, py * 0.6);
    ctx.closePath();
    ctx.fill();
  }
  setFill(ctx, "#fed7aa");
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, PI2);
  ctx.fill();
  ctx.restore();
}

// ─── Misc biology shapes used by domains ──────────────────────────────────────

export function drawLeafRoot(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // leaf
  setFill(ctx, "#16a34a");
  ctx.beginPath();
  ctx.moveTo(-20, -4);
  ctx.quadraticCurveTo(0, -20, 18, -4);
  ctx.quadraticCurveTo(0, 12, -20, -4);
  ctx.fill();
  // root bundle
  setStroke(ctx, "#78350f", 2, alpha);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 18);
  ctx.moveTo(-4, 2);
  ctx.lineTo(-8, 18);
  ctx.moveTo(4, 2);
  ctx.lineTo(8, 18);
  ctx.stroke();
  ctx.restore();
}

export function drawFoodBowl(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#eab308");
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.quadraticCurveTo(0, 14, 16, 0);
  ctx.lineTo(16, 8);
  ctx.quadraticCurveTo(0, 18, -16, 8);
  ctx.closePath();
  ctx.fill();
  setFill(ctx, "#facc15");
  ctx.beginPath();
  ctx.arc(-6, -2, 3, 0, PI2);
  ctx.arc(0, -3, 3, 0, PI2);
  ctx.arc(6, -2, 3, 0, PI2);
  ctx.fill();
  ctx.restore();
}

// ─── Microorganism shapes ─────────────────────────────────────────────────────

export function drawMicroscopeSilhouette(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha * 0.6;
  setFill(ctx, "#0f172a");
  ctx.fillRect(-6, 12, 24, 4);
  ctx.beginPath();
  ctx.moveTo(-4, 12);
  ctx.lineTo(0, -8);
  ctx.lineTo(4, -6);
  ctx.lineTo(0, 12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -12, 4, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawBlobOrganism(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#22d3ee", 0.9);
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(-10, -14, 0, -10);
  ctx.quadraticCurveTo(14, -6, 12, 8);
  ctx.quadraticCurveTo(0, 14, -12, 8);
  ctx.closePath();
  ctx.fill();
  setFill(ctx, "#06b6d4");
  ctx.beginPath();
  ctx.arc(-4, -2, 3, 0, PI2);
  ctx.arc(4, 2, 2.5, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawMagnifyingCircle(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setStroke(ctx, "#e5e7eb", 4, alpha);
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, PI2);
  ctx.stroke();
  setStroke(ctx, "#9ca3af", 4, alpha);
  ctx.beginPath();
  ctx.moveTo(18, 18);
  ctx.lineTo(32, 32);
  ctx.stroke();
  ctx.restore();
}

// ─── Sensitivity & response shapes ────────────────────────────────────────────

export function drawCartoonCharacter(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  // body
  setFill(ctx, "#60a5fa");
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, PI2);
  ctx.fill();
  // head
  setFill(ctx, "#bfdbfe");
  ctx.beginPath();
  ctx.arc(0, -16, 10, 0, PI2);
  ctx.fill();
  // eyes
  setFill(ctx, "#111827");
  ctx.beginPath();
  ctx.arc(-3, -18, 2, 0, PI2);
  ctx.arc(3, -18, 2, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawEye(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#e5e7eb");
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(0, -10, 14, 0);
  ctx.quadraticCurveTo(0, 10, -14, 0);
  ctx.fill();
  setFill(ctx, "#1d4ed8");
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, PI2);
  ctx.fill();
  setFill(ctx, "#0f172a");
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawEar(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#fed7aa");
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.quadraticCurveTo(10, -10, 8, 8);
  ctx.quadraticCurveTo(-4, 14, -8, -14);
  ctx.fill();
  ctx.restore();
}

export function drawLightFlash(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#facc15");
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI2;
    const x1 = Math.cos(a) * 4;
    const y1 = Math.sin(a) * 4;
    const x2 = Math.cos(a) * 16;
    const y2 = Math.sin(a) * 16;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawSoundWave(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setStroke(ctx, "#0ea5e9", 3, alpha);
  for (let r = 6; r <= 16; r += 4) {
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawReactionArrow(
  ctx: Ctx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  alpha = 1,
) {
  drawArrow(ctx, x1, y1, Math.atan2(y2 - y1, x2 - x1), Math.hypot(x2 - x1, y2 - y1), C.arrowDef, 4, alpha);
}

// ─── Reproduction shapes ──────────────────────────────────────────────────────

export function drawParentPlant(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  drawTallTree(ctx, x, y, scale * 1.1, 0, alpha);
}

export function drawBabySprouts(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  drawSproutingSeedling(ctx, x - 10 * scale, y, scale * 0.7, 0, alpha);
  drawSproutingSeedling(ctx, x + 10 * scale, y + 4 * scale, scale * 0.7, 0, alpha);
}

export function drawSeed(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#854d0e");
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.quadraticCurveTo(0, -6, 8, 0);
  ctx.quadraticCurveTo(0, 6, -8, 0);
  ctx.fill();
  ctx.restore();
}

// ─── Respiration shapes ───────────────────────────────────────────────────────

export function drawLungs(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  breathe = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  const r = 18 + breathe * 0.4;
  setFill(ctx, "#fecaca");
  ctx.beginPath();
  ctx.arc(-10, 0, r, 0, PI2);
  ctx.arc(10, 0, r, 0, PI2);
  ctx.fill();
  setStroke(ctx, "#fb7185", 3, alpha);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(0, -r - 10);
  ctx.stroke();
  ctx.restore();
}

export function drawO2Bubble(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  setFill(ctx, "#bfdbfe", 0.9);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, PI2);
  ctx.fill();
  ctx.restore();
}

export function drawCO2Bubble(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  alpha = 1,
) {
  drawCO2(ctx, x, y, r, alpha);
}

// ─── Movement & locomotion shapes ─────────────────────────────────────────────

export function drawBirdFlying(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  t = 0,
  alpha = 1,
) {
  const flap = Math.sin(t * 0.2) * 0.3;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(flap);
  drawBird(ctx, 0, 0, 1, 0, alpha);
  ctx.restore();
}

export function drawFishSwimming(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  t = 0,
  alpha = 1,
) {
  const sway = Math.sin(t * 0.2) * 4;
  drawFish(ctx, x + sway, y, scale, 0, alpha);
}

export function drawWalkingCat(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#f97316");
  ctx.fillRect(-14, -6, 28, 12);
  setFill(ctx, "#fed7aa");
  ctx.beginPath();
  ctx.arc(14, -6, 8, 0, PI2);
  ctx.fill();
  setStroke(ctx, "#7c2d12", 3, alpha);
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.lineTo(-8, 18);
  ctx.moveTo(0, 6);
  ctx.lineTo(0, 18);
  ctx.moveTo(8, 6);
  ctx.lineTo(8, 18);
  ctx.stroke();
  ctx.restore();
}

export function drawPlantBending(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  t = 0,
  alpha = 1,
) {
  const wobble = Math.sin(t * 0.15) * 0.4;
  drawSunny(ctx, x, y, t, true, scale, alpha);
}

// ─── Nutrition (heterotrophic) shapes ─────────────────────────────────────----

export function drawGrassClump(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setStroke(ctx, "#16a34a", 3, alpha);
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 3, 0);
    ctx.lineTo(i * 2, -12 - Math.abs(i) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLion(
  ctx: Ctx,
  x: number,
  y: number,
  scale = 1,
  _t = 0,
  alpha = 1,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  setFill(ctx, "#f59e0b");
  ctx.beginPath();
  ctx.arc(0, -6, 8, 0, PI2);
  ctx.fill();
  setFill(ctx, "#c2410c");
  ctx.beginPath();
  ctx.arc(0, -6, 12, 0, PI2);
  ctx.fill();
  ctx.restore();
}

// ─── Water cycle helper shapes (alt domain) ───────────────────────────────────

export function drawWaterDropsRising(ctx: Ctx, x: number, y: number) {
  for (let i = 0; i < 3; i++) {
    drawWaterDrop(ctx, x + i * 16, y - i * 18, 10, 0.85);
  }
}

export function drawFallingRain(ctx: Ctx, x: number, y: number) {
  setStroke(ctx, "#38bdf8", 2, 0.9);
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 8, y);
    ctx.lineTo(x + i * 8 - 2, y + 16);
    ctx.stroke();
  }
}
