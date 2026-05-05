/**
 * animation/sceneRenderers.ts
 * Step-by-step educational renderer with domain-aware visual sequencing.
 */

import { renderActors } from "./actorRenderers";
import {
  detectDomain as detectDomainFromCore,
  type ConceptDomain,
} from "./core/domainDetector";
import {
  clamp01,
  easeOutCubic,
  fadeIn,
  lerp,
  smoothstep,
} from "./core/easing";
import {
  drawArrow,
  drawBolt,
  drawCO2,
  drawCloud,
  drawConceptPill,
  drawGlucose,
  drawLightRay,
  drawO2,
  drawPlanet,
  drawRock,
  drawSol,
  drawSunny,
  drawWaterDrop,
  drawWaveArc,
} from "./core/shapes";

type Ctx = any;

export type { ConceptDomain };

export interface StepDef {
  label: string;
  render: (
    ctx: Ctx,
    progress: number,
    t: number,
    W: number,
    H: number,
    strength: number,
  ) => void;
  focus?: (W: number, H: number) => { x: number; y: number; r: number };
}

export function detectDomain(title: string, scenes: any[]): ConceptDomain {
  return detectDomainFromCore(title, scenes);
}

function isLabelOnly(actors: any[]): boolean {
  if (!Array.isArray(actors) || actors.length === 0) return true;
  return actors.every((actor) => !actor || String(actor.type || "label").toLowerCase() === "label");
}

