/**
 * animation/scriptNormalizer.ts
 * Sanitizes backend animation scripts for renderer safety.
 */

import { repairSceneActors } from "./scriptRepair";

export interface RawActor {
  type?: string;
  x?: number | null;
  y?: number | null;
  animation?: string;
  color?: string | null;
  size?: number | null;
  count?: number | null;
  angle?: number | null;
  length?: number | null;
  text?: string;
  fontSize?: number | null;
  timeline?: { at: number; action?: string; alpha?: number }[];
  [key: string]: any;
}

export interface RawScene {
  id?: string;
  startTime?: number;
  duration?: number;
  text?: string;
  actors?: RawActor[];
  environment?: string;
  meta?: Record<string, any>;
  [key: string]: any;
}

export interface RawScript {
  title?: string;
  duration?: number;
  concept?: string;
  scenes?: RawScene[];
  [key: string]: any;
}

export interface NormalizedActor extends RawActor {
  type: string;
  x: number | null;
  y: number | null;
  animation: string;
  color: string;
  size: number;
  text: string;
  fontSize: number;
  timeline: { at: number; action?: string; alpha?: number }[];
}

export interface NormalizedScene {
  id: string;
  startTime: number;
  duration: number;
  text: string;
  actors: NormalizedActor[];
  environment: string;
  meta: Record<string, any>;
}

export interface NormalizedScript {
  title: string;
  duration: number;
  concept: string;
  scenes: NormalizedScene[];
}

const DEFAULT_SCENE_DURATION = 6000;
const warnings: string[] = [];

const DEFAULT_COLORS: Record<string, string> = {
  sun: "#FACC15",
  plant: "#4CAF50",
  root: "#6D4C41",
  cloud: "#FFFFFF",
  water: "#29B6F6",
  waterdrop: "#29B6F6",
  co2: "#90A4AE",
  oxygen: "#22C55E",
  glucose: "#FB923C",
  bolt: "#A855F7",
  arrow: "#1565C0",
  line: "#1565C0",
  rock: "#795548",
  planet: "#42A5F5",
  volcano: "#6D4C41",
  label: "#2563EB",
  thermometer: "#EF4444",
  bulb: "#FACC15",
  ear: "#F59E0B",
  molecule: "#29B6F6",
  animal: "#D9A56F",
  sun_character: "#FACC15",
  plant_character: "#4CAF50",
  co2_bubble: "#90A4AE",
  water_drop: "#29B6F6",
  energy_bolt: "#A855F7",
  glucose_hexagon: "#FB923C",
  tuning_fork: "#F59E0B",
  wave_emitter: "#1565C0",
  air_particle: "#29B6F6",
};

/** Backend metaphor + canonical actor types (normalizer does not strip unknown types). */
const KNOWN_ACTOR_TYPES = new Set([
  "sun",
  "plant",
  "root",
  "cloud",
  "waterdrop",
  "water",
  "co2",
  "oxygen",
  "glucose",
  "bolt",
  "arrow",
  "line",
  "label",
  "animal",
  "planet",
  "volcano",
  "rock",
  "thermometer",
  "molecule",
  "bulb",
  "ear",
  "bird",
  "fish",
  "frog",
  "snake",
  "rabbit",
  "deer",
  "goat",
  "lion",
  "fox",
  "star",
  "moon",
  "leaf",
  "tree",
  "cell",
  "chloroplast",
  "water_drop",
  "sun_character",
  "plant_character",
  "co2_bubble",
  "energy_bolt",
  "glucose_hexagon",
  "tuning_fork",
  "wave_emitter",
  "air_particle",
]);

function warn(message: string) {
  warnings.push(message);
  try {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn(`[ScriptNormalizer] ${message}`);
    }
  } catch {
    // no-op
  }
}

function cleanType(type: any): string {
  const raw = String(type || "label").trim().toLowerCase();
  return raw.replace(/\s+/g, "_");
}

function normalizeTimeline(raw: any): { at: number; action?: string; alpha?: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((step) => step && Number.isFinite(step.at))
    .map((step) => ({
      at: Math.max(0, Number(step.at)),
      action: step.action ? String(step.action) : undefined,
      alpha: typeof step.alpha === "number" ? step.alpha : undefined,
    }))
    .sort((a, b) => a.at - b.at);
}

