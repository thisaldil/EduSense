/**
 * animation/scriptGenerator.ts
 * High-level concept -> engine-ready script.
 * Updated to match the current actor renderer + domain system.
 */

export const ENGINE_CAPABILITIES = {
  actors: [
    "leaf", "root", "plant", "cell", "molecule", "sun", "glucose", "arrow", "label", "line",
    "planet", "earth", "moon", "star", "animal", "bird", "fish", "frog", "snake", "rock",
    "cloud", "thermometer", "volcano",
  ],
  animations: [
    "idle", "appear", "pulse", "sway", "rotate", "vibrate", "shine", "grow", "absorb",
    "orbit", "spin", "fall", "glow", "bounce", "float", "drift",
  ],
  moleculeTypes: ["water", "co2", "o2", "glucose"],
  defaultDurations: {
    short: 4000,
    medium: 6000,
    long: 8000,
    veryLong: 10000,
  },
};

const ACTOR_MAPPINGS: Record<string, (config?: any) => any> = {
  leaf: (config = {}) => ({ type: "leaf", size: config.size || 38, color: config.color || "#4CAF50", ...config }),
  root: (config = {}) => ({ type: "root", color: config.color || "#8B4513", ...config }),
  plant: (config = {}) => ({ type: "plant", color: config.color || "#2E7D32", ...config }),
  cell: (config = {}) => ({ type: "cell", size: config.size || 80, ...config }),
  molecule: (config = {}) => ({ type: "molecule", moleculeType: config.moleculeType || "water", size: config.size || 30, ...config }),
  sun: (config = {}) => ({ type: "sun", size: config.size || 60, ...config }),
  earth: (config = {}) => ({ type: "earth", size: config.size || 70, ...config }),
  moon: (config = {}) => ({ type: "planet", size: config.size || 30, color: "#B0BEC5", ...config }),
  planet: (config = {}) => ({ type: "planet", size: config.size || 40, color: config.color || "#4A90E2", ...config }),
  arrow: (config = {}) => ({ type: "arrow", length: config.length || 100, angle: config.angle || 0, color: config.color || "#1565C0", thickness: config.thickness || 4, ...config }),
  label: (config = {}) => ({ type: "label", text: config.text || "Label", fontSize: config.fontSize || 14, color: config.color || "#1E3A8A", ...config }),
  line: (config = {}) => ({ type: "line", x1: config.x1, y1: config.y1, x2: config.x2, y2: config.y2, color: config.color || "#000000", thickness: config.thickness || 2, ...config }),
  glucose: (config = {}) => ({ type: "glucose", ...config }),
  cloud: (config = {}) => ({ type: "cloud", size: config.size || 42, ...config }),
  thermometer: (config = {}) => ({ type: "thermometer", size: config.size || 1, temp: config.temp ?? 0.6, ...config }),
  rock: (config = {}) => ({ type: "rock", size: config.size || 44, ...config }),
  volcano: (config = {}) => ({ type: "volcano", size: config.size || 58, ...config }),
  animal: (config = {}) => ({ type: config.species || "animal", size: config.size || 40, ...config }),
};

const ANIMATION_MAPPINGS: Record<string, string> = {
  shine: "shine",
  sway: "sway",
  appear: "appear",
  absorb: "absorb",
  grow: "grow",
  pulse: "pulse",
  rotate: "rotate",
  vibrate: "vibrate",
  orbit: "orbit",
  spin: "spin",
  idle: "idle",
  glow: "glow",
  fall: "fall",
  bounce: "bounce",
  float: "float",
  drift: "drift",
};

class PositionGenerator {
  constructor(private canvasWidth = 800, private canvasHeight = 600) { }

  getPosition(actorType: string, context: any = {}) {
    switch (String(actorType).toLowerCase()) {
      case "sun": return { x: context.x ?? this.canvasWidth - 120, y: context.y ?? 86 };
      case "cloud": return { x: context.x ?? this.canvasWidth * 0.65, y: context.y ?? 82 };
      case "leaf": return { x: context.x ?? 240, y: context.y ?? 360 };
      case "root": return { x: context.x ?? 230, y: context.y ?? 430 };
      case "plant": return { x: context.x ?? 220, y: context.y ?? 390 };
      case "earth":
      case "planet": return { x: context.x ?? this.canvasWidth / 2, y: context.y ?? this.canvasHeight / 2 };
      case "molecule": return { x: context.x ?? this.canvasWidth * 0.55, y: context.y ?? this.canvasHeight * 0.42 };
      default: return { x: context.x ?? this.canvasWidth / 2, y: context.y ?? this.canvasHeight / 2 };
    }
  }

