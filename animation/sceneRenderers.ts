/**
 * sceneRenderers.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Concept-specific canvas renderers for each photosynthesis scene.
 * This is a LIGHT-theme adaptation of your HTML demo, designed for expo-2d-
 * context on expo-gl (no dark mode, no text drawing).
 *
 * Mapping:
 * - Each function renders one conceptual "moment" given elapsed ms.
 * - Intended to line up 1:1 with backend scene IDs from
 *   /api/animation/neuro-adaptive (e.g. "scene_1" ..."scene_8").
 *
 * Canvas constraints (expo-2d-context on expo-gl):
 *   - fillText / strokeText are NO-OPS → use shapes only
 *   - shadowColor / shadowBlur are effectively NO-OPS
 *   - No custom font families
 *   - ctx.ellipse polyfilled externally (AnimationCanvasNative already does this)
 *   - Use: arc, rect, moveTo/lineTo, bezierCurveTo, fill, stroke, gradients
 *
 * CTML Principles (OVERLOAD demo):
 *   - Coherence   : minimal shapes, no decorative noise
 *   - Signaling   : accent colour on key actor (arrows, energy, glucose)
 *   - Temporal    : one moment per renderer (segmenting over time)
 *   - Redundancy  : shapes mirror the text bullet (visual + concept aligned)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Ctx2D = CanvasRenderingContext2D;

// ── Palette (LIGHT: soft neutrals, subtle accents) ───────────────────────────
const P = {
  // background layers
  bg: "#F5F7FA",
  surface: "#FFFFFF",

  // biology
  leafGreen: "#16A34A",
  leafDark: "#166534",
  sunYellow: "#FBBF24",
  sunDim: "#78350F",

  // molecules
  water: "#38BDF8",
  waterDim: "#0C4A6E",
  co2Gray: "#9CA3AF",
  glucose: "#F97316",
  energy: "#8B5CF6",

  white: "#111827",
  dim: "#CBD5E1",
  signal: "#2563EB", // signaling arrow colour
};

// ── Shared draw helpers ───────────────────────────────────────────────────────

function clearBg(ctx: Ctx2D, W: number, H: number) {
  // Soft light background to match existing AnimationEngine light theme
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#F9FAFB");
  grad.addColorStop(0.5, "#FFFFFF");
  grad.addColorStop(1, "#EFF6FF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Very subtle grid for structure
  ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

/**
 * Draw a simple signaling arrow pointing downward at (x,y).
 * Used across scenes to direct attention (Signaling Principle).
 */
function drawSignalArrow(ctx: Ctx2D, x: number, y: number, alpha: number = 1) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  ctx.strokeStyle = P.signal;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 15);
  ctx.lineTo(x, y + 24);
  ctx.lineTo(x + 6, y + 15);
  ctx.stroke();
  ctx.restore();
}

/**
 * Alpha fade-in based on elapsed:
 *  0ms → 0, 600ms → 1
 */
function fadeAlpha(elapsed: number): number {
  if (elapsed <= 0) return 0;
  if (elapsed >= 600) return 1;
  return elapsed / 600;
}

/**
 * Draw a leaf shape centred at (cx, cy) with radius r.
 */
function drawLeaf(
  ctx: Ctx2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = P.leafDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.bezierCurveTo(cx + r, cy - r, cx + r, cy + r, cx, cy + r);
  ctx.bezierCurveTo(cx - r, cy + r, cx - r, cy - r, cx, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // midrib
  ctx.strokeStyle = P.leafDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.9);
  ctx.lineTo(cx, cy + r * 0.9);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a sun with simple rays at (cx, cy).
 */
function drawSun(
  ctx: Ctx2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // rays
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (r + 4), cy + Math.sin(angle) * (r + 4));
    ctx.lineTo(cx + Math.cos(angle) * (r + 14), cy + Math.sin(angle) * (r + 14));
    ctx.stroke();
  }

  // disc
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Light-beam ray from (x1,y1) to (x2,y2).
 */