function drawSimpleCloud(ctx: Ctx, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#FFFFFF";
  const r = 22 * scale;
  const bumps: [number, number, number][] = [
    [0, 0, r],
    [r * 0.9, -r * 0.3, r * 0.8],
    [r * 1.8, r * 0.1, r * 0.9],
    [-r * 0.9, -r * 0.2, r * 0.75],
  ];
  bumps.forEach(([dx, dy, rad]) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, rad, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawBiologyBackground(ctx: Ctx, W: number, H: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sky.addColorStop(0, "#64B5F6");
  sky.addColorStop(1, "#B3E5FC");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.65);
  ctx.fillStyle = "#8D6E63";
  ctx.fillRect(0, H * 0.65, W, H * 0.35);
  ctx.fillStyle = "#4CAF50";
  ctx.beginPath();
  ctx.ellipse(W / 2, H * 0.65, W * 0.7, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(0, H * 0.65, W, 14);
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;
  for (let gi = 0; gi < 4; gi += 1) {
    const gy = H * 0.68 + gi * ((H - H * 0.68) / 5);
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }
  drawSimpleCloud(ctx, W * 0.14, H * 0.12, 0.9);
  drawSimpleCloud(ctx, W * 0.7, H * 0.08, 0.7);
  drawSimpleCloud(ctx, W * 0.44, H * 0.15, 0.55);
}

function drawPhysicsBackground(ctx: Ctx, W: number, H: number, t: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1A237E");
  bg.addColorStop(1, "#283593");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(41,182,246,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < W; x += 4) {
    const y = H / 2 + Math.sin(x * 0.03 + t * 2) * 30;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawElectricityBackground(ctx: Ctx, W: number, H: number) {
  ctx.fillStyle = "#0D1117";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,193,7,0.06)";
  for (let x = 40; x < W; x += 40) {
    for (let y = 40; y < H; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const glow = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.6);
  glow.addColorStop(0, "rgba(255,193,7,0.08)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function drawWaterBackground(ctx: Ctx, W: number, H: number, t: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  sky.addColorStop(0, "#E3F2FD");
  sky.addColorStop(1, "#BBDEFB");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.7);
  ctx.fillStyle = "#1565C0";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.7);
  for (let x = 0; x <= W; x += 6) {
    const wy = H * 0.7 + Math.sin(x * 0.02 + t * 1.5) * 8;
    ctx.lineTo(x, wy);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(66,165,245,0.4)";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
}

function drawGeologyBackground(ctx: Ctx, W: number, H: number) {
  ctx.fillStyle = "#FFF8E1";
  ctx.fillRect(0, 0, W, H * 0.3);
  ctx.fillStyle = "#558B2F";
  ctx.fillRect(0, H * 0.3, W, H * 0.08);
  const layers = ["#9E9E9E", "#795548", "#607D8B", "#546E7A"];
  layers.forEach((col, i) => {
    const ly = H * 0.38 + i * (H * 0.155);
    ctx.fillStyle = col;
    ctx.fillRect(0, ly, W, H * 0.155 + 2);
  });
  const lava = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.5);
  lava.addColorStop(0, "rgba(255,87,34,0.2)");
  lava.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lava;
  ctx.fillRect(0, 0, W, H);
}

function drawDefaultBackground(ctx: Ctx, W: number, H: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#F0F4F8");
  bg.addColorStop(1, "#E2E8F0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

function drawSolarSystemStars(ctx: Ctx, W: number, H: number, t: number) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 70; i += 1) {
    const x = ((i * 173.7 + 31 + t * 12) % (W + 50)) - 25;
    const y = (i * 97.13 + 17) % (H * 0.94);
    ctx.globalAlpha = 0.25 + Math.sin(t * 2 + i) * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, 0.8 + (i % 4) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function actorListHasType(actors: any[], ...types: string[]) {
  const set = new Set(types);
  return actors.some((a) => a && set.has(String(a.type || "").toLowerCase()));
}

function actorTypesHasPlant(actors: any[]) {
  return actors.some((a) => {
    const ty = String(a?.type || "").toLowerCase();
    return ty.includes("plant");
  });
}

function drawDomainBackground(
  ctx: Ctx,
  domain: ConceptDomain,
  W: number,
  H: number,
  t: number,
  scene: any,
) {
  const meta = scene?.meta && typeof scene.meta === "object" ? scene.meta : {};
  const metaDomain = String((meta as any).domain || "").toLowerCase();
  const actors = Array.isArray(scene?.actors) ? scene.actors : [];
  const hasPlant = actorTypesHasPlant(actors);
  const hasSound = actorListHasType(actors, "tuning_fork", "wave_emitter");
  const hasBulb = actorListHasType(actors, "circuit_bulb", "bolt", "bulb");
  const hasWater = actorListHasType(actors, "water_cycle_cloud");
  const hasRock = actorListHasType(actors, "rock_layer");

  const bioMeta = metaDomain === "biology" || metaDomain === "photosynthesis";
  const bioLegacy =
    domain === "photosynthesis" ||
    domain === "food_chain" ||
    domain === "respiration" ||
    domain === "human_body";

  if (bioMeta || bioLegacy || hasPlant) {
    drawBiologyBackground(ctx, W, H);
    return;
  }
  if (metaDomain === "electricity" || domain === "electric_circuit" || hasBulb) {
    drawElectricityBackground(ctx, W, H);
    return;
  }
  if (metaDomain === "water" || metaDomain === "water_cycle" || domain === "water_cycle" || hasWater) {
    drawWaterBackground(ctx, W, H, t);
    return;
  }
  if (metaDomain === "earth_science" || metaDomain === "geology" || hasRock) {
    drawGeologyBackground(ctx, W, H);
    return;
  }
  if (metaDomain === "physics" || metaDomain === "sound" || domain === "sound" || hasSound) {
    drawPhysicsBackground(ctx, W, H, t);
    return;
  }

  if (metaDomain === "solar_system" || domain === "solar_system") {
    const dark = ctx.createLinearGradient(0, 0, 0, H);
    dark.addColorStop(0, "#0F172A");
    dark.addColorStop(1, "#1E1B4B");
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, W, H);
    drawSolarSystemStars(ctx, W, H, t);
    return;
  }

  drawDefaultBackground(ctx, W, H);
}

function inferActorsFromText(
  domain: ConceptDomain,
  text: string,
  W: number,
  H: number,
): any[] {
  const lower = text.toLowerCase();

  if (domain === "photosynthesis") {
    return [
      { type: "sun", x: W * 0.8, y: H * 0.14, size: 52, animation: "rotate" },
      { type: "plant", x: W * 0.26, y: H * 0.78, size: 90, animation: "sway" },
      { type: "root", x: W * 0.26, y: H * 0.87, size: 58, animation: "grow" },
      { type: "waterdrop", x: W * 0.18, y: H * 0.84, size: 30, animation: "float" },
      { type: "co2", x: W * 0.74, y: H * 0.32, size: 34, animation: "drift" },
      { type: "glucose", x: W * 0.54, y: H * 0.44, size: 38, animation: "pulse" },
      { type: "oxygen", x: W * 0.64, y: H * 0.22, size: 30, animation: "float" },
    ];
  }

  if (domain === "water_cycle") {
    return [
      { type: "sun", x: W * 0.8, y: H * 0.16, size: 48, animation: "rotate" },
      { type: "cloud", x: W * 0.5, y: H * 0.16, size: 56, animation: "float" },
      { type: "waterdrop", x: W * 0.3, y: H * 0.72, size: 32, animation: "bounce" },
      { type: "waterdrop", x: W * 0.44, y: H * 0.72, size: 28, animation: "bounce" },
      { type: "waterdrop", x: W * 0.58, y: H * 0.72, size: 30, animation: "bounce" },
    ];
  }

  if (domain === "food_chain") {
    return [
      { type: "plant", x: W * 0.16, y: H * 0.78, size: 78, animation: "sway" },
      { type: "rabbit", x: W * 0.48, y: H * 0.72, size: 42, animation: "idle" },
      { type: "lion", x: W * 0.8, y: H * 0.7, size: 46, animation: "idle" },
      { type: "arrow", x: W * 0.25, y: H * 0.68, angle: 0, length: W * 0.18, color: "#4CAF50" },
      { type: "arrow", x: W * 0.57, y: H * 0.67, angle: 0, length: W * 0.16, color: "#EF6C00" },
    ];
  }

  if (domain === "electric_circuit") {
    return [
      { type: "bolt", x: W * 0.24, y: H * 0.5, size: 56, color: "#FACC15", animation: "pulse" },
      { type: "arrow", x: W * 0.34, y: H * 0.5, angle: 0, length: W * 0.25, color: "#FACC15" },
      { type: "label", x: W * 0.58, y: H * 0.44, text: "Switch", color: "#E2E8F0" },
      { type: "bulb", x: W * 0.76, y: H * 0.46, size: 38, animation: "glow" },
    ];
  }

  if (domain === "sound") {
    return [
      { type: "label", x: W * 0.2, y: H * 0.46, text: "Source", color: "#1D4ED8" },
      { type: "arrow", x: W * 0.3, y: H * 0.5, angle: 0, length: W * 0.28, color: "#1D4ED8" },
      { type: "ear", x: W * 0.78, y: H * 0.5, size: 34, animation: "idle" },
    ];
  }

  if (domain === "heat_transfer") {
    return [
      { type: "sun", x: W * 0.22, y: H * 0.5, size: 46, animation: "pulse" },
      { type: "arrow", x: W * 0.32, y: H * 0.5, angle: 0, length: W * 0.3, color: "#EA580C" },
      { type: "rock", x: W * 0.76, y: H * 0.54, size: 46, animation: "idle", color: "#94A3B8" },
    ];
  }

  if (domain === "gravity") {
    return [
      { type: "planet", x: W * 0.5, y: H * 0.76, size: 110, animation: "pulse" },
      { type: "rock", x: W * 0.5, y: H * 0.24, size: 38, animation: "fall" },
      { type: "arrow", x: W * 0.5, y: H * 0.32, angle: Math.PI / 2, length: H * 0.26, color: "#1D4ED8" },
    ];
  }

  if (/plant|leaf/.test(lower)) {
    return [
      { type: "plant", x: W * 0.26, y: H * 0.78, size: 88, animation: "sway" },
      { type: "sun", x: W * 0.8, y: H * 0.16, size: 46, animation: "pulse" },
    ];
  }

  return [
    { type: "label", x: W * 0.5, y: H * 0.46, text: text || "Science concept" },
    { type: "arrow", x: W * 0.32, y: H * 0.56, angle: 0, length: W * 0.34 },
  ];
}

function photosynthesisSteps(text: string): StepDef[] {
  const lower = text.toLowerCase();

  if (/water|h2o|root/.test(lower)) {
    return [
      {
        label: "Step 1: Water is in the soil",
        render: (ctx, p, _t, W, H, s) => {
          const a = p * s;
          [0, 1, 2].forEach((i) => drawWaterDrop(ctx, W * (0.18 + i * 0.05), H * 0.85, 13, a));
        },
      },
      {
        label: "Step 2: Roots absorb water",
        render: (ctx, p, _t, W, H, s) => {
          const a = p * s;
          const y = lerp(H * 0.85, H * 0.7, smoothstep(p));
          drawWaterDrop(ctx, W * 0.26, y, 14, a);
          drawArrow(ctx, W * 0.26, H * 0.82, -Math.PI / 2, H * 0.16 * p, "#0288D1", 3, a);
        },
      },
      {
        label: "Step 3: Water rises to the leaf",
        render: (ctx, p, _t, W, H, s) => {
          const a = p * s;
          const y = lerp(H * 0.7, H * 0.46, smoothstep(p));
          drawWaterDrop(ctx, W * 0.28, y, 12, a);
        },
      },
    ];
  }

  if (/co2|carbon dioxide|dioxide/.test(lower)) {
    return [
      {
        label: "Step 1: CO2 is in the air",
        render: (ctx, p, _t, W, H, s) => {
          const a = p * s;
          drawCO2(ctx, W * 0.75, H * 0.26, 24, a);
          drawCO2(ctx, W * 0.84, H * 0.34, 18, a * 0.8);
        },
      },
      {
        label: "Step 2: CO2 enters the leaf",
        render: (ctx, p, _t, W, H, s) => {
          const a = p * s;
          const x = lerp(W * 0.74, W * 0.4, smoothstep(p));
          drawCO2(ctx, x, H * 0.3, 22, a);
          drawArrow(ctx, W * 0.7, H * 0.3, Math.PI + 0.15, W * 0.28 * p, "#90A4AE", 3, a);
        },
      },
      {
        label: "Step 3: CO2 helps make food",
        render: (ctx, p, _t, W, H, s) => {
          drawGlucose(ctx, W * 0.42, H * 0.38, 28 * p, p * s, 0);
        },
      },
    ];
  }

  return [
    {
      label: "Step 1: Plant and Sun appear",
      render: (ctx, p, t, W, H, s) => {
        const a = p * s;
        drawSunny(ctx, W * 0.26, H * 0.78, t, true, 0.6 + p * 0.4, a);
        drawSol(ctx, W * 0.8, H * 0.14, 48 * p, t, a);
      },
      focus: (W, H) => ({ x: W * 0.54, y: H * 0.46, r: 120 }),
    },
    {
      label: "Step 2: Light rays move to the leaf",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawLightRay(ctx, W * 0.76, H * 0.2, W * 0.34, H * 0.5, a);
        drawArrow(ctx, W * 0.7, H * 0.23, Math.PI - 0.55, W * 0.24 * p, "#F59E0B", 3, a);
      },
      focus: (W, H) => ({ x: W * 0.48, y: H * 0.38, r: 90 }),
    },
    {
      label: "Step 3: Water moves from roots upward",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        const y = lerp(H * 0.84, H * 0.46, smoothstep(p));
        drawWaterDrop(ctx, W * 0.26, y, 12, a);
        drawArrow(ctx, W * 0.26, H * 0.8, -Math.PI / 2, H * 0.28 * p, "#0288D1", 3, a);
      },
      focus: (W, H) => ({ x: W * 0.26, y: H * 0.62, r: 70 }),
    },
    {
      label: "Step 4: CO2 enters the leaf",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        const x = lerp(W * 0.76, W * 0.4, smoothstep(p));
        drawCO2(ctx, x, H * 0.3, 22, a);
        drawArrow(ctx, W * 0.72, H * 0.3, Math.PI + 0.12, W * 0.28 * p, "#90A4AE", 3, a);
      },
      focus: (W, H) => ({ x: W * 0.45, y: H * 0.35, r: 72 }),
    },
    {
      label: "Step 5: Energy conversion happens in the leaf",
      render: (ctx, p, _t, W, H, s) => {
        drawBolt(ctx, W * 0.44, H * 0.4, 30 * p, p * s, "#8B5CF6");
      },
      focus: (W, H) => ({ x: W * 0.44, y: H * 0.4, r: 58 }),
    },
    {
      label: "Step 6: Glucose is produced",
      render: (ctx, p, t, W, H, s) => {
        drawGlucose(ctx, W * 0.56, H * 0.44, 28 * p, p * s, t, "#FB923C");
      },
      focus: (W, H) => ({ x: W * 0.56, y: H * 0.44, r: 58 }),
    },
    {
      label: "Step 7: Oxygen exits the plant",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        const x = lerp(W * 0.42, W * 0.68, smoothstep(p));
        const y = lerp(H * 0.38, H * 0.22, smoothstep(p));
        drawO2(ctx, x, y, 17, a);
        drawArrow(ctx, W * 0.4, H * 0.38, -0.45, W * 0.22 * p, "#22C55E", 3, a);
      },
      focus: (W, H) => ({ x: W * 0.58, y: H * 0.26, r: 72 }),
    },
  ];
}

