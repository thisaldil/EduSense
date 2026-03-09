/**
 * animation/core/shapes.ts
 * Primitive drawing helpers used by actor and scene renderers.
 */

import { lerp, pulse, rgba } from "./easing";

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
