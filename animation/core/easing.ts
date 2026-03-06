/**
 * core/easing.ts — Animation math helpers.
 * Used by shapes, domain fallbacks, and timeline interpolation.
 */

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const easeOut = (t: number): number => t * (2 - t);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Returns 0→1 over `dur` ms starting at `startMs` ms into the scene. */
export const fadeIn = (
  elapsed: number,
  startMs = 0,
  dur = 600,
): number => easeOut(clamp01((elapsed - startMs) / dur));

export function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Timeline step from backend (actor.timeline[].at, .alpha, etc.) */
export type TimelineStep = { at: number; alpha?: number };

/**
 * Combine base alpha with actor.timeline envelope.
 * Used by orchestrator when drawing actors.
 */
export function computeTimelineAlpha(
  actor: { timeline?: TimelineStep[] },
  elapsed: number,
  baseAlpha: number,
): number {
  const timeline = actor?.timeline;
  if (!timeline || timeline.length === 0) return baseAlpha;

  let current: TimelineStep | null = null;
  let next: TimelineStep | null = null;

  for (let i = 0; i < timeline.length; i++) {
    const step = timeline[i];
    if (elapsed >= step.at) {
      current = step;
      next = timeline[i + 1] ?? null;
    } else {
      next = step;
      break;
    }
  }

  if (!current) return baseAlpha;

  const hasCurrentAlpha = typeof current.alpha === "number";
  const hasNextAlpha = next && typeof next.alpha === "number";
  if (!hasCurrentAlpha && !hasNextAlpha) return baseAlpha;

  if (hasCurrentAlpha && hasNextAlpha && next!.at > current.at) {
    const span = next!.at - current.at || 1;
    const t = easeOut(clamp01((elapsed - current.at) / span));
    const interp =
      (current.alpha as number) +
      ((next!.alpha as number) - (current.alpha as number)) * t;
    return baseAlpha * interp;
  }

  if (hasCurrentAlpha) return baseAlpha * (current.alpha as number);
  return baseAlpha;
}