function waterCycleSteps(): StepDef[] {
  return [
    {
      label: "Step 1: Sun heats surface water",
      render: (ctx, p, t, W, H, s) => {
        const a = p * s;
        drawSol(ctx, W * 0.78, H * 0.16, 44 * p, t, a);
        [0, 1, 2].forEach((i) => drawWaterDrop(ctx, W * (0.28 + i * 0.08), H * 0.76, 12, a));
      },
      focus: (W, H) => ({ x: W * 0.5, y: H * 0.66, r: 110 }),
    },
    {
      label: "Step 2: Evaporation rises upward",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        [0, 1, 2].forEach((i) => {
          const y = lerp(H * 0.76, H * 0.34, smoothstep(p));
          drawWaterDrop(ctx, W * (0.28 + i * 0.08), y - i * 12, 10, a);
        });
        drawArrow(ctx, W * 0.44, H * 0.72, -Math.PI / 2, H * 0.28 * p, "#0288D1", 3, a);
      },
      focus: (W, H) => ({ x: W * 0.44, y: H * 0.5, r: 80 }),
    },
    {
      label: "Step 3: Condensation forms clouds",
      render: (ctx, p, _t, W, H, s) => drawCloud(ctx, W * 0.5, H * 0.2, 1.2 * p, p * s),
      focus: (W, H) => ({ x: W * 0.5, y: H * 0.2, r: 82 }),
    },
    {
      label: "Step 4: Rain falls as precipitation",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        for (let i = 0; i < 5; i += 1) {
          const x = W * 0.35 + i * W * 0.07;
          const y = lerp(H * 0.3, H * 0.72, smoothstep(p));
          drawWaterDrop(ctx, x, y, 10, a * (1 - i * 0.08));
        }
      },
      focus: (W, H) => ({ x: W * 0.5, y: H * 0.5, r: 110 }),
    },
    {
      label: "Step 5: Water collects and cycle repeats",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        [0, 1, 2, 3].forEach((i) => drawWaterDrop(ctx, W * (0.24 + i * 0.1), H * 0.8, 12, a));
        drawArrow(ctx, W * 0.2, H * 0.86, 0, W * 0.6 * p, "#0288D1", 3, a);
      },
      focus: (W, H) => ({ x: W * 0.52, y: H * 0.8, r: 120 }),
    },
  ];
}

