import { animationDebug, animationWarn } from "./debug";
import { isKnownAnimation, resolveAnimationName } from "./animationResolver";
import type {
  BackendActor,
  BackendAnimationScript,
  BackendScene,
  NormalizedActor,
  NormalizedAnimationScript,
  NormalizedScene,
  NormalizedTimelineStep,
  SceneEnvironment,
} from "./types";

const DEFAULT_W = 800;
const DEFAULT_H = 600;

function n(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEnvironment(value: unknown): SceneEnvironment {
  const raw = String(value || "minimal").trim().toLowerCase();
  if (raw.includes("class")) return "classroom";
  if (raw.includes("nature") || raw.includes("outdoor")) return "nature";
  if (raw.includes("science") || raw.includes("lab")) return "science";
  return "minimal";
}

function defaultPosition(type: string) {
  const t = type.toLowerCase();
  if (t === "sun" || t === "star") return { x: 650, y: 110 };
  if (t === "plant" || t === "leaf") return { x: 250, y: 390 };
  if (t === "label") return { x: 400, y: 310 };
  return { x: 400, y: 300 };
}

function normalizedTimeline(timeline: unknown): NormalizedTimelineStep[] {
  if (!Array.isArray(timeline)) return [];
  const mapped: NormalizedTimelineStep[] = timeline
    .map((step: any) => ({
      at: Math.max(0, n(step?.at, 0)),
      action: resolveAnimationName(step?.action),
      alpha:
        typeof step?.alpha === "number"
          ? clamp(step.alpha, 0, 1)
          : typeof step?.opacity === "number"
            ? clamp(step.opacity, 0, 1)
            : undefined,
      x: typeof step?.x === "number" ? step.x : undefined,
      y: typeof step?.y === "number" ? step.y : undefined,
      dx: typeof step?.dx === "number" ? step.dx : undefined,
      dy: typeof step?.dy === "number" ? step.dy : undefined,
      scale: typeof step?.scale === "number" ? step.scale : undefined,
      rotation: typeof step?.rotation === "number" ? step.rotation : undefined,
      visible:
        typeof step?.visible === "boolean"
          ? step.visible
          : step?.action === "hide"
            ? false
            : undefined,
    }))
    .sort((a, b) => a.at - b.at);
  return mapped;
}

function normalizeActor(sceneIdx: number, actor: BackendActor, idx: number): NormalizedActor {
  const type = String(actor?.type || "label")
    .trim()
    .toLowerCase();
  const pos = defaultPosition(type);
  const x = clamp(n(actor?.x, pos.x), 30, DEFAULT_W - 30);
  const y = clamp(n(actor?.y, pos.y), 30, DEFAULT_H - 30);
  const animation = resolveAnimationName(actor?.animation);
  if (actor?.animation && !isKnownAnimation(actor.animation)) {
    animationWarn("normalize", "Unsupported actor.animation. Falling back.", {
      sceneIdx,
      actorType: type,
      animation: actor.animation,
    });
  }
  if (!Number.isFinite(Number(actor?.x)) || !Number.isFinite(Number(actor?.y))) {
    animationDebug("normalize", "Actor used fallback coordinates.", {
      sceneIdx,
      actorType: type,
      x,
      y,
    });
  }

  const timeline = normalizedTimeline(actor?.timeline);

  return {
    ...(actor || {}),
    id: `s${sceneIdx}-a${idx}`,
    type,
    x,
    y,
    animation,
    color: String(actor?.color || (type === "label" ? "#0F172A" : "#2563EB")),
    count: Math.max(1, Math.floor(n(actor?.count, 1))),
    size: Math.max(8, n(actor?.size, 42)),
    angle: n(actor?.angle, 0),
    length: Math.max(10, n(actor?.length, 120)),
    text: String(actor?.text || ""),
    fontSize: Math.max(10, n(actor?.fontSize, 18)),
    timeline,
  };
}

function normalizeScene(scene: BackendScene, idx: number, prevStart: number): NormalizedScene {
  const duration = Math.max(1200, n(scene?.duration, 4500));
  const startTime = Math.max(0, n(scene?.startTime, prevStart));
  const actorsRaw = Array.isArray(scene?.actors) ? scene.actors : [];
  const actors = actorsRaw.map((a, aIdx) => normalizeActor(idx, a, aIdx));

  if (actors.length === 0) {
    animationWarn("normalize", "Scene has no actors. Creating fallback label actor.", {
      sceneIdx: idx,
      sceneId: scene?.id,
    });
    actors.push(
      normalizeActor(
        idx,
        {
          type: "label",
          text: scene?.text || "Key idea",
          x: 400,
          y: 300,
          animation: "appear",
          color: "#0F172A",
          fontSize: 24,
        },
        0,
      ),
    );
  }

  return {
    id: String(scene?.id || `scene_${idx + 1}`),
    startTime,
    duration,
    text: String(scene?.text || ""),
    environment: normalizeEnvironment(scene?.environment),
    actors,
    raw: scene,
  };
}

export function normalizeAnimationScript(
  input: BackendAnimationScript | null | undefined,
): NormalizedAnimationScript {
  const raw = input || {};
  const scenesRaw = Array.isArray(raw.scenes) ? raw.scenes : [];

  if (scenesRaw.length === 0) {
    animationWarn("normalize", "Script has no scenes. Creating a single fallback scene.");
  }

  const builtRawScenes: BackendScene[] =
    scenesRaw.length > 0
      ? scenesRaw
      : [
          {
            id: "scene_1",
            startTime: 0,
            duration: n(raw.duration, 4500),
            text: "No animation data available",
            environment: "minimal",
            actors: [{ type: "label", text: "No animation data available" }],
          },
        ];

  let rollingStart = 0;
  const scenes = builtRawScenes
    .map((scene, idx) => {
      const normalized = normalizeScene(scene, idx, rollingStart);
      rollingStart = normalized.startTime + normalized.duration;
      return normalized;
    })
    .sort((a, b) => a.startTime - b.startTime);

  for (let i = 0; i < scenes.length; i++) {
    if (i === 0) {
      scenes[i].startTime = 0;
    } else if (scenes[i].startTime < scenes[i - 1].startTime + 100) {
      scenes[i].startTime = scenes[i - 1].startTime + scenes[i - 1].duration;
    }
  }

  const computedDuration = scenes.reduce(
    (max, s) => Math.max(max, s.startTime + s.duration),
    0,
  );

  return {
    title: String(raw.title || "Animation"),
    duration: Math.max(1000, n(raw.duration, computedDuration || 4500)),
    scenes,
    concept: String(raw.concept || raw.title || ""),
    raw,
  };
}
