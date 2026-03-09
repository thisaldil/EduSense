/**
 * animation/core/easing.ts
 * Shared timing and interpolation helpers for the canvas renderer.
 */

export const clamp01 = (value: number): number => {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
};

export const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

export const easeInQuad = (t: number): number => {
  const x = clamp01(t);
  return x * x;
};

export const easeOutQuad = (t: number): number => {
  const x = clamp01(t);
  return 1 - (1 - x) * (1 - x);
};

export const easeInOutQuad = (t: number): number => {
  const x = clamp01(t);
  if (x < 0.5) return 2 * x * x;
  return 1 - Math.pow(-2 * x + 2, 2) / 2;
};

export const easeOutCubic = (t: number): number => {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
};

export const smoothstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export const pingPong01 = (time: number): number => {
  const m = ((time % 2) + 2) % 2;
  return m <= 1 ? m : 2 - m;
};

export const pulse = (
  timeSeconds: number,
  speed = 1,
  amount = 0.08,
  base = 1,
): number => base + Math.sin(timeSeconds * speed) * amount;

export const oscillate = (
  timeSeconds: number,
  speed = 1,
  min = -1,
  max = 1,
): number => lerp(min, max, (Math.sin(timeSeconds * speed) + 1) * 0.5);

export const progress = (
  elapsedMs: number,
  startMs: number,
  durationMs: number,
): number => {
  const safeDuration = Math.max(1, durationMs);
  return clamp01((elapsedMs - startMs) / safeDuration);
};

export const fadeIn = (
  elapsedMs: number,
  delayMs = 0,
  durationMs = 500,
): number => easeOutQuad(progress(elapsedMs, delayMs, durationMs));

export const fadeOut = (
  elapsedMs: number,
  delayMs = 0,
  durationMs = 500,
): number => 1 - easeOutQuad(progress(elapsedMs, delayMs, durationMs));

export function rgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return `rgba(255,255,255,${clamp01(alpha)})`;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${clamp01(alpha)})`;
}

export type TimelineStep = {
  at: number;
  alpha?: number;
};

export function computeTimelineAlpha(
  actor: { timeline?: TimelineStep[] },
  elapsedMs: number,
  baseAlpha: number,
): number {
  const timeline = Array.isArray(actor?.timeline)
    ? actor.timeline
        .filter((step) => step && Number.isFinite(step.at))
        .sort((a, b) => a.at - b.at)
    : [];

  if (timeline.length === 0) return baseAlpha;

  let current: TimelineStep | null = null;
  let next: TimelineStep | null = null;

  for (let i = 0; i < timeline.length; i += 1) {
    const step = timeline[i];
    if (elapsedMs >= step.at) {
      current = step;
      next = timeline[i + 1] ?? null;
      continue;
    }
    next = step;
    break;
  }

  if (!current) return baseAlpha;

  const hasCurrentAlpha = typeof current.alpha === "number";
  const hasNextAlpha = typeof next?.alpha === "number";

  if (!hasCurrentAlpha && !hasNextAlpha) return baseAlpha;

  if (hasCurrentAlpha && hasNextAlpha && next && next.at > current.at) {
    const t = easeInOutQuad((elapsedMs - current.at) / (next.at - current.at));
    const mixed = lerp(current.alpha as number, next.alpha as number, t);
    return baseAlpha * mixed;
  }

  if (hasCurrentAlpha) {
    return baseAlpha * (current.alpha as number);
  }

  return baseAlpha;
}