function normalizeActor(raw: RawActor, index: number, sceneId: string): NormalizedActor {
  const type = cleanType(raw.type);
  const timeline = normalizeTimeline(raw.timeline);

  const x = Number.isFinite(raw.x) ? Number(raw.x) : null;
  const y = Number.isFinite(raw.y) ? Number(raw.y) : null;
  if (x == null || y == null) {
    warn(`Scene "${sceneId}" actor[${index}] "${type}" is missing x/y. Auto-layout will place it.`);
  }

  if (!KNOWN_ACTOR_TYPES.has(type)) {
    warn(
      `Scene "${sceneId}" actor[${index}] has unrecognized type "${type}". It may render as a fallback shape.`,
    );
  }

  return {
    ...raw,
    type,
    x,
    y,
    animation: String(raw.animation || "appear").toLowerCase().trim(),
    color: String(raw.color || DEFAULT_COLORS[type] || DEFAULT_COLORS.label),
    size: Number.isFinite(raw.size) && Number(raw.size) > 0 ? Number(raw.size) : 40,
    text: String(raw.text || ""),
    fontSize: Number.isFinite(raw.fontSize) && Number(raw.fontSize) > 0 ? Number(raw.fontSize) : 14,
    timeline,
  };
}

function normalizeScene(raw: RawScene, index: number, fallbackStart: number): NormalizedScene {
  const id = String(raw.id || `scene_${index}`);
  let duration =
    Number.isFinite(raw.duration) && Number(raw.duration) > 0
      ? Number(raw.duration)
      : DEFAULT_SCENE_DURATION;
  const startTime =
    Number.isFinite(raw.startTime) && Number(raw.startTime) >= 0
      ? Number(raw.startTime)
      : fallbackStart;
  let actors = Array.isArray(raw.actors)
    ? raw.actors.map((actor, actorIndex) => normalizeActor(actor || {}, actorIndex, id))
    : [];

  const repaired = repairSceneActors(actors, duration, String(raw.text || ""));
  actors = repaired.actors as NormalizedActor[];
  duration = repaired.duration;

  if (actors.length === 0 && raw.text) {
    warn(`Scene "${id}" has narration text but no visual actors.`);
  }

  return {
    id,
    startTime,
    duration,
    text: String(raw.text || ""),
    actors,
    environment: String(raw.environment || "").toLowerCase().trim(),
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {},
  };
}

function createFallbackScript(title = "Untitled Animation"): NormalizedScript {
  return {
    title,
    concept: title,
    duration: DEFAULT_SCENE_DURATION,
    scenes: [
      {
        id: "fallback_scene",
        startTime: 0,
        duration: DEFAULT_SCENE_DURATION,
        text: "Animation data is loading...",
        actors: [],
        environment: "minimal",
        meta: {},
      },
    ],
  };
}

export function normalizeScript(raw: RawScript | any): NormalizedScript {
  warnings.length = 0;

  if (!raw || typeof raw !== "object") {
    warn("Invalid script payload received. Generated fallback scene.");
    return createFallbackScript();
  }

  const title = String(raw.title || "Untitled Animation");
  const concept = String(raw.concept || raw.title || "");
  const rawScenes = Array.isArray(raw.scenes) ? raw.scenes : [];

  if (rawScenes.length === 0) {
    warn("Script has no scenes. Generated fallback scene.");
    return createFallbackScript(title);
  }

  const scenes: NormalizedScene[] = [];
  let fallbackStart = 0;

  for (let i = 0; i < rawScenes.length; i += 1) {
    const scene = normalizeScene(rawScenes[i] || {}, i, fallbackStart);
    scenes.push(scene);
    fallbackStart = scene.startTime + scene.duration;
  }

  scenes.sort((a, b) => a.startTime - b.startTime);

  // Fill missing/overlapping start times after sort.
  let currentStart = 0;
  for (let i = 0; i < scenes.length; i += 1) {
    if (!Number.isFinite(scenes[i].startTime) || scenes[i].startTime < currentStart) {
      scenes[i].startTime = currentStart;
    }
    currentStart = scenes[i].startTime + scenes[i].duration;
  }

  const computedDuration = scenes.reduce(
    (max, scene) => Math.max(max, scene.startTime + scene.duration),
    0,
  );
  const duration =
    Number.isFinite(raw.duration) && Number(raw.duration) > 0
      ? Math.max(Number(raw.duration), computedDuration)
      : computedDuration;

  return { title, concept, duration, scenes };
}

export function getLastNormalizationWarnings(): string[] {
  return [...warnings];
}

declare let __DEV__: boolean | undefined;
