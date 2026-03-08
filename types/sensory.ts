import type { animationApi } from "@/services/api";

// Backend wire types (shape of /api/sensory/overlay response)
export type BackendHapticCue = {
  at: number;
  pattern: string;
  scene_id?: string;
  channel?: string;
  intensity?: number;
};

export type BackendNarrationCue = {
  at: number;
  text: string;
  duration: number;
};

export type BackendSensoryOverlay = {
  cognitive_state: string;
  ambient_mode: "silence" | "40hz_gamma" | "spatial_music";
  speech_rate: "slow" | "normal" | "fast";
  haptics: BackendHapticCue[];
  narration: BackendNarrationCue[];
  research_metrics: Record<string, any>;
};

// Frontend-friendly types used by the player (Member 3)
export type HapticCue = {
  id: string;
  atMs: number;
  pattern: string;
  sceneId?: string;
  channel?: string;
  intensity?: number;
};

/** Narration cue for TTS; backend sends as narration[]. */
export type NarrationCue = {
  id: string;
  atMs: number;
  text: string;
  durationMs: number;
};

/** @deprecated Use NarrationCue */
export type AudioCue = NarrationCue;

export type SensoryOverlay = {
  cognitiveState: string;
  ambientMode: "silence" | "40hz_gamma" | "spatial_music";
  speechRate: "slow" | "normal" | "fast";
  haptics: HapticCue[];
  narration: NarrationCue[];
  researchMetrics: Record<string, any>;
};

type NeuroAdaptiveAnimationScript = animationApi.NeuroAdaptiveAnimationScript;

/**
 * Map raw backend overlay JSON into strongly-typed frontend overlay.
 * Optionally attaches sceneId to cues by mapping cue times into scene windows.
 */
export function mapBackendOverlayToSensoryOverlay(
  backend: BackendSensoryOverlay,
  script: NeuroAdaptiveAnimationScript,
): SensoryOverlay {
  const scenes = script.scenes ?? [];

  const findSceneIdForTime = (t: number): string | undefined => {
    if (!scenes.length) return undefined;
    const scene =
      [...scenes].reverse().find((s) => t >= s.startTime) ?? scenes[0];
    return scene.id;
  };

  const haptics = backend.haptics.map((h, index) => ({
    id: `${h.scene_id ?? "global"}:${index}:${h.at}`,
    atMs: h.at,
    pattern: h.pattern as HapticCue["pattern"],
    sceneId: h.scene_id ?? findSceneIdForTime(h.at),
    channel: h.channel,
    intensity: h.intensity,
  }));

  const narration = backend.narration.map((n, index) => ({
    id: `narration:${index}:${n.at}`,
    atMs: n.at,
    durationMs: n.duration,
    text: n.text,
  }));

  return {
    cognitiveState: backend.cognitive_state,
    ambientMode: backend.ambient_mode,
    speechRate: backend.speech_rate,
    haptics,
    narration,
    researchMetrics: backend.research_metrics ?? {},
  };
}

