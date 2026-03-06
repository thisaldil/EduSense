/**
 * actorRenderers.ts — Maps actor.type → draw function.
 * Replaces the previous inline switch in sceneRenderers; single place to add new types.
 */

import {
  C,
  drawArrow,
  drawBolt,
  drawCloud,
  drawCO2,
  drawConceptPill,
  drawGlucose,
  drawPlanet,
  drawRock,
  drawSol,
  drawSunny,
  drawWaterDrop,
} from "./core/shapes";
import { computeTimelineAlpha, fadeIn } from "./core/easing";

type Ctx = any;

export type DrawFn = (
  ctx: Ctx,
  actor: any,
  alpha: number,
  t: number,
  W: number,
  H: number,
) => void;

function drawLabelByText(
  ctx: Ctx,
  actor: any,
  alpha: number,
  t: number,
  W: number,
  H: number,
): void {
  if (alpha <= 0) return;
  const text = (actor.text || "").replace(/\s/g, "");
  const cx = actor.x ?? 400;
  const cy = actor.y ?? 300;
  const r = Math.max(18, (actor.fontSize || 16) * 1.15);
  const color = actor.color || C.arrowDef;

  if (/h₂o|h2o|water/i.test(text)) {
    drawWaterDrop(ctx, cx, cy, r, alpha, actor.color || C.water);
    return;
  }
  if (/co₂|co2|carbondioxide|dioxide/i.test(text)) {
    drawCO2(ctx, cx, cy, r * 1.3, alpha);
    return;
  }
  if (/c₆h₁₂o₆|glucose|sugar/i.test(text)) {
    drawGlucose(ctx, cx, cy, r, alpha, t, actor.color || C.hexFill);
    return;
  }
  if (/energy|bolt|lightning/i.test(text)) {
    drawBolt(ctx, cx, cy, r * 0.9, alpha, actor.color || C.bolt);
    return;
  }
  drawConceptPill(ctx, cx, cy, alpha, color);
}

export const ACTOR_RENDERERS: Record<string, DrawFn> = {
  arrow: (ctx, actor, alpha, _t, _W, _H) =>
    drawArrow(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      actor.angle ?? 0,
      actor.length ?? 120,
      actor.color || C.arrowDef,
      actor.thickness ?? 3,
      alpha,
    ),
  glucose: (ctx, actor, alpha, t, _W, _H) =>
    drawGlucose(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      (actor.size ?? 40) * 0.85,
      alpha,
      t,
      actor.color || C.hexFill,
    ),
  water: (ctx, actor, alpha, _t, _W, _H) =>
    drawWaterDrop(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      (actor.size ?? 36) * 0.5,
      alpha,
      actor.color || C.water,
    ),
  co2: (ctx, actor, alpha, _t, _W, _H) =>
    drawCO2(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      (actor.size ?? 36) * 0.5,
      alpha,
    ),
  bolt: (ctx, actor, alpha, _t, _W, _H) =>
    drawBolt(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      (actor.size ?? 36) * 0.5,
      alpha,
      actor.color || C.bolt,
    ),
  energy: (ctx, actor, alpha, _t, _W, _H) =>
    drawBolt(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      (actor.size ?? 36) * 0.5,
      alpha,
      actor.color || C.bolt,
    ),
  rock: (ctx, actor, alpha, _t, _W, _H) =>
    drawRock(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      (actor.size ?? 40) * 0.5,
      alpha,
      actor.color || C.rockMid,
    ),
  planet: (ctx, actor, alpha, _t, _W, _H) =>
    drawPlanet(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      actor.size ?? 40,
      alpha,
      actor.color || "#42A5F5",
    ),
  earth: (ctx, actor, alpha, _t, _W, _H) =>
    drawPlanet(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      actor.size ?? 40,
      alpha,
      actor.color || "#4CAF50",
    ),
  cloud: (ctx, actor, alpha, _t, _W, _H) =>
    drawCloud(
      ctx,
      actor.x ?? 300,
      actor.y ?? 100,
      (actor.size ?? 40) / 30,
      alpha,
    ),
  leaf: (ctx, actor, alpha, t, W, H) =>
    drawSunny(
      ctx,
      actor.x ?? W * 0.28,
      actor.y ?? H * 0.65,
      t,
      false,
      1,
      alpha,
    ),
  plant: (ctx, actor, alpha, t, W, H) =>
    drawSunny(
      ctx,
      actor.x ?? W * 0.28,
      actor.y ?? H * 0.65,
      t,
      false,
      1,
      alpha,
    ),
  sun: (ctx, actor, alpha, t, _W, _H) =>
    drawSol(
      ctx,
      actor.x ?? 400,
      actor.y ?? 300,
      actor.size ?? 52,
      t,
      alpha,
    ),
  label: (ctx, actor, alpha, t, W, H) =>
    drawLabelByText(ctx, actor, alpha, t, W, H),
};

/**
 * Default renderer for unknown actor types — concept pill.
 */
export function drawUnknownActor(
  ctx: Ctx,
  actor: any,
  alpha: number,
  _t: number,
  W: number,
  H: number,
): void {
  drawConceptPill(
    ctx,
    actor.x ?? 400,
    actor.y ?? 300,
    alpha,
    actor.color || C.arrowDef,
  );
}

/**
 * Process backend actors: skip black labels, apply stagger + timeline alpha,
 * dispatch to ACTOR_RENDERERS. Returns the number of visual actors drawn.
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
    const type = (actor.type || "label").toLowerCase();
    const color = (actor.color || "").toUpperCase();

    if (
      type === "label" &&
      (color === "#000000" || color === "#000" || !actor.color)
    )
      continue;

    const delay = visualActors * 400;
    const baseAlpha = fadeIn(elapsed, delay, 600);
    visualActors++;

    const alpha = computeTimelineAlpha(actor, elapsed, baseAlpha);
    if (alpha <= 0) continue;

    const draw = ACTOR_RENDERERS[type] ?? drawUnknownActor;
    draw(ctx, actor, alpha, t, W, H);
  }

  return visualActors;
}
