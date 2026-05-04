/**
 * animation/actorRenderers.ts
 * Domain-agnostic actor drawing with motion + timeline alpha.
 */

import {
  C,
  drawArrow,
  drawBolt,
  drawCO2,
  drawCloud,
  drawConceptPill,
  drawEducationCard,
  drawGlucose,
  drawO2,
  drawPlanet,
  drawRock,
  drawSol,
  drawSunny,
  drawThermometer,
  drawVolcano,
  drawWaterDrop,
} from "./core/shapes";
import {
  computeTimelineAlpha,
  fadeIn,
  oscillate,
  pulse,
  rgba,
} from "./core/easing";

type Ctx = any;

export type DrawFn = (
  ctx: Ctx,
  actor: any,
  alpha: number,
  t: number,
  W: number,
  H: number,
) => void;

const TYPE_ALIAS: Record<string, string> = {
  water_drop: "waterdrop",
  droplet: "waterdrop",
  h2o: "waterdrop",
  carbondioxide: "co2",
  carbon_dioxide: "co2",
  co2_bubble: "co2",
  oxygen: "oxygen",
  o2: "oxygen",
  molecule_o2: "oxygen",
  star: "sun",
  sun_character: "sun",
  lightning: "bolt",
  energy: "bolt",
  energy_bolt: "bolt",
  earth: "planet",
  tree: "plant",
  leaf: "plant",
  plant_character: "plant",
  herbivore: "animal",
  carnivore: "animal",
  producer: "plant",
  consumer: "animal",
  glucose_molecule: "glucose",
  glucose_hexagon: "glucose",
  tuning_fork: "ear",
  wave_emitter: "line",
  air_particle: "molecule",
};

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  sun: { x: 0.8, y: 0.14 },
  plant: { x: 0.26, y: 0.78 },
  root: { x: 0.26, y: 0.86 },
  cloud: { x: 0.52, y: 0.16 },
  waterdrop: { x: 0.44, y: 0.62 },
  water: { x: 0.44, y: 0.62 },
  co2: { x: 0.72, y: 0.34 },
  oxygen: { x: 0.62, y: 0.22 },
  glucose: { x: 0.56, y: 0.46 },
  bolt: { x: 0.56, y: 0.42 },
  arrow: { x: 0.5, y: 0.5 },
  rock: { x: 0.5, y: 0.76 },
  planet: { x: 0.52, y: 0.54 },
  volcano: { x: 0.5, y: 0.74 },
  molecule: { x: 0.52, y: 0.48 },
  label: { x: 0.5, y: 0.16 },
  line: { x: 0.48, y: 0.52 },
  thermometer: { x: 0.82, y: 0.72 },
  bulb: { x: 0.72, y: 0.45 },
  ear: { x: 0.8, y: 0.5 },
  animal: { x: 0.56, y: 0.72 },
};

function resolveType(rawType: any): string {
  const normalized = String(rawType || "label").toLowerCase().trim();
  return TYPE_ALIAS[normalized] || normalized;
}

function defaultPoint(type: string, W: number, H: number) {
  const slot = DEFAULT_POSITIONS[type] || DEFAULT_POSITIONS.label;
  return { x: slot.x * W, y: slot.y * H };
}

function drawFallbackAnimal(ctx: Ctx, actor: any, alpha: number, label: string) {
  const x = actor.x;
  const y = actor.y;
  const r = Math.max(16, (actor.size ?? 42) * 0.42);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = actor.color || "#D9A56F";
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.1, r * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5A3D25";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#2A1A0F";
  ctx.beginPath();
  ctx.arc(x - r * 0.24, y - r * 0.12, 2.4, 0, Math.PI * 2);
  ctx.arc(x + r * 0.24, y - r * 0.12, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "600 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, x, y + r + 6);
  ctx.restore();
}

function drawSimpleEar(ctx: Ctx, actor: any, alpha: number) {
  const x = actor.x;
  const y = actor.y;
  const s = Math.max(14, (actor.size ?? 34) * 0.42);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#F9A825";
  ctx.strokeStyle = "#C2410C";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.7, s, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + s * 0.08, y + s * 0.08, s * 0.28, 0.2, 4.8);
  ctx.stroke();
  ctx.restore();
}

