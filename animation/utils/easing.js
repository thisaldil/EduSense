/**
 * Shared easing helpers for actors and animation engine.
 * Kept in plain JS so existing actor files can import it directly.
 */

export function applyEasing(t, type = "linear") {
  if (type === "easeInOut") {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  if (type === "easeOut") {
    return t * (2 - t);
  }
  return t;
}

export function interpolate(from, to, t, easing = "linear") {
  const eased = applyEasing(t, easing);
  return from + (to - from) * eased;
}