function drawRay(
  ctx: Ctx2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Simple bolt / lightning for "energy".
 */
function drawBolt(
  ctx: Ctx2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.2, cy - size);
  ctx.lineTo(cx - size * 0.3, cy + size * 0.1);
  ctx.lineTo(cx + size * 0.1, cy + size * 0.1);
  ctx.lineTo(cx - size * 0.2, cy + size);
  ctx.lineTo(cx + size * 0.35, cy - size * 0.05);
  ctx.lineTo(cx - size * 0.05, cy - size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Hexagon (chemical / glucose symbol).
 */
function drawHexagon(
  ctx: Ctx2D,
  cx: number,
  cy: number,
  r: number,
  fillColor: string,
  strokeColor: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Water-drop shape at (cx, cy).
 */
function drawWaterDrop(
  ctx: Ctx2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = P.waterDim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.4);
  ctx.bezierCurveTo(cx + r, cy - r * 0.3, cx + r, cy + r * 0.6, cx, cy + r);
  ctx.bezierCurveTo(cx - r, cy + r * 0.6, cx - r, cy - r * 0.3, cx, cy - r * 1.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * CO₂ molecule: two O circles flanking a C circle.
 */
function drawCO2(
  ctx: Ctx2D,
  cx: number,
  cy: number,
  r: number,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const gap = r * 1.9;

  // bonds
  ctx.strokeStyle = P.co2Gray;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - gap + r, cy);
  ctx.lineTo(cx - r, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r, cy);
  ctx.lineTo(cx + gap - r, cy);
  ctx.stroke();

  // O left
  ctx.fillStyle = "#F97373";
  ctx.beginPath();
  ctx.arc(cx - gap, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // C centre
  ctx.fillStyle = P.co2Gray;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // O right
  ctx.fillStyle = "#F97373";
  ctx.beginPath();
  ctx.arc(cx + gap, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Plant outline (stem + oval crown).
 */
function drawPlant(
  ctx: Ctx2D,
  cx: number,
  baseY: number,
  h: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // stem
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx, baseY - h * 0.45);
  ctx.stroke();

  // crown (ellipse via scale trick)
  ctx.save();
  ctx.translate(cx, baseY - h * 0.7);
  ctx.scale(1, 1.4);
  ctx.fillStyle = color + "33";
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, h * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ── Progress dot row ─────────────────────────────────────────────────────────

function drawProgress(
  ctx: Ctx2D,
  W: number,
  H: number,
  current: number, // 0-indexed
  total: number,
) {
  const dotR = 4;
  const spacing = 14;
  const totalWidth = (total - 1) * spacing;
  const startX = W / 2 - totalWidth / 2;
  const y = H - 24;

  for (let i = 0; i < total; i++) {
    ctx.save();
    ctx.fillStyle =
      i === current ? P.signal : i < current ? P.signal + "66" : P.dim;
    ctx.beginPath();
    ctx.arc(
      startX + i * spacing,
      y,
      i === current ? dotR + 1 : dotR,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE RENDERERS
// Signature:
//   (ctx, W, H, elapsedMsSinceSceneStart)
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_SCENES = 8;

/** scene_1 — "Green plants use light." */
export function renderScene1(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  drawSun(ctx, cx + 90, cy - 70, 28, P.sunYellow, a);

  if (elapsed > 300) {
    const rayA = Math.min((elapsed - 300) / 600, 1);
    drawRay(ctx, cx + 70, cy - 50, cx + 5, cy - 10, P.sunYellow, rayA * a);
  }

  drawPlant(ctx, cx - 30, cy + 60, 120, P.leafGreen, a);

  if (elapsed > 600) {
    drawSignalArrow(ctx, cx - 30, cy - 80, a);
  }

  drawProgress(ctx, W, H, 0, TOTAL_SCENES);
}

/** scene_2 — "Light makes energy." */
export function renderScene2(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  drawSun(ctx, cx - 90, cy - 40, 26, P.sunYellow, a);

  if (elapsed > 200) {
    const rayA = Math.min((elapsed - 200) / 500, 1);
    drawRay(ctx, cx - 65, cy - 30, cx + 10, cy, P.sunYellow, rayA * a);
  }

  const boltA = elapsed > 500 ? Math.min((elapsed - 500) / 400, 1) * a : 0;
  drawBolt(ctx, cx + 55, cy, 32, P.energy, boltA);

  if (elapsed > 800) {
    drawSignalArrow(ctx, cx + 55, cy + 40, a);
  }

  drawProgress(ctx, W, H, 1, TOTAL_SCENES);
}

/** scene_3 — "Energy is chemical." */
export function renderScene3(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  const boltAlpha = Math.max(0, 1 - elapsed / 1200) * a;
  drawBolt(ctx, cx - 55, cy, 28, P.energy, boltAlpha);

  if (elapsed > 400) {
    ctx.save();
    ctx.globalAlpha = Math.min((elapsed - 400) / 400, 1) * a;
    ctx.strokeStyle = P.signal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx + 20, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 6);
    ctx.lineTo(cx + 22, cy);
    ctx.lineTo(cx + 12, cy + 6);
    ctx.stroke();
    ctx.restore();
  }

  const hexA = elapsed > 600 ? Math.min((elapsed - 600) / 500, 1) * a : 0;
  drawHexagon(ctx, cx + 65, cy, 30, P.glucose + "33", P.glucose, hexA);

  if (elapsed > 900) {
    drawSignalArrow(ctx, cx + 65, cy + 38, a);
  }

  drawProgress(ctx, W, H, 2, TOTAL_SCENES);
}

/** scene_4 — "This energy occurs inside." */
export function renderScene4(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  drawPlant(ctx, cx, cy + 50, 130, P.leafGreen, a * 0.5);

  const pulse = 0.8 + Math.sin(elapsed * 0.006) * 0.15;
  const innerA = elapsed > 400 ? Math.min((elapsed - 400) / 600, 1) * a : 0;

  ctx.save();
  ctx.globalAlpha = innerA * 0.8;
  ctx.strokeStyle = P.energy;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 30, 28 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = innerA * 0.25;
  ctx.fillStyle = P.energy + "55";
  ctx.beginPath();
  ctx.arc(cx, cy - 30, 28 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (elapsed > 700) {
    drawSignalArrow(ctx, cx, cy - 70, a);
  }

  drawProgress(ctx, W, H, 3, TOTAL_SCENES);
}

/** scene_5 — "Plants take in dioxide." */
export function renderScene5(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  drawPlant(ctx, cx + 40, cy + 50, 110, P.leafGreen, a * 0.6);

  const travel = Math.min(elapsed / 2000, 1);
  const co2x = cx - 130 + travel * 120;
  const co2A = elapsed > 200 ? Math.min((elapsed - 200) / 500, 1) * a : 0;
  drawCO2(ctx, co2x, cy - 10, 16, co2A);

  if (travel > 0.7) {
    const absA = Math.min((travel - 0.7) / 0.3, 1) * a;
    drawSignalArrow(ctx, co2x + 10, cy - 40, absA);
  }

  drawProgress(ctx, W, H, 4, TOTAL_SCENES);
}

/** scene_6 — "Plants take in water." */
export function renderScene6(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  drawPlant(ctx, cx + 30, cy + 50, 110, P.leafGreen, a * 0.6);

  const rise = Math.min(elapsed / 2200, 1);
  const dropY = cy + 120 - rise * 150;
  const dropA = elapsed > 150 ? Math.min((elapsed - 150) / 500, 1) * a : 0;
  drawWaterDrop(ctx, cx - 30, dropY, 18, P.water, dropA);

  // simple root line
  ctx.save();
  ctx.globalAlpha = a * 0.4;
  ctx.strokeStyle = P.leafDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + 30, cy + 50);
  ctx.lineTo(cx + 30, cy + 80);
  ctx.lineTo(cx - 30, cy + 80);
  ctx.stroke();
  ctx.restore();

  if (rise > 0.7) {
    const arr = Math.min((rise - 0.7) / 0.3, 1) * a;
    drawSignalArrow(ctx, cx - 30, dropY - 30, arr);
  }

  drawProgress(ctx, W, H, 5, TOTAL_SCENES);
}

/** scene_7 — "Water subsequently makes glucose." */
export function renderScene7(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  const waterFade = Math.max(0.2, 1 - elapsed / 2000) * a;
  drawWaterDrop(ctx, cx - 80, cy, 20, P.water, waterFade);

  if (elapsed > 500) {
    const arrA = Math.min((elapsed - 500) / 400, 1) * a;
    ctx.save();
    ctx.globalAlpha = arrA;
    ctx.strokeStyle = P.signal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 52, cy);
    ctx.lineTo(cx + 30, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 20, cy - 7);
    ctx.lineTo(cx + 32, cy);
    ctx.lineTo(cx + 20, cy + 7);
    ctx.stroke();
    ctx.restore();
  }

  const hexA = elapsed > 900 ? Math.min((elapsed - 900) / 500, 1) * a : 0;
  drawHexagon(ctx, cx + 80, cy, 34, P.glucose + "33", P.glucose, hexA);

  if (elapsed > 1200) {
    drawSignalArrow(ctx, cx + 80, cy + 42, a);
  }

  drawProgress(ctx, W, H, 6, TOTAL_SCENES);
}

/** scene_8 — "Glucose is plant food." */
export function renderScene8(
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) {
  clearBg(ctx, W, H);
  const a = fadeAlpha(elapsed);
  const cx = W / 2;
  const cy = H / 2;

  drawPlant(ctx, cx + 30, cy + 55, 120, P.leafGreen, a);

  const travel = Math.min(elapsed / 2000, 1);
  const hexX = cx - 90 + travel * 100;
  const hexY = cy + travel * 20;
  const hexA = elapsed > 200 ? Math.min((elapsed - 200) / 500, 1) * a : 0;
  drawHexagon(ctx, hexX, hexY, 26, P.glucose + "44", P.glucose, hexA);

  if (travel > 0.85) {
    const glowA = Math.min((travel - 0.85) / 0.15, 1) * a;
    ctx.save();
    ctx.globalAlpha = glowA * 0.35;
    ctx.fillStyle = P.glucose;
    ctx.beginPath();
    ctx.arc(cx + 30, cy - 28, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (elapsed > 2800) {
    const ringA = Math.min((elapsed - 2800) / 600, 1) * a;
    ctx.save();
    ctx.globalAlpha = ringA * 0.6;
    ctx.strokeStyle = P.leafGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + 30, cy - 28, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawProgress(ctx, W, H, 7, TOTAL_SCENES);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE DISPATCH TABLE
// Maps backend scene IDs to renderer functions.
// ─────────────────────────────────────────────────────────────────────────────

export type SceneRenderer = (
  ctx: Ctx2D,
  W: number,
  H: number,
  elapsed: number,
) => void;

export const SCENE_RENDERERS: Record<string, SceneRenderer> = {
  scene_1: renderScene1,
  scene_2: renderScene2,
  scene_3: renderScene3,
  scene_4: renderScene4,
  scene_5: renderScene5,
  scene_6: renderScene6,
  scene_7: renderScene7,
  scene_8: renderScene8,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper used by an adaptive engine to render the active scene for a given
// global elapsed time.
// ─────────────────────────────────────────────────────────────────────────────

export function renderAdaptiveScene(
  ctx: Ctx2D,
  W: number,
  H: number,
  script: {
    scenes: Array<{
      id: string;
      startTime: number;
      duration: number;
    }>;
  },
  globalElapsed: number,
) {
  const active = script.scenes.find(
    (s) =>
      globalElapsed >= s.startTime &&
      globalElapsed < s.startTime + s.duration,
  );

  if (!active) {
    const last = script.scenes[script.scenes.length - 1];
    const lastRenderer = SCENE_RENDERERS[last.id];
    if (lastRenderer) lastRenderer(ctx, W, H, last.duration);
    return;
  }

  const renderer = SCENE_RENDERERS[active.id];
  if (!renderer) return;

  const sceneElapsed = globalElapsed - active.startTime;
  renderer(ctx, W, H, sceneElapsed);
}