function drawBulb(ctx: Ctx, actor: any, alpha: number, t: number) {
  const x = actor.x;
  const y = actor.y;
  const r = Math.max(10, (actor.size ?? 34) * 0.48);
  const glow = 0.2 + Math.max(0, Math.sin(t * 5)) * 0.35;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rgba("#FACC15", glow);
  ctx.beginPath();
  ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FDE047";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#A16207";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#64748B";
  ctx.fillRect(x - r * 0.5, y + r * 0.75, r, r * 0.7);
  ctx.restore();
}

function drawLabelActor(ctx: Ctx, actor: any, alpha: number, t: number, W: number, H: number) {
  const text = String(actor.text || "").trim();
  const cx = actor.x;
  const cy = actor.y;
  const size = Math.max(18, (actor.fontSize || actor.size || 16) * 1.1);
  const compact = text.toLowerCase().replace(/\s+/g, "");

  if (/^(h2o|water)$/.test(compact)) {
    drawWaterDrop(ctx, cx, cy, size * 0.58, alpha, actor.color || C.water);
    return;
  }
  if (/^(co2|carbondioxide)$/.test(compact)) {
    drawCO2(ctx, cx, cy, size * 0.62, alpha);
    return;
  }
  if (/^(o2|oxygen)$/.test(compact)) {
    drawO2(ctx, cx, cy, size * 0.56, alpha);
    return;
  }
  if (/^(glucose|sugar|c6h)/.test(compact)) {
    drawGlucose(ctx, cx, cy, size * 0.64, alpha, t, actor.color || C.glucose);
    return;
  }
  if (/^(energy|bolt|lightning)$/.test(compact)) {
    drawBolt(ctx, cx, cy, size * 0.6, alpha, actor.color || C.bolt);
    return;
  }

  if (text.length >= 12) {
    drawEducationCard(
      ctx,
      W,
      H,
      text,
      alpha,
      t,
      actor.extra?.concept || actor.conceptTitle || "",
      actor.color || C.arrow,
    );
    return;
  }

  drawConceptPill(ctx, cx, cy, alpha, actor.color || C.arrow, text || "Concept");
}