function foodChainSteps(): StepDef[] {
  return [
    {
      label: "Step 1: Plant is the producer",
      render: (ctx, p, t, W, H, s) => drawSunny(ctx, W * 0.16, H * 0.78, t, false, 0.6 + p * 0.4, p * s),
      focus: (W, H) => ({ x: W * 0.16, y: H * 0.72, r: 62 }),
    },
    {
      label: "Step 2: Herbivore eats the plant",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawArrow(ctx, W * 0.24, H * 0.7, 0, W * 0.22 * p, "#4CAF50", 3, a);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "#D9A56F";
        ctx.beginPath();
        ctx.ellipse(W * 0.52, H * 0.72, 26, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      focus: (W, H) => ({ x: W * 0.52, y: H * 0.72, r: 66 }),
    },
    {
      label: "Step 3: Carnivore eats the herbivore",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawArrow(ctx, W * 0.6, H * 0.7, 0, W * 0.19 * p, "#EF6C00", 3, a);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "#6D4C41";
        ctx.beginPath();
        ctx.ellipse(W * 0.84, H * 0.68, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      focus: (W, H) => ({ x: W * 0.84, y: H * 0.68, r: 72 }),
    },
  ];
}

function electricCircuitSteps(): StepDef[] {
  return [
    {
      label: "Step 1: Battery provides electrical energy",
      render: (ctx, p, _t, W, H, s) => drawBolt(ctx, W * 0.22, H * 0.5, 34 * p, p * s, "#FACC15"),
      focus: (W, H) => ({ x: W * 0.22, y: H * 0.5, r: 58 }),
    },
    {
      label: "Step 2: Current starts through the wire",
      render: (ctx, p, _t, W, H, s) =>
        drawArrow(ctx, W * 0.3, H * 0.5, 0, W * 0.24 * p, "#FACC15", 4, p * s),
      focus: (W, H) => ({ x: W * 0.44, y: H * 0.5, r: 70 }),
    },
    {
      label: "Step 3: Switch controls the circuit",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(W * 0.56, H * 0.52);
        ctx.lineTo(W * 0.62, lerp(H * 0.46, H * 0.52, 1 - p));
        ctx.stroke();
        ctx.restore();
      },
      focus: (W, H) => ({ x: W * 0.59, y: H * 0.5, r: 52 }),
    },
    {
      label: "Step 4: Current reaches the bulb",
      render: (ctx, p, _t, W, H, s) =>
        drawArrow(ctx, W * 0.64, H * 0.5, 0, W * 0.12 * p, "#FACC15", 4, p * s),
      focus: (W, H) => ({ x: W * 0.74, y: H * 0.48, r: 54 }),
    },
    {
      label: "Step 5: Bulb lights up",
      render: (ctx, p, t, W, H, s) => {
        const a = p * s;
        const glow = 0.2 + Math.max(0, Math.sin(t * 8)) * 0.3 * p;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgba(250,204,21,${glow})`;
        ctx.beginPath();
        ctx.arc(W * 0.78, H * 0.46, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      focus: (W, H) => ({ x: W * 0.78, y: H * 0.46, r: 72 }),
    },
  ];
}

function soundSteps(): StepDef[] {
  return [
    {
      label: "Step 1: A source vibrates",
      render: (ctx, p, t, W, H, s) => {
        const a = p * s;
        const vib = Math.sin(t * 20) * 6 * p;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#1D4ED8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(W * 0.2, H * 0.42 + vib);
        ctx.lineTo(W * 0.2, H * 0.58 - vib);
        ctx.stroke();
        ctx.restore();
      },
      focus: (W, H) => ({ x: W * 0.2, y: H * 0.5, r: 56 }),
    },
    {
      label: "Step 2: Vibrations create sound waves",
      render: (ctx, p, t, W, H, s) => {
        const a = p * s;
        [0, 1, 2, 3].forEach((i) => {
          const r = (i + 1) * (24 + p * 8);
          drawWaveArc(ctx, W * 0.24, H * 0.5, r, t * 0.4, a * (1 - i * 0.15), "#1D4ED8");
        });
      },
      focus: (W, H) => ({ x: W * 0.44, y: H * 0.5, r: 96 }),
    },
    {
      label: "Step 3: Waves travel to the ear",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawArrow(ctx, W * 0.42, H * 0.5, 0, W * 0.28 * p, "#1D4ED8", 3, a);
      },
      focus: (W, H) => ({ x: W * 0.72, y: H * 0.5, r: 72 }),
    },
    {
      label: "Step 4: The ear sends signals for hearing",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.ellipse(W * 0.82, H * 0.5, 12, 22, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawBolt(ctx, W * 0.9, H * 0.46, 20 * p, a, "#2563EB");
      },
      focus: (W, H) => ({ x: W * 0.84, y: H * 0.5, r: 66 }),
    },
  ];
}

function heatTransferSteps(): StepDef[] {
  return [
    {
      label: "Step 1: Heat source starts with high energy",
      render: (ctx, p, t, W, H, s) => drawSol(ctx, W * 0.24, H * 0.5, 40 * p, t, p * s),
      focus: (W, H) => ({ x: W * 0.24, y: H * 0.5, r: 66 }),
    },
    {
      label: "Step 2: Heat transfers from hot to cold",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawArrow(ctx, W * 0.34, H * 0.5, 0, W * 0.34 * p, "#EA580C", 4, a);
      },
      focus: (W, H) => ({ x: W * 0.54, y: H * 0.5, r: 92 }),
    },
    {
      label: "Step 3: The colder object warms up",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawRock(ctx, W * 0.78, H * 0.54, 34, a, "#9CA3AF");
        drawBolt(ctx, W * 0.78, H * 0.46, 24 * p, a, "#EA580C");
      },
      focus: (W, H) => ({ x: W * 0.78, y: H * 0.52, r: 68 }),
    },
  ];
}

function gravitySteps(): StepDef[] {
  return [
    {
      label: "Step 1: Earth has gravitational pull",
      render: (ctx, p, _t, W, H, s) => drawPlanet(ctx, W * 0.5, H * 0.78, 80 * p, p * s),
    },
    {
      label: "Step 2: Objects are pulled downward",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawArrow(ctx, W * 0.5, H * 0.28, Math.PI / 2, H * 0.32 * p, "#1D4ED8", 4, a);
      },
    },
    {
      label: "Step 3: The object falls toward Earth",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        const y = lerp(H * 0.26, H * 0.62, easeOutCubic(p));
        drawRock(ctx, W * 0.5, y, 24, a);
      },
    },
  ];
}

function respirationSteps(): StepDef[] {
  return [
    {
      label: "Step 1: Oxygen is inhaled",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        drawO2(ctx, W * 0.2, H * 0.44, 18, a);
        drawArrow(ctx, W * 0.26, H * 0.46, 0, W * 0.16 * p, "#22C55E", 3, a);
      },
    },
    {
      label: "Step 2: Oxygen reaches the lungs",
      render: (ctx, p, t, W, H, s) => {
        const a = p * s;
        const expand = 1 + Math.sin(t * 1.4) * 0.06 * p;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgba(244,143,177,0.25)";
        ctx.strokeStyle = "#E11D48";
        ctx.lineWidth = 2.5;
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.ellipse(W * 0.5 + side * 26, H * 0.46, 22 * expand, 34 * expand, side * 0.18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      },
    },
    {
      label: "Step 3: Carbon dioxide is exhaled",
      render: (ctx, p, _t, W, H, s) => {
        const a = p * s;
        const x = lerp(W * 0.62, W * 0.82, smoothstep(p));
        drawCO2(ctx, x, H * 0.44, 20, a);
        drawArrow(ctx, W * 0.6, H * 0.46, 0, W * 0.18 * p, "#EF4444", 3, a);
      },
    },
  ];
}

function genericSteps(text: string): StepDef[] {
  const shortText = text.length > 42 ? `${text.slice(0, 42)}...` : text || "Science concept";
  return [
    {
      label: shortText,
      render: (ctx, p, t, W, H, s) => {
        drawConceptPill(ctx, W * 0.5, H * 0.46, p * s, "#2563EB", "Key idea");
        drawBolt(ctx, W * 0.5, H * 0.58, 16 * p, p * s, "#2563EB");
      },
    },
    {
      label: "Observe, connect, and explain",
      render: (ctx, p, _t, W, H, s) => {
        drawArrow(ctx, W * 0.32, H * 0.56, 0, W * 0.36 * p, "#2563EB", 3, p * s);
      },
    },
  ];
}

function getDomainSteps(domain: ConceptDomain, sceneText: string): StepDef[] {
  if (domain === "photosynthesis") return photosynthesisSteps(sceneText);
  if (domain === "water_cycle") return waterCycleSteps();
  if (domain === "food_chain") return foodChainSteps();
  if (domain === "electric_circuit") return electricCircuitSteps();
  if (domain === "sound") return soundSteps();
  if (domain === "heat_transfer") return heatTransferSteps();
  if (domain === "gravity") return gravitySteps();
  if (domain === "respiration") return respirationSteps();
  return genericSteps(sceneText);
}

function drawFocusRing(ctx: Ctx, x: number, y: number, r: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = 2;
  ctx.setLineDash?.([7, 6]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash?.([]);
  ctx.restore();
}

function renderStepSequence(
  steps: StepDef[],
  elapsedMs: number,
  sceneDurationMs: number,
  t: number,
  W: number,
  H: number,
  ctx: Ctx,
  strength: number,
): string {
  if (!steps.length) return "";

  const total = steps.length;
  const windowMs = Math.max(700, sceneDurationMs / total);
  const stepIndex = Math.min(total - 1, Math.floor(elapsedMs / windowMs));
  const localProgress = clamp01((elapsedMs - stepIndex * windowMs) / (windowMs * 0.82));
  const eased = easeOutCubic(localProgress);

  for (let i = 0; i < stepIndex; i += 1) {
    steps[i].render(ctx, 1, t, W, H, strength);
  }
  steps[stepIndex].render(ctx, eased, t, W, H, strength);

  const focus = steps[stepIndex].focus?.(W, H);
  if (focus) {
    drawFocusRing(ctx, focus.x, focus.y, focus.r, 0.22 + eased * 0.65 * strength);
  }

  return steps[stepIndex].label;
}

function renderCaption(
  ctx: Ctx,
  sceneText: string,
  stepLabel: string,
  elapsedMs: number,
  W: number,
  H: number,
) {
  const display = stepLabel || sceneText;
  if (!display) return;
  const alpha = fadeIn(elapsedMs, 80, 420);
  if (alpha < 0.01) return;

  const barH = 46;
  const barY = H - barH - 10;
  const barX = W * 0.04;
  const barW = W * 0.92;

  ctx.save();
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
  grad.addColorStop(0, "rgba(15,23,42,0.62)");
  grad.addColorStop(1, "rgba(2,6,23,0.9)");
  ctx.fillStyle = grad;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 12);
    ctx.fill();
  } else {
    ctx.fillRect(barX, barY, barW, barH);
  }

  if (stepLabel) {
    ctx.fillStyle = "#60A5FA";
    ctx.beginPath();
    ctx.arc(barX + 18, barY + barH * 0.5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxW = barW - 36;
  let out = display;
  while (ctx.measureText(out).width > maxW && out.length > 12) {
    out = `${out.slice(0, -4)}...`;
  }
  ctx.fillText(out, barX + barW * 0.5, barY + barH * 0.5);
  ctx.restore();
}

export function renderUniversalScene(
  scene: any,
  domain: ConceptDomain,
  ctx: Ctx,
  W: number,
  H: number,
  elapsedMs: number,
): void {
  const t = elapsedMs * 0.001;
  const text = String(scene?.text || "");
  const duration = typeof scene?.duration === "number" && scene.duration > 0 ? scene.duration : 6000;

  drawDomainBackground(ctx, domain, W, H, t, scene);

  const rawActors = Array.isArray(scene?.actors) ? scene.actors : [];
  const labelOnly = isLabelOnly(rawActors);
  const activeActors = labelOnly ? inferActorsFromText(domain, text, W, H) : rawActors;

  const actorsWithTimeline = activeActors.map((actor: any, index: number) => {
    const hasTimeline = Array.isArray(actor?.timeline) && actor.timeline.length > 0;
    if (hasTimeline) return actor;
    const start = Math.min(index * 280, 1800);
    return {
      ...actor,
      timeline: [
        { at: start, alpha: 0 },
        { at: start + 600, alpha: 1 },
      ],
    };
  });

  const actorCount = renderActors(actorsWithTimeline, ctx, elapsedMs, W, H);
  const steps = getDomainSteps(domain, text);
  const overlayStrength = labelOnly ? 1 : 0.68;
  const stepLabel = renderStepSequence(
    steps,
    elapsedMs,
    duration,
    t,
    W,
    H,
    ctx,
    overlayStrength,
  );

  if (actorCount === 0 && steps.length === 0) {
    drawConceptPill(ctx, W * 0.5, H * 0.5, 0.9, "#2563EB", "Learning step");
  }

  renderCaption(ctx, text, stepLabel, elapsedMs, W, H);
  ctx.endFrameEXP?.();
}
