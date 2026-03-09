import { clamp01, easeOut } from "../core/easing";
import { resolveAnimationName } from "./animationResolver";
import type { ActorRuntimeState, NormalizedActor } from "./types";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function stepState(step: {
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  alpha?: number;
  scale?: number;
  rotation?: number;
  visible?: boolean;
}) {
  return {
    x: step.x,
    y: step.y,
    dx: step.dx,
    dy: step.dy,
    alpha: step.alpha,
    scale: step.scale,
    rotation: step.rotation,
    visible: step.visible,
  };
}

export function resolveActorState(
  actor: NormalizedActor,
  elapsedMs: number,
  actorIndex: number,
): ActorRuntimeState {
  const baseDelay = actorIndex * 140;
  const t = Math.max(0, elapsedMs);
  let x = actor.x;
  let y = actor.y;
  let alpha = actor.animation === "appear" ? easeOut(clamp01((t - baseDelay) / 550)) : 1;
  let scale = actor.animation === "grow" ? 0.85 + easeOut(clamp01((t - baseDelay) / 650)) * 0.15 : 1;
  let rotation = actor.animation === "rotate" ? t * 0.0015 : 0;
  let visible = true;

  if (actor.animation === "pulse") {
    scale *= 1 + Math.sin(t * 0.01) * 0.05;
  } else if (actor.animation === "float") {
    y -= Math.sin(t * 0.004 + actorIndex) * 4;
  } else if (actor.animation === "drift") {
    x += Math.sin(t * 0.0025 + actorIndex * 0.7) * 6;
  } else if (actor.animation === "fall") {
    y += easeOut(clamp01((t - baseDelay) / 1000)) * 14;
  } else if (actor.animation === "glow") {
    alpha *= 0.75 + 0.25 * (0.5 + Math.sin(t * 0.007) * 0.5);
  }

  const timeline = actor.timeline;
  if (timeline.length > 0) {
    let current = timeline[0];
    let next: (typeof timeline)[number] | null = null;
    for (let i = 0; i < timeline.length; i++) {
      if (t >= timeline[i].at) {
        current = timeline[i];
        next = timeline[i + 1] ?? null;
      } else {
        next = timeline[i];
        break;
      }
    }

    const c = stepState(current);
    if (typeof c.x === "number") x = c.x;
    if (typeof c.y === "number") y = c.y;
    if (typeof c.dx === "number") x += c.dx;
    if (typeof c.dy === "number") y += c.dy;
    if (typeof c.alpha === "number") alpha *= c.alpha;
    if (typeof c.scale === "number") scale *= c.scale;
    if (typeof c.rotation === "number") rotation += c.rotation;
    if (typeof c.visible === "boolean") visible = c.visible;

    if (next && next.at > current.at) {
      const span = next.at - current.at;
      const tt = easeOut(clamp01((t - current.at) / span));
      const n = stepState(next);
      if (typeof c.alpha === "number" && typeof n.alpha === "number") {
        alpha *= lerp(c.alpha, n.alpha, tt);
      }
      if (typeof c.scale === "number" && typeof n.scale === "number") {
        scale *= lerp(c.scale, n.scale, tt);
      }
      if (typeof c.x === "number" && typeof n.x === "number") {
        x = lerp(c.x, n.x, tt);
      }
      if (typeof c.y === "number" && typeof n.y === "number") {
        y = lerp(c.y, n.y, tt);
      }
      if (typeof c.rotation === "number" && typeof n.rotation === "number") {
        rotation += lerp(c.rotation, n.rotation, tt);
      }
    }

    const latestAction = resolveAnimationName(current.action);
    if (latestAction === "appear" && typeof c.alpha !== "number") {
      alpha *= easeOut(clamp01((t - current.at) / 500));
    } else if (latestAction === "grow" && typeof c.scale !== "number") {
      scale *= 0.9 + easeOut(clamp01((t - current.at) / 700)) * 0.1;
    } else if (latestAction === "pulse") {
      scale *= 1 + Math.sin(t * 0.01 + actorIndex) * 0.04;
    }
  }

  return {
    x,
    y,
    alpha: clamp01(alpha),
    scale: Number.isFinite(scale) ? scale : 1,
    rotation: Number.isFinite(rotation) ? rotation : 0,
    visible,
  };
}