export const ACTOR_RENDERERS: Record<string, DrawFn> = {
  arrow: (ctx, actor, alpha) => {
    if (typeof actor.x2 === "number" && typeof actor.y2 === "number") {
      const dx = actor.x2 - actor.x;
      const dy = actor.y2 - actor.y;
      drawArrow(
        ctx,
        actor.x,
        actor.y,
        Math.atan2(dy, dx),
        Math.sqrt(dx * dx + dy * dy),
        actor.color || C.arrow,
        actor.thickness ?? 3,
        alpha,
      );
      return;
    }
    drawArrow(
      ctx,
      actor.x,
      actor.y,
      actor.angle ?? 0,
      actor.length ?? 120,
      actor.color || C.arrow,
      actor.thickness ?? 3,
      alpha,
    );
  },

  line: (ctx, actor, alpha) => {
    const x1 = actor.x1 ?? actor.x;
    const y1 = actor.y1 ?? actor.y;
    const x2 = actor.x2 ?? x1 + 120;
    const y2 = actor.y2 ?? y1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = actor.color || C.arrow;
    ctx.lineWidth = actor.thickness ?? 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },

  sun: (ctx, actor, alpha, t) => drawSol(ctx, actor.x, actor.y, actor.size ?? 52, t, alpha),
  cloud: (ctx, actor, alpha) => drawCloud(ctx, actor.x, actor.y, (actor.size ?? 48) / 24, alpha),
  plant: (ctx, actor, alpha, t) => drawSunny(ctx, actor.x, actor.y, t, true, actor.scale ?? 1, alpha),
  root: (ctx, actor, alpha) => {
    const cx = actor.x;
    const cy = actor.y;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = actor.color || "#5D4037";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    [[-42, 46], [-18, 56], [10, 58], [35, 46]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx, cy + dy);
      ctx.stroke();
    });
    ctx.restore();
  },
  waterdrop: (ctx, actor, alpha) =>
    drawWaterDrop(ctx, actor.x, actor.y, (actor.size ?? 34) * 0.5, alpha, actor.color || C.water),
  water: (ctx, actor, alpha) =>
    drawWaterDrop(ctx, actor.x, actor.y, (actor.size ?? 34) * 0.5, alpha, actor.color || C.water),
  co2: (ctx, actor, alpha) => drawCO2(ctx, actor.x, actor.y, (actor.size ?? 36) * 0.52, alpha),
  glucose: (ctx, actor, alpha, t) =>
    drawGlucose(ctx, actor.x, actor.y, (actor.size ?? 40) * 0.55, alpha, t, actor.color || C.glucose),
  bolt: (ctx, actor, alpha) =>
    drawBolt(ctx, actor.x, actor.y, (actor.size ?? 38) * 0.55, alpha, actor.color || C.bolt),
  oxygen: (ctx, actor, alpha) => drawO2(ctx, actor.x, actor.y, (actor.size ?? 30) * 0.55, alpha),
  rock: (ctx, actor, alpha) =>
    drawRock(ctx, actor.x, actor.y, (actor.size ?? 44) * 0.52, alpha, actor.color || C.rock),
  planet: (ctx, actor, alpha) =>
    drawPlanet(ctx, actor.x, actor.y, (actor.size ?? 48) * 0.55, alpha, actor.color || "#42A5F5"),
  volcano: (ctx, actor, alpha) => drawVolcano(ctx, actor.x, actor.y, actor.size ?? 62, alpha),
  thermometer: (ctx, actor, alpha) =>
    drawThermometer(ctx, actor.x, actor.y, actor.size ?? 1, alpha, actor.temp ?? 0.5),
  molecule: (ctx, actor, alpha, t, W, H) => {
    const mt = String(actor.moleculeType || actor.extra?.moleculeType || "").toLowerCase();
    if (mt.includes("co2")) return ACTOR_RENDERERS.co2(ctx, actor, alpha, t, W, H);
    if (mt.includes("oxygen") || mt === "o2") return ACTOR_RENDERERS.oxygen(ctx, actor, alpha, t, W, H);
    if (mt.includes("glucose") || mt.includes("sugar")) return ACTOR_RENDERERS.glucose(ctx, actor, alpha, t, W, H);
    return ACTOR_RENDERERS.waterdrop(ctx, actor, alpha, t, W, H);
  },
  bulb: (ctx, actor, alpha, t) => drawBulb(ctx, actor, alpha, t),
  ear: (ctx, actor, alpha) => drawSimpleEar(ctx, actor, alpha),

  label: (ctx, actor, alpha, t, W, H) => drawLabelActor(ctx, actor, alpha, t, W, H),

  animal: (ctx, actor, alpha) => drawFallbackAnimal(ctx, actor, alpha, actor.label || "Animal"),
  rabbit: (ctx, actor, alpha) => drawFallbackAnimal(ctx, actor, alpha, "Herbivore"),
  deer: (ctx, actor, alpha) => drawFallbackAnimal(ctx, actor, alpha, "Herbivore"),
  goat: (ctx, actor, alpha) => drawFallbackAnimal(ctx, actor, alpha, "Herbivore"),
  lion: (ctx, actor, alpha) => drawFallbackAnimal(ctx, actor, alpha, "Carnivore"),
  fox: (ctx, actor, alpha) => drawFallbackAnimal(ctx, actor, alpha, "Carnivore"),
  snake: (ctx, actor, alpha) => drawFallbackAnimal(ctx, actor, alpha, "Predator"),
  bird: (ctx, actor, alpha, t) => {
    const x = actor.x;
    const y = actor.y;
    const s = Math.max(16, (actor.size ?? 36) * 0.45);
    const flap = Math.sin(t * 10) * 6;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = actor.color || "#374151";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s - flap, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s - flap, x + s, y);
    ctx.stroke();
    ctx.restore();
  },
};

function drawUnknownActor(ctx: Ctx, actor: any, alpha: number): void {
  drawConceptPill(
    ctx,
    actor.x,
    actor.y,
    alpha,
    actor.color || C.arrow,
    String(actor.type || "shape"),
  );
}

type PositionedActor = any & { type: string; x: number; y: number };