  getArrowConfig(from: { x: number; y: number }, to: { x: number; y: number }, offset = 20) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.max(50, Math.sqrt(dx * dx + dy * dy) - offset * 2);
    return {
      x: from.x + Math.cos(angle) * offset,
      y: from.y + Math.sin(angle) * offset,
      angle,
      length,
    };
  }
}

function assignTiming(scenes: any[], defaultDuration = 6000) {
  let startTime = 0;
  return (scenes || []).map((scene) => {
    const duration = typeof scene.duration === "string"
      ? ENGINE_CAPABILITIES.defaultDurations[scene.duration as keyof typeof ENGINE_CAPABILITIES.defaultDurations] || defaultDuration
      : typeof scene.duration === "number"
        ? scene.duration
        : defaultDuration;
    const out = { ...scene, startTime, duration };
    startTime += duration;
    return out;
  });
}

function generateVisualAids(actors: any[], positionGen: PositionGenerator) {
  const aids: any[] = [];
  const molecules = actors.filter((a) => a.type === "molecule");
  const targets = actors.filter((a) => ["root", "leaf", "cell", "plant"].includes(a.type));
  molecules.forEach((m, i) => {
    const target = targets[i % Math.max(1, targets.length)];
    if (!target || m.x == null || m.y == null || target.x == null || target.y == null) return;
    aids.push({
      type: "arrow",
      ...positionGen.getArrowConfig({ x: m.x, y: m.y }, { x: target.x, y: target.y }, 26),
      color: "#2196F3",
      animation: "appear",
    });
  });
  return aids;
}

export function generateScript(concept: any, options: any = {}) {
  const {
    canvasWidth = 800,
    canvasHeight = 600,
    defaultDuration = 6000,
    autoGenerateArrows = true,
    autoGenerateLabels = true,
  } = options;

  const pos = new PositionGenerator(canvasWidth, canvasHeight);
  const timedScenes = assignTiming(concept.scenes || [], defaultDuration);

  const mappedScenes = timedScenes.map((scene: any, sceneIndex: number) => {
    const actors: any[] = [];
    const aids: any[] = [];

    (scene.actors || []).forEach((actorSpec: any, idx: number) => {
      let actorType = actorSpec;
      let actorConfig: any = {};
      let animation: string | null = null;

      if (typeof actorSpec === "object") {
        actorType = actorSpec.type || actorSpec.name || actorSpec;
        actorConfig = { ...actorSpec };
        animation = actorSpec.animation || actorSpec.action || null;
      }
      if (!animation && scene.actions?.[idx]) animation = ANIMATION_MAPPINGS[scene.actions[idx]] || scene.actions[idx];

      const mapper = ACTOR_MAPPINGS[String(actorType).toLowerCase()] || ACTOR_MAPPINGS.animal;
      const position = pos.getPosition(String(actorType), actorConfig);
      actors.push(mapper({ ...actorConfig, ...position, animation: animation || actorConfig.animation || "idle" }));
    });

    if (autoGenerateArrows) aids.push(...generateVisualAids(actors, pos));
    if (autoGenerateLabels && Array.isArray(scene.labels)) {
      scene.labels.forEach((labelSpec: any) => {
        const label = typeof labelSpec === "string" ? { text: labelSpec } : labelSpec;
        aids.push({ type: "label", text: label.text || "", x: label.x ?? 400, y: label.y ?? 70, fontSize: label.fontSize || 14, color: label.color || "#1E3A8A" });
      });
    }

    return {
      id: scene.id || `scene_${sceneIndex}`,
      startTime: scene.startTime,
      duration: scene.duration,
      text: scene.text || "",
      environment: scene.environment || "",
      actors: [...actors, ...aids],
    };
  });

  const totalDuration = mappedScenes.reduce((m, s) => Math.max(m, s.startTime + s.duration), 0);
  return {
    title: concept.title || "Generated Animation",
    concept: concept.concept || concept.title || "",
    duration: totalDuration,
    scenes: mappedScenes,
  };
}

export default {
  generateScript,
  ENGINE_CAPABILITIES,
};
