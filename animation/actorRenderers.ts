/**
 * actorRenderers.ts - actor registry + timeline-driven runtime rendering.
 */

import {
  C,
  drawArrow,
  drawBolt,
  drawCO2,
  drawCloud,
  drawConceptPill,
  drawGlucose,
  drawPlanet,
  drawRock,
  drawSol,
  drawSunny,
  drawWaterDrop,
} from "./core/shapes";
import { fadeIn } from "./core/easing";
import { animationWarn } from "./runtime/debug";
import { resolveActorState } from "./runtime/timelineEngine";

type Ctx = any;

type RuntimeState = {
  x: number;
  y: number;
  alpha: number;
  scale: number;
  rotation: number;
  visible: boolean;
};

export type DrawFn = (
  ctx: Ctx,
  actor: any,
  state: RuntimeState,
  t: number,
  W: number,
  H: number,
) => void;

function drawTextLabel(ctx: Ctx, actor: any, state: RuntimeState) {
  if (!state.visible || state.alpha <= 0) return;

  const text = String(actor.text || "Concept");
  const color = actor.color || "#0F172A";
  const fontSize = Math.max(12, actor.fontSize || 18);
  const width = Math.min(680, Math.max(180, text.length * fontSize * 0.62));
  const height = fontSize + 18;

  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.rotate(state.rotation);
  ctx.scale(state.scale, state.scale);
  ctx.globalAlpha = state.alpha;

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(15,23,42,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(-width / 2, -height / 2, width, height, 12);
  } else {
    ctx.rect(-width / 2, -height / 2, width, height);
  }
  ctx.fill();
  ctx.stroke();

  if (typeof ctx.fillText === "function") {
    ctx.fillStyle = color;
    ctx.font = `700 ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, 0);
  } else {
    drawConceptPill(ctx, 0, 0, 1, color);
  }

  ctx.restore();
}

function drawLabelByText(ctx: Ctx, actor: any, state: RuntimeState, t: number) {
  if (!state.visible || state.alpha <= 0) return;
  const text = String(actor.text || "").replace(/\s/g, "");
  const cx = state.x;
  const cy = state.y;
  const r = Math.max(18, (actor.fontSize || 16) * 1.15);

  if (/h2o|water/i.test(text)) {
    drawWaterDrop(ctx, cx, cy, r * state.scale, state.alpha, actor.color || C.water);
    return;
  }
  if (/co2|carbondioxide|dioxide/i.test(text)) {
    drawCO2(ctx, cx, cy, r * 1.3 * state.scale, state.alpha);
    return;
  }
  if (/c6h12o6|glucose|sugar/i.test(text)) {
    drawGlucose(ctx, cx, cy, r * state.scale, state.alpha, t, actor.color || C.hexFill);
    return;
  }
  if (/energy|bolt|lightning/i.test(text)) {
    drawBolt(ctx, cx, cy, r * 0.9 * state.scale, state.alpha, actor.color || C.bolt);
    return;
  }

  drawTextLabel(ctx, actor, state);
}

export const ACTOR_RENDERERS: Record<string, DrawFn> = {
  arrow: (ctx, actor, state) =>
    drawArrow(
      ctx,
      state.x,
      state.y,
      (actor.angle ?? 0) + state.rotation,
      (actor.length ?? 120) * state.scale,
      actor.color || C.arrowDef,
      actor.thickness ?? 3,
      state.alpha,
    ),
  glucose: (ctx, actor, state, t) =>
    drawGlucose(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 40) * 0.85 * state.scale,
      state.alpha,
      t,
      actor.color || C.hexFill,
    ),
  water: (ctx, actor, state) =>
    drawWaterDrop(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 36) * 0.5 * state.scale,
      state.alpha,
      actor.color || C.water,
    ),
  waterdrop: (ctx, actor, state) =>
    drawWaterDrop(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 36) * 0.5 * state.scale,
      state.alpha,
      actor.color || C.water,
    ),
  co2: (ctx, actor, state) =>
    drawCO2(ctx, state.x, state.y, (actor.size ?? 36) * 0.5 * state.scale, state.alpha),
  molecule: (ctx, actor, state, t) => {
    const kind = String(actor.moleculeType || actor.extra?.moleculeType || "")
      .trim()
      .toLowerCase();
    if (kind === "water" || kind === "h2o") {
      drawWaterDrop(
        ctx,
        state.x,
        state.y,
        (actor.size ?? 36) * 0.5 * state.scale,
        state.alpha,
        actor.color || C.water,
      );
      return;
    }
    if (kind === "co2") {
      drawCO2(ctx, state.x, state.y, (actor.size ?? 36) * 0.5 * state.scale, state.alpha);
      return;
    }
    drawGlucose(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 40) * 0.65 * state.scale,
      state.alpha,
      t,
      actor.color || C.hexFill,
    );
  },
  bolt: (ctx, actor, state) =>
    drawBolt(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 36) * 0.5 * state.scale,
      state.alpha,
      actor.color || C.bolt,
    ),
  energy: (ctx, actor, state) =>
    drawBolt(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 36) * 0.5 * state.scale,
      state.alpha,
      actor.color || C.bolt,
    ),
  rock: (ctx, actor, state) =>
    drawRock(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 40) * 0.5 * state.scale,
      state.alpha,
      actor.color || C.rockMid,
    ),
  planet: (ctx, actor, state) =>
    drawPlanet(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 40) * state.scale,
      state.alpha,
      actor.color || "#42A5F5",
    ),
  earth: (ctx, actor, state) =>
    drawPlanet(
      ctx,
      state.x,
      state.y,
      (actor.size ?? 40) * state.scale,
      state.alpha,
      actor.color || "#4CAF50",
    ),
  cloud: (ctx, actor, state) =>
    drawCloud(
      ctx,
      state.x,
      state.y,
      ((actor.size ?? 40) / 30) * state.scale,
      state.alpha,
    ),
  leaf: (ctx, actor, state, t, W, H) =>
    drawSunny(ctx, state.x ?? W * 0.28, state.y ?? H * 0.65, t, false, state.scale, state.alpha),
  plant: (ctx, actor, state, t, W, H) =>
    drawSunny(ctx, state.x ?? W * 0.28, state.y ?? H * 0.65, t, false, state.scale, state.alpha),
  sun: (ctx, actor, state, t) =>
    drawSol(ctx, state.x, state.y, (actor.size ?? 52) * state.scale, t, state.alpha),
  star: (ctx, actor, state, t) =>
    drawSol(ctx, state.x, state.y, (actor.size ?? 52) * state.scale, t, state.alpha),
  label: (ctx, actor, state, t) => drawLabelByText(ctx, actor, state, t),
};

export function drawUnknownActor(
  ctx: Ctx,
  actor: any,
  state: RuntimeState,
  _t: number,
) {
  if (!state.visible || state.alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = state.alpha;
  ctx.translate(state.x, state.y);
  ctx.rotate(state.rotation);
  ctx.scale(state.scale, state.scale);

  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.strokeStyle = "rgba(15,23,42,0.2)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(-72, -24, 144, 48, 10);
  } else {
    ctx.rect(-72, -24, 144, 48);
  }
  ctx.fill();
  ctx.stroke();

  if (typeof ctx.fillText === "function") {
    ctx.fillStyle = actor.color || C.arrowDef;
    ctx.font = "700 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(actor.type || "actor").toUpperCase(), 0, 0);
  } else {
    drawConceptPill(ctx, 0, 0, 1, actor.color || C.arrowDef);
  }

  ctx.restore();
}

/**
 * Process backend actors and render using the registry.
 */
export function renderActors(
  actors: any[],
  ctx: Ctx,
  elapsed: number,
  W: number,
  H: number,
): number {
  const t = elapsed * 0.05;
  let visualActors = 0;

  for (const actor of actors || []) {
    const type = String(actor?.type || "label").toLowerCase();
    const draw = ACTOR_RENDERERS[type] ?? drawUnknownActor;

    const timelineState = resolveActorState(actor, elapsed, visualActors);
    const enterAlpha = fadeIn(elapsed, visualActors * 110, 500);
    const state = {
      ...timelineState,
      alpha: Math.max(0, Math.min(1, timelineState.alpha * enterAlpha)),
    };

    if (!ACTOR_RENDERERS[type]) {
      animationWarn("actors", "Unsupported actor.type. Rendering fallback.", {
        type,
      });
    }

    if (state.visible && state.alpha > 0.001) {
      draw(ctx, actor, state, t, W, H);
    }
    visualActors++;
  }

  return visualActors;
}