function autoLayoutActors(actors: any[], W: number, H: number): PositionedActor[] {
  const counters = new Map<string, number>();
  return (actors || []).map((raw) => {
    const type = resolveType(raw?.type);
    const index = counters.get(type) ?? 0;
    counters.set(type, index + 1);

    const slot = defaultPoint(type, W, H);
    const spreadX = index * 56 - Math.floor(index / 2) * 112;
    const spreadY = (index % 2 === 0 ? 1 : -1) * Math.floor(index / 2) * 22;

    return {
      ...raw,
      type,
      x: Number.isFinite(raw?.x) ? Number(raw.x) : slot.x + spreadX,
      y: Number.isFinite(raw?.y) ? Number(raw.y) : slot.y + spreadY,
    };
  });
}

function resolveMotion(actor: any, t: number, index: number) {
  const anim = String(actor.animation || "idle").toLowerCase();
  const phase = index * 0.8;

  let dx = 0;
  let dy = 0;
  let scale = 1;
  let rotation = 0;
  let alphaMul = 1;

  if (anim === "sway" || anim === "float") {
    dx = oscillate(t + phase, 1.2, -6, 6);
    dy = oscillate(t + phase * 0.6, 0.8, -4, 4);
  } else if (anim === "wobble_growth") {
    scale = 1 + Math.abs(Math.sin((t + phase) * 1.5)) * 0.1;
    dx = oscillate(t + phase, 1.35, -5, 5);
    dy = oscillate(t + phase * 0.65, 0.95, -4, 4);
  } else if (anim === "pulse" || anim === "glow" || anim === "shine") {
    scale = pulse(t + phase, 1.8, 0.08, 1);
  } else if (anim === "rotate" || anim === "spin") {
    rotation = (t + phase) * 0.8;
  } else if (anim === "bounce") {
    dy = -Math.abs(Math.sin((t + phase) * 3.2) * 14);
  } else if (anim === "strike") {
    const b = -Math.abs(Math.sin((t + phase) * 4.2) * 16);
    dy = b;
    const strikePulse = Math.pow(Math.max(0, Math.sin((t + phase) * 9.5)), 2);
    scale = 1 + strikePulse * 0.22;
  } else if (anim === "fall") {
    dy = Math.min(90, (t * 100) % 120);
    alphaMul = 0.75;
  } else if (anim === "drift") {
    dx = Math.sin((t + phase) * 0.9) * 12;
    dy = Math.sin((t + phase) * 0.6) * 9;
  } else if (anim === "float_in") {
    dx = Math.sin((t + phase) * 0.9) * 12;
    dy = Math.sin((t + phase) * 0.6) * 9;
  } else if (anim === "vibrate") {
    dx = Math.sin((t + phase) * 38) * 4.2;
    dy = Math.cos((t + phase) * 46) * 3.6;
  } else {
    dy = Math.sin((t + phase) * 0.7) * 3;
  }

  return { dx, dy, scale, rotation, alphaMul };
}

export function renderActors(
  actors: any[],
  ctx: Ctx,
  elapsedMs: number,
  W: number,
  H: number,
): number {
  const t = elapsedMs * 0.001;
  const laidOut = autoLayoutActors(actors || [], W, H);
  let drawn = 0;

  laidOut.forEach((actor, index) => {
    const delay = index * 180;
    const baseAlpha = fadeIn(elapsedMs, delay, 520);
    const timelineAlpha = computeTimelineAlpha(actor, elapsedMs, baseAlpha);
    const motion = resolveMotion(actor, t, index);
    const alpha = timelineAlpha * motion.alphaMul;
    if (alpha <= 0.005) return;

    const draw = ACTOR_RENDERERS[actor.type] ?? drawUnknownActor;

    const transformedActor = {
      ...actor,
      x: actor.x + motion.dx,
      y: actor.y + motion.dy,
      size: (actor.size ?? 40) * motion.scale,
    };

    ctx.save();
    if (motion.rotation) {
      ctx.translate(transformedActor.x, transformedActor.y);
      ctx.rotate(motion.rotation);
      ctx.translate(-transformedActor.x, -transformedActor.y);
    }
    draw(ctx, transformedActor, alpha, t, W, H);
    ctx.restore();
    drawn += 1;
  });

  return drawn;
}
