import type { NormalizedAnimationScript, NormalizedScene } from "./types";

export function getSceneAtTime(
  script: NormalizedAnimationScript,
  timeMs: number,
): { scene: NormalizedScene; index: number } {
  const scenes = script.scenes;
  if (scenes.length === 0) {
    throw new Error("Animation script has no scenes.");
  }

  const clamped = Math.max(0, Math.min(timeMs, script.duration));
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (clamped >= scenes[i].startTime) {
      return { scene: scenes[i], index: i };
    }
  }
  return { scene: scenes[0], index: 0 };
}
