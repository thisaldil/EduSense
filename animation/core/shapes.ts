/**
 * animation/core/shapes.ts
 * Primitive drawing helpers used by actor and scene renderers.
 */

import { clamp01, lerp, pulse, rgba } from "./easing";

export type Ctx = CanvasRenderingContext2D | any;

const TAU = Math.PI * 2;

export const C = {
  skyTop: "#9DD6FF",
  skyBottom: "#DFF3FF",
  soilTop: "#8D6E63",
  soilBottom: "#5D4037",
  grass: "#5DBB63",
  sunCore: "#FFE066",
  sunEdge: "#FF9800",
  ray: "#FFD54F",
  plantStem: "#6D4C41",
  leafMain: "#4CAF50",
  leafDark: "#2E7D32",
  water: "#29B6F6",
  waterDark: "#0288D1",
  co2Fill: "#CFD8DC",
  co2Stroke: "#78909C",
  glucose: "#FF9800",
  glucoseStroke: "#E65100",
  oxygenFill: "#D6F5DD",
  oxygenStroke: "#2E7D32",
  bolt: "#AB47BC",
  rock: "#795548",
  rockDark: "#5D4037",
  arrow: "#1565C0",
  cardText: "#0F172A",
  white: "#FFFFFF",
};

function beginRoundedRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w * 0.5, h * 0.5));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
    return;
  }
  beginRoundedRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function strokeRoundedRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();
    return;
  }
  beginRoundedRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

export function drawCloud(
  ctx: Ctx,
  cx: number,
  cy: number,
  scale = 1,
  alpha = 1,
) {
  const r = 20 * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.white;
  [
    [0, 0, r],
    [r * 0.95, -r * 0.3, r * 0.82],
    [r * 1.9, 0, r * 0.9],
    [-r * 0.82, -r * 0.2, r * 0.72],
  ].forEach(([dx, dy, rr]) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, rr, 0, TAU);
    ctx.fill();
  });
  ctx.restore();
}

export function drawSol(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  t: number,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  for (let i = 0; i < 12; i += 1) {
    const ang = (i / 12) * TAU + t * 0.7;
    const rayLen = radius * 0.42 + Math.sin(t * 2 + i) * radius * 0.08;
    ctx.strokeStyle = rgba(C.ray, 0.9);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(ang) * (radius + 2),
      cy + Math.sin(ang) * (radius + 2),
    );
    ctx.lineTo(
      cx + Math.cos(ang) * (radius + rayLen),
      cy + Math.sin(ang) * (radius + rayLen),
    );
    ctx.stroke();
  }

  const grad = ctx.createRadialGradient(
    cx - radius * 0.25,
    cy - radius * 0.25,
    1,
    cx,
    cy,
    radius,
  );
  grad.addColorStop(0, "#FFF9C4");
  grad.addColorStop(0.5, C.sunCore);
  grad.addColorStop(1, C.sunEdge);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#B45309";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.25, cy - radius * 0.1, radius * 0.08, 0, TAU);
  ctx.arc(cx + radius * 0.25, cy - radius * 0.1, radius * 0.08, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#B45309";
  ctx.lineWidth = Math.max(1.2, radius * 0.06);
  ctx.beginPath();
  ctx.arc(cx, cy + radius * 0.08, radius * 0.2, 0.25, Math.PI - 0.25);
  ctx.stroke();

  ctx.restore();
}

