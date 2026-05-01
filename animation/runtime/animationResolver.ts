import type { SupportedAnimation } from "./types";

const ANIMATION_ALIASES: Record<string, SupportedAnimation> = {
  appear: "appear",
  show: "appear",
  fadein: "appear",
  fade_in: "appear",
  idle: "idle",
  still: "idle",
  pulse: "pulse",
  glow: "glow",
  shine: "glow",
  sway: "sway",
  wiggle: "sway",
  rotate: "rotate",
  spin: "rotate",
  grow: "grow",
  scaleup: "grow",
  scale_up: "grow",
  fall: "fall",
  drop: "fall",
  drift: "drift",
  float: "float",
  moveup: "float",
  move_up: "float",
};

export function resolveAnimationName(value: unknown): SupportedAnimation {
  const key = String(value || "idle")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "_");

  return ANIMATION_ALIASES[key] ?? "idle";
}

export function isKnownAnimation(value: unknown): boolean {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "_");
  return !!ANIMATION_ALIASES[key];
}