export function drawSunny(
  ctx: Ctx,
  cx: number,
  groundY: number,
  t: number,
  glowing = false,
  scale = 1,
  alpha = 1,
) {
  const s = Math.max(0.25, scale);
  const sway = Math.sin(t * 1.4) * 5;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, groundY);
  ctx.scale(s, s);

  ctx.strokeStyle = C.plantStem;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(sway, -38, sway * 0.8, -84, sway * 1.35, -132);
  ctx.stroke();

  const drawLeaf = (
    tx: number,
    ty: number,
    rotation: number,
    flip = false,
    length = 46,
    width = 22,
  ) => {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(rotation);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = C.leafMain;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.bezierCurveTo(-length * 0.45, -width, 0, -width * 0.5, 0, 0);
    ctx.bezierCurveTo(0, width * 0.5, -length * 0.45, width, -length, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.leafDark;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.lineTo(-6, 0);
    ctx.stroke();
    ctx.restore();
  };

  drawLeaf(sway * 0.45 - 8, -78, -0.55);
  drawLeaf(sway * 0.85 + 8, -98, 0.58, true);

  const faceX = sway * 1.2;
  const faceY = -144;
  if (glowing) {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(t * 3.2) * 0.05;
    ctx.fillStyle = rgba(C.leafMain, 0.6);
    ctx.beginPath();
    ctx.arc(faceX, faceY, 52, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#A5D6A7";
  ctx.beginPath();
  ctx.arc(faceX, faceY, 20, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = C.leafDark;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#1B5E20";
  ctx.beginPath();
  ctx.arc(faceX - 6, faceY - 4, 2.8, 0, TAU);
  ctx.arc(faceX + 6, faceY - 4, 2.8, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#1B5E20";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(faceX, faceY + 2, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
}

export function drawWaterDrop(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  alpha = 1,
  color = C.water,
) {
  const r = Math.max(2, radius);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = C.waterDark;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.45);
  ctx.bezierCurveTo(cx + r, cy - r * 0.3, cx + r, cy + r * 0.7, cx, cy + r);
  ctx.bezierCurveTo(cx - r, cy + r * 0.7, cx - r, cy - r * 0.3, cx, cy - r * 1.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = rgba(C.white, 0.45);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.5, r * 0.22, r * 0.34, -0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawCO2(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  alpha = 1,
) {
  const r = Math.max(4, radius);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.co2Fill;
  ctx.strokeStyle = C.co2Stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#455A64";
  ctx.font = `bold ${Math.max(9, r * 0.58)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CO2", cx, cy);
  ctx.restore();
}

export function drawO2(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  alpha = 1,
) {
  const r = Math.max(4, radius);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.oxygenFill;
  ctx.strokeStyle = C.oxygenStroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.oxygenStroke;
  ctx.font = `bold ${Math.max(8, r * 0.72)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("O2", cx, cy);
  ctx.restore();
}

export function drawGlucose(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  alpha = 1,
  t = 0,
  color = C.glucose,
) {
  const r = Math.max(6, radius);
  const p = pulse(t, 1.8, 0.06, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(p, p);

  ctx.fillStyle = color;
  ctx.strokeStyle = C.glucoseStroke;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const ang = (i / 6) * TAU - Math.PI / 6;
    const px = Math.cos(ang) * r;
    const py = Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = rgba(C.white, 0.75);
  ctx.font = `bold ${Math.max(7, r * 0.34)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("C6H12O6", 0, 0);
  ctx.restore();
}

export function drawBolt(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha = 1,
  color = C.bolt,
) {
  const s = Math.max(4, size);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.25, cy - s);
  ctx.lineTo(cx - s * 0.3, cy + s * 0.08);
  ctx.lineTo(cx + s * 0.08, cy + s * 0.08);
  ctx.lineTo(cx - s * 0.25, cy + s);
  ctx.lineTo(cx + s * 0.36, cy - s * 0.04);
  ctx.lineTo(cx - s * 0.04, cy - s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawArrow(
  ctx: Ctx,
  x: number,
  y: number,
  angle: number,
  length: number,
  color = C.arrow,
  thickness = 3,
  alpha = 1,
) {
  if (length <= 0 || alpha <= 0) return;
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  const head = Math.max(8, thickness * 3.6);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(
    endX - Math.cos(angle - 0.42) * head,
    endY - Math.sin(angle - 0.42) * head,
  );
  ctx.lineTo(endX, endY);
  ctx.lineTo(
    endX - Math.cos(angle + 0.42) * head,
    endY - Math.sin(angle + 0.42) * head,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawLightRay(
  ctx: Ctx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  alpha = 1,
  color = C.ray,
) {
  if (alpha <= 0) return;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const count = Math.max(1, Math.floor(length / 14));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i <= count; i += 1) {
    const f = i / count;
    ctx.beginPath();
    ctx.arc(lerp(x1, x2, f), lerp(y1, y2, f), 2.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawRock(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  alpha = 1,
  color = C.rock,
) {
  const r = Math.max(6, radius);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = C.rockDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy + r * 0.3);
  ctx.lineTo(cx - r * 0.55, cy - r);
  ctx.lineTo(cx + r * 0.34, cy - r * 0.82);
  ctx.lineTo(cx + r, cy + r * 0.05);
  ctx.lineTo(cx + r * 0.56, cy + r);
  ctx.lineTo(cx - r * 0.5, cy + r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawPlanet(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  alpha = 1,
  color = "#42A5F5",
) {
  const r = Math.max(8, radius);
  ctx.save();
  ctx.globalAlpha = alpha;
  const grad = ctx.createRadialGradient(
    cx - r * 0.3,
    cy - r * 0.3,
    1,
    cx,
    cy,
    r,
  );
  grad.addColorStop(0, "#9ED4FF");
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, "#1565C0");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();

  ctx.fillStyle = rgba("#66BB6A", 0.45);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.22, cy - r * 0.12, r * 0.35, r * 0.23, 0.2, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.26, cy + r * 0.15, r * 0.22, r * 0.14, -0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawThermometer(
  ctx: Ctx,
  cx: number,
  cy: number,
  scale = 1,
  alpha = 1,
  fillLevel = 0.5,
) {
  const s = Math.max(0.3, scale);
  const tubeHeight = 100 * s;
  const tubeWidth = 16 * s;
  const bulbR = 18 * s;
  const level = Math.max(0, Math.min(1, fillLevel));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#F8FAFC";
  fillRoundedRect(ctx, cx - tubeWidth * 0.5, cy - tubeHeight, tubeWidth, tubeHeight, tubeWidth * 0.5);
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 2;
  strokeRoundedRect(ctx, cx - tubeWidth * 0.5, cy - tubeHeight, tubeWidth, tubeHeight, tubeWidth * 0.5);

  ctx.fillStyle = "#EF4444";
  const fillH = (tubeHeight - 10 * s) * level;
  fillRoundedRect(
    ctx,
    cx - tubeWidth * 0.25,
    cy - 5 * s - fillH,
    tubeWidth * 0.5,
    fillH,
    tubeWidth * 0.25,
  );
  ctx.beginPath();
  ctx.arc(cx, cy + bulbR * 0.1, bulbR, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#B91C1C";
  ctx.stroke();
  ctx.restore();
}

export function drawVolcano(
  ctx: Ctx,
  cx: number,
  cy: number,
  size = 60,
  alpha = 1,
) {
  const s = Math.max(16, size);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#6D4C41";
  ctx.beginPath();
  ctx.moveTo(cx - s, cy + s * 0.24);
  ctx.lineTo(cx - s * 0.44, cy - s);
  ctx.lineTo(cx + s * 0.44, cy - s);
  ctx.lineTo(cx + s, cy + s * 0.24);
  ctx.lineTo(cx + s * 0.76, cy + s * 0.54);
  ctx.lineTo(cx - s * 0.76, cy + s * 0.54);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = rgba("#FF6D00", 0.92);
  ctx.beginPath();
  ctx.ellipse(cx, cy - s, s * 0.3, s * 0.15, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawWaveArc(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  phase = 0,
  alpha = 1,
  color = C.arrow,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -0.7 + phase, 0.7 + phase);
  ctx.stroke();
  ctx.restore();
}

export function drawConceptPill(
  ctx: Ctx,
  cx: number,
  cy: number,
  alpha = 1,
  color = C.arrow,
  text = "Concept",
) {
  const w = Math.max(80, text.length * 8 + 28);
  const h = 34;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rgba(C.white, 0.95);
  fillRoundedRect(ctx, cx - w * 0.5, cy - h * 0.5, w, h, h * 0.5);
  ctx.strokeStyle = rgba(color, 0.4);
  ctx.lineWidth = 1.5;
  strokeRoundedRect(ctx, cx - w * 0.5, cy - h * 0.5, w, h, h * 0.5);
  ctx.fillStyle = color;
  ctx.font = "600 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

export function drawEducationCard(
  ctx: Ctx,
  W: number,
  H: number,
  text: string,
  alpha = 1,
  _t = 0,
  conceptTitle = "",
  accent = C.arrow,
) {
  const cardW = Math.min(W * 0.82, 540);
  const cardH = Math.min(H * 0.34, 220);
  const x = (W - cardW) * 0.5;
  const y = H * 0.08;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rgba(C.white, 0.96);
  fillRoundedRect(ctx, x, y, cardW, cardH, 16);
  ctx.strokeStyle = rgba(accent, 0.3);
  ctx.lineWidth = 1.5;
  strokeRoundedRect(ctx, x, y, cardW, cardH, 16);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, cardW, 5);

  if (conceptTitle) {
    ctx.fillStyle = rgba(accent, 0.12);
    fillRoundedRect(ctx, x + 14, y + 14, Math.min(cardW - 28, conceptTitle.length * 8 + 28), 24, 12);
    ctx.fillStyle = accent;
    ctx.font = "700 12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(conceptTitle, x + 24, y + 26);
  }

  ctx.fillStyle = C.cardText;
  ctx.font = "600 17px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = cardW - 36;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length >= 3) break;
  }
  if (line && lines.length < 4) lines.push(line);

  const startY = y + cardH * 0.52 - ((lines.length - 1) * 24) * 0.5;
  lines.forEach((ln, index) => {
    const clipped =
      ctx.measureText(ln).width > maxWidth
        ? `${ln.slice(0, Math.max(8, ln.length - 3))}...`
        : ln;
    ctx.fillText(clipped, x + cardW * 0.5, startY + index * 24);
  });
  ctx.restore();
}

// ── Metaphor “character” primitives (backend types sun_character, plant_character, …) ──

export function drawSunCharacter(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  _color?: string,
): void {
  const r = Math.max(8, size);
  ctx.save();
  ctx.globalAlpha = alpha;

  const glowG = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.2);
  glowG.addColorStop(0, rgba("#FFEE58", 0.45));
  glowG.addColorStop(0.45, rgba("#FFC107", 0.12));
  glowG.addColorStop(1, rgba("#FFC107", 0));
  ctx.fillStyle = glowG;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.2, 0, TAU);
  ctx.fill();

  for (let i = 0; i < 12; i += 1) {
    const ang = (i / 12) * TAU + t * 0.65;
    const wobble = Math.sin(t + i * 0.8);
    const rayLen = r * 0.38 + wobble * r * 0.12;
    ctx.strokeStyle = rgba("#FFD54F", 0.92);
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * (r + 2), cy + Math.sin(ang) * (r + 2));
    ctx.lineTo(cx + Math.cos(ang) * (r + rayLen + 2), cy + Math.sin(ang) * (r + rayLen + 2));
    ctx.stroke();
  }

  const body = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.22, 1, cx, cy, r);
  body.addColorStop(0, "#FFFFFF");
  body.addColorStop(0.45, "#FFF9C4");
  body.addColorStop(0.75, C.sunCore);
  body.addColorStop(1, C.sunEdge);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#3E2723";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.22, cy - r * 0.08, r * 0.1, r * 0.14, 0, 0, TAU);
  ctx.ellipse(cx + r * 0.22, cy - r * 0.08, r * 0.1, r * 0.14, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(C.white, 0.95);
  ctx.beginPath();
  ctx.arc(cx - r * 0.19, cy - r * 0.1, r * 0.035, 0, TAU);
  ctx.arc(cx + r * 0.25, cy - r * 0.1, r * 0.035, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = Math.max(1.5, r * 0.055);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.12, r * 0.22, 0.35, Math.PI - 0.35);
  ctx.stroke();

  ctx.fillStyle = rgba("#FF8A65", 0.42);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.38, cy + r * 0.06, r * 0.12, r * 0.08, -0.2, 0, TAU);
  ctx.ellipse(cx + r * 0.38, cy + r * 0.06, r * 0.12, r * 0.08, 0.2, 0, TAU);
  ctx.fill();

  ctx.restore();
}

export function drawPlantCharacter(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  _color?: string,
  glowing = false,
  wobblePhase?: number,
): void {
  const s = Math.max(0.28, size / 90);
  const wp = wobblePhase ?? t * 0.8;
  const sway = Math.sin(wp) * 4;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  ctx.strokeStyle = C.plantStem;
  ctx.globalAlpha = alpha * 0.35;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  const rootPts: [number, number][] = [
    [-14, 8],
    [-4, 14],
    [6, 15],
    [16, 8],
  ];
  for (const [rx, ry] of rootPts) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(rx * 0.4, ry * 0.5, rx * 0.75, ry, rx, ry + 12);
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;

  ctx.strokeStyle = C.plantStem;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(sway, -38, sway * 0.82, -84, sway * 1.35, -132);
  ctx.stroke();

  const drawLeafDetailed = (
    tx: number,
    ty: number,
    rotation: number,
    flip = false,
    length = 46,
    width = 22,
  ) => {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(rotation);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = C.leafMain;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.bezierCurveTo(-length * 0.45, -width, 0, -width * 0.52, 0, 0);
    ctx.bezierCurveTo(0, width * 0.52, -length * 0.45, width, -length, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(C.leafDark, 0.35);
    ctx.beginPath();
    ctx.moveTo(-length * 0.2, 0);
    ctx.bezierCurveTo(-length * 0.35, width * 0.35, -length * 0.85, width * 0.15, -length, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.leafDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.lineTo(-4, 0);
    ctx.stroke();
    for (const vf of [0.3, 0.5, 0.7]) {
      ctx.beginPath();
      ctx.moveTo(-length * vf, -width * 0.08);
      ctx.quadraticCurveTo(-length * (vf + 0.08), 0, -length * vf, width * 0.12);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(C.white, 0.35);
    ctx.beginPath();
    ctx.ellipse(-length * 0.55, -width * 0.25, length * 0.12, width * 0.18, -0.4, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  drawLeafDetailed(sway * 0.45 - 8, -78, -0.55);
  drawLeafDetailed(sway * 0.85 + 8, -98, 0.58, true);
  drawLeafDetailed(sway * 1.35, -118, -Math.PI / 2 + 0.08, false, 38, 18);

  const faceX = sway * 1.25;
  const faceY = -108;
  if (glowing) {
    ctx.save();
    ctx.globalAlpha = alpha * (0.18 + Math.sin(t * 3.2) * 0.06);
    const hg = ctx.createRadialGradient(faceX, faceY, 8, faceX, faceY, 52);
    hg.addColorStop(0, rgba("#A5D6A7", 0.55));
    hg.addColorStop(1, rgba("#A5D6A7", 0));
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(faceX, faceY, 52, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#C8E6C9";
  ctx.beginPath();
  ctx.arc(faceX, faceY, 21, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = C.leafDark;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#1B5E20";
  ctx.beginPath();
  ctx.arc(faceX - 7, faceY - 5, 3, 0, TAU);
  ctx.arc(faceX + 7, faceY - 5, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(C.white, 0.9);
  ctx.beginPath();
  ctx.arc(faceX - 5.5, faceY - 6, 1.1, 0, TAU);
  ctx.arc(faceX + 8.5, faceY - 6, 1.1, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#1B5E20";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(faceX, faceY + 3, 7, 0.25, Math.PI - 0.25);
  ctx.stroke();

  ctx.restore();
}

export function drawCO2Bubble(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  _t: number,
  _color?: string,
): void {
  const r = Math.max(6, size * 0.52);
  ctx.save();
  ctx.globalAlpha = alpha;

  const outerG = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.2, cx, cy, r * 1.35);
  outerG.addColorStop(0, rgba("#ECEFF1", 0.5));
  outerG.addColorStop(1, rgba("#90A4AE", 0));
  ctx.fillStyle = outerG;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.22, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(176,190,197,0.3)";
  ctx.strokeStyle = "#78909C";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = rgba(C.white, 0.3);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.22, r * 0.14, -0.6, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#37474F";
  ctx.font = `bold ${Math.max(10, r * 0.65)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CO\u2082", cx, cy);
  ctx.restore();
}

export function drawWaterDropCharacter(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  _t: number,
  color?: string,
): void {
  const r = Math.max(5, size * 0.5);
  const fillC = color ?? C.water;
  ctx.save();
  ctx.globalAlpha = alpha;

  const gGlow = ctx.createRadialGradient(cx, cy - r * 0.2, 2, cx, cy + r * 0.3, r * 1.6);
  gGlow.addColorStop(0, rgba(fillC, 0.35));
  gGlow.addColorStop(1, rgba(fillC, 0));
  ctx.fillStyle = gGlow;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.15, r * 1.45, 0, TAU);
  ctx.fill();

  ctx.fillStyle = fillC;
  ctx.strokeStyle = C.waterDark;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.42);
  ctx.bezierCurveTo(cx + r, cy - r * 0.28, cx + r, cy + r * 0.72, cx, cy + r);
  ctx.bezierCurveTo(cx - r, cy + r * 0.72, cx - r, cy - r * 0.28, cx, cy - r * 1.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = rgba(C.white, 0.5);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.32, cy - r * 0.45, r * 0.2, r * 0.32, -0.45, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#0D47A1";
  ctx.beginPath();
  ctx.arc(cx - r * 0.18, cy + r * 0.08, r * 0.12, 0, TAU);
  ctx.arc(cx + r * 0.22, cy + r * 0.08, r * 0.12, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(C.white, 0.9);
  ctx.beginPath();
  ctx.arc(cx - r * 0.14, cy + r * 0.04, r * 0.035, 0, TAU);
  ctx.arc(cx + r * 0.26, cy + r * 0.04, r * 0.035, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#0D47A1";
  ctx.lineWidth = Math.max(1.2, r * 0.08);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.32, r * 0.18, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.restore();
}

export function drawEnergyBolt(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  color?: string,
): void {
  const s0 = Math.max(5, size * 0.56);
  const pulseS = 1 + Math.abs(Math.sin(t * 4)) * 0.12;
  const base = color ?? "#AB47BC";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(pulseS, pulseS);
  ctx.translate(-cx, -cy);

  ctx.shadowColor = "#CE93D8";
  ctx.shadowBlur = 20;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(cx + s0 * 0.28, cy - s0);
  ctx.lineTo(cx - s0 * 0.32, cy + s0 * 0.08);
  ctx.lineTo(cx + s0 * 0.1, cy + s0 * 0.1);
  ctx.lineTo(cx - s0 * 0.26, cy + s0);
  ctx.lineTo(cx + s0 * 0.38, cy - s0 * 0.02);
  ctx.lineTo(cx - s0 * 0.02, cy - s0 * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = rgba("#E1BEE7", 0.9);
  ctx.beginPath();
  ctx.moveTo(cx + s0 * 0.1, cy - s0 * 0.72);
  ctx.lineTo(cx - s0 * 0.08, cy - s0 * 0.15);
  ctx.lineTo(cx + s0 * 0.02, cy - s0 * 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function drawGlucoseHexagon(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  color?: string,
): void {
  const r = Math.max(7, size * 0.55);
  const p = 1 + Math.sin(t * 1.8) * 0.06;
  const fillC = color ?? "#FB923C";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(p, p);

  const glow = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.5);
  glow.addColorStop(0, rgba(fillC, 0.55));
  glow.addColorStop(1, rgba(fillC, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, 0, TAU);
  ctx.fill();

  const hexPath = (radius: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const ang = (i / 6) * TAU - Math.PI / 2;
      const px = Math.cos(ang) * radius;
      const py = Math.sin(ang) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  ctx.fillStyle = fillC;
  ctx.strokeStyle = C.glucoseStroke;
  ctx.lineWidth = 2.4;
  hexPath(r);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = rgba(C.white, 0.5);
  hexPath(r * 0.55);
  ctx.fill();

  ctx.fillStyle = rgba(C.white, 0.95);
  ctx.font = `bold ${Math.max(8, r * 0.38)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("C\u2086H\u2081\u2082O\u2086", 0, 0);
  ctx.restore();
}

export function drawTuningFork(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  _color?: string,
): void {
  const sc = Math.max(0.4, size / 38);
  const col = "#455A64";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);

  const prongW = 7;
  const prongH = 44;
  const gap = 11;
  const stemW = 9;
  const stemH = 40;
  const joinY = 4;

  ctx.fillStyle = col;
  fillRoundedRect(ctx, -gap * 0.5 - prongW, -prongH, prongW, prongH - joinY, 3);
  fillRoundedRect(ctx, gap * 0.5, -prongH, prongW, prongH - joinY, 3);
  fillRoundedRect(ctx, -stemW * 0.5, -joinY, stemW, stemH + joinY, 4);

  ctx.strokeStyle = col;
  ctx.lineWidth = 1.8;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i += 1) {
      const o = Math.max(0, Math.sin(t * 8 + i * 0.6));
      ctx.globalAlpha = alpha * 0.45 * o;
      ctx.beginPath();
      ctx.arc(
        side * (gap * 0.5 + prongW + 16 + i * 10),
        -prongH * 0.45 + i * 6,
        14 + i * 8,
        -0.65,
        0.65,
        false,
      );
      ctx.stroke();
    }
  }
  ctx.globalAlpha = alpha;

  ctx.restore();
}

export function drawWaveEmitter(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  color?: string,
): void {
  const baseC = color ?? "#29B6F6";
  const step = Math.max(10, size * 0.22);
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i += 1) {
    const R = step * (i + 1.1) + Math.sin(t * 3 + i) * 6;
    const a = alpha * (1 - i * 0.22);
    if (a <= 0.02) continue;
    const hueShift = i * 0.12;
    ctx.globalAlpha = a;
    ctx.strokeStyle =
      i === 0
        ? rgba(baseC, 0.95)
        : rgba(
            baseC,
            0.85 - hueShift * 0.2,
          );
    ctx.lineWidth = 3 - i * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, R, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawAirParticle(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  color?: string,
): void {
  const r = Math.max(6, Math.min(12, size * 0.22));
  const fillC = color ?? "#78909C";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillC;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(C.white, 0.75);
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.28, 0, TAU);
  ctx.fill();

  const orbit = r * 1.55;
  for (let i = 0; i < 3; i += 1) {
    const ang = t * 2 + (i / 3) * TAU;
    const sx = cx + Math.cos(ang) * orbit;
    const sy = cy + Math.sin(ang) * orbit;
    const sr = r * 0.32 * (1 - i * 0.18);
    ctx.globalAlpha = alpha * (0.65 - i * 0.15);
    ctx.fillStyle = fillC;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawMagnetBar(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  _color?: string,
): void {
  const w = Math.max(48, size * 1.35);
  const h = Math.max(22, size * 0.38);
  const corner = h * 0.42;
  const x0 = cx - w * 0.5;
  const y0 = cy - h * 0.5 + Math.sin(t * 1.2) * 2;
  ctx.save();
  ctx.globalAlpha = alpha;

  const grad = ctx.createLinearGradient(x0, 0, x0 + w, 0);
  grad.addColorStop(0, "#FF5252");
  grad.addColorStop(0.48, "#E53935");
  grad.addColorStop(0.52, "#1E88E5");
  grad.addColorStop(1, "#42A5F5");
  ctx.fillStyle = grad;
  fillRoundedRect(ctx, x0, y0, w, h, corner);
  ctx.fill();

  ctx.strokeStyle = "#263238";
  ctx.lineWidth = 2;
  strokeRoundedRect(ctx, x0, y0, w, h, corner);

  ctx.fillStyle = rgba(C.white, 0.95);
  ctx.font = `bold ${Math.max(12, h * 0.52)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", x0 + w * 0.22, y0 + h * 0.52);
  ctx.fillText("S", x0 + w * 0.78, y0 + h * 0.52);

  for (let i = 0; i < 3; i += 1) {
    const f = (i + 1) / 4;
    ctx.globalAlpha = alpha * 0.3;
    const rr = Math.round(lerp(230, 70, f));
    const gg = Math.round(lerp(60, 160, f));
    const bb = Math.round(lerp(55, 240, f));
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.45)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0 + w * 0.12, y0 - 6 - i * 10);
    ctx.bezierCurveTo(
      cx,
      y0 - 28 - i * 14,
      cx,
      y0 - 28 - i * 14,
      x0 + w * 0.88,
      y0 - 6 - i * 10,
    );
    ctx.stroke();
  }

  ctx.restore();
}

export function drawCircuitBulb(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  _color?: string,
): void {
  const r = Math.max(10, size * 0.5);
  const glow = 0.2 + Math.sin(t * 5) * 0.35;
  ctx.save();
  ctx.globalAlpha = alpha;

  const outer = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 2);
  outer.addColorStop(0, `rgba(250,204,21,${clamp01(glow)})`);
  outer.addColorStop(1, "rgba(250,204,21,0)");
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.9, 0, TAU);
  ctx.fill();

  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#FDE047";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#A16207";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "#57534E";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.18, cy + r * 0.55);
  ctx.lineTo(cx + r * 0.18, cy + r * 0.55);
  ctx.lineTo(cx + r * 0.16, cy + r * 0.95);
  ctx.lineTo(cx - r * 0.16, cy + r * 0.95);
  ctx.closePath();
  ctx.fillStyle = "#94A3B8";
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.55;
  ctx.strokeStyle = "#92400E";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.12, cy + r * 0.08);
  ctx.lineTo(cx - r * 0.02, cy - r * 0.12);
  ctx.lineTo(cx + r * 0.08, cy + r * 0.02);
  ctx.lineTo(cx + r * 0.14, cy - r * 0.22);
  ctx.stroke();

  ctx.restore();
}

export function drawWaterCycleCloud(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  color?: string,
): void {
  const s = Math.max(0.35, size / 52);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  const circles: [number, number, number][] = [
    [-28, 0, 22],
    [0, -6, 28],
    [32, 2, 24],
    [12, 10, 20],
  ];
  ctx.fillStyle = color ?? C.white;
  ctx.shadowColor = rgba("#0288D1", 0.22);
  ctx.shadowBlur = 14;
  for (const [dx, dy, rad] of circles) {
    ctx.beginPath();
    ctx.arc(dx, dy, rad, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.fillStyle = rgba("#29B6F6", 0.75);
  for (let i = 0; i < 3; i += 1) {
    const fall = ((t * 60 + i * 40) % 80) / 80;
    const rainY = 52 + fall * 72;
    const rainX = -18 + i * 22;
    const dropR = 3.5;
    ctx.globalAlpha = alpha * (1 - fall * 0.35);
    ctx.beginPath();
    ctx.moveTo(rainX, rainY - dropR * 1.3);
    ctx.quadraticCurveTo(rainX + dropR, rainY, rainX, rainY + dropR);
    ctx.quadraticCurveTo(rainX - dropR, rainY, rainX, rainY - dropR * 1.3);
    ctx.fill();
  }

  ctx.restore();
}

export function drawRockLayer(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  alpha: number,
  t: number,
  _color?: string,
): void {
  const w = Math.max(120, size * 2);
  const h = Math.max(70, size * 1.1);
  const x0 = cx - w * 0.5;
  const y0 = cy - h * 0.5;
  ctx.save();
  ctx.globalAlpha = alpha;

  const bands = [
    { y: 0, hh: h * 0.36, c0: "#BCAAA4", c1: "#8D6E63" },
    { y: h * 0.34, hh: h * 0.34, c0: "#8D6E63", c1: "#6D4C41" },
    { y: h * 0.66, hh: h * 0.38, c0: "#5D4037", c1: "#3E2723" },
  ];

  for (let b = 0; b < bands.length; b += 1) {
    const band = bands[b];
    const yy = y0 + band.y;
    ctx.beginPath();
    ctx.moveTo(x0, yy + band.hh);
    for (let i = 0; i <= 24; i += 1) {
      const px = x0 + (i / 24) * w;
      const wave =
        Math.sin(px * 0.04 + t * 1.2 + b * 0.8) * (3 + b) +
        Math.sin(px * 0.09 + t * 0.7) * 2;
      ctx.lineTo(px, yy + wave);
    }
    ctx.lineTo(x0 + w, yy + band.hh);
    ctx.lineTo(x0, yy + band.hh);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, yy, 0, yy + band.hh);
    g.addColorStop(0, band.c0);
    g.addColorStop(1, band.c1);
    ctx.fillStyle = g;
    ctx.fill();
  }

  ctx.globalAlpha = alpha * 0.45;
  for (let i = 0; i < 14; i += 1) {
    const rx = x0 + ((i * 73 + i * i) % Math.max(8, Math.floor(w * 0.88))) + w * 0.06;
    const ry = y0 + ((i * 41 + 7) % Math.max(8, Math.floor(h * 0.78))) + h * 0.1;
    ctx.fillStyle = i % 3 === 0 ? "#E0E0E0" : i % 3 === 1 ? "#B0BEC5" : "#FFCC80";
    ctx.beginPath();
    ctx.arc(rx, ry, 1.2 + (i % 3), 0, TAU);
    ctx.fill();
  }

  ctx.globalAlpha = alpha;
  const lava = ctx.createRadialGradient(cx, y0 + h, 4, cx, y0 + h, w * 0.45);
  lava.addColorStop(0, rgba("#FF6F00", 0.55));
  lava.addColorStop(1, rgba("#BF360C", 0));
  ctx.fillStyle = lava;
  ctx.fillRect(x0, y0 + h * 0.72, w, h * 0.35);

  ctx.restore();
}
